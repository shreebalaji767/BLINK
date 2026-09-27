"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SignOutButton from "@/components/blink/auth/SignOutButton";

type Tab = "camera" | "chat" | "friends" | "stories" | "map" | "profile";
type Person = { id:string; username:string|null; display_name:string|null; avatar_url:string|null; online?:boolean };
type Message = { id:string; conversation_id:string; sender_id:string; body:string|null; media_path:string|null; message_type:string; created_at:string; expires_at:string; deleted_at:string|null };
type Story = { id:string; user_id:string; media_path:string; media_type:string; caption:string|null; created_at:string; expires_at:string };
type Snap = { id:string; sender_id:string; media_path:string; media_type:string; caption:string|null; duration_seconds:number; created_at:string; expires_at:string };

const supabase = createClient();

function Avatar({person,size="normal"}:{person?:Person|null;size?:string}) {
  const label=(person?.display_name||person?.username||"?").slice(0,1).toUpperCase();
  return <span className={"blink-avatar "+(size==="large"?"large":"")}>{person?.avatar_url?<img src={person.avatar_url} alt="" />:label}</span>;
}

export default function BlinkApp({ email }:{email:string}) {
  const [tab,setTab]=useState<Tab>("camera");
  const [me,setMe]=useState("");
  const [profile,setProfile]=useState<Person|null>(null);
  const [people,setPeople]=useState<Person[]>([]);
  const [friends,setFriends]=useState<Person[]>([]);
  const [requests,setRequests]=useState<Person[]>([]);
  const [query,setQuery]=useState("");
  const [messages,setMessages]=useState<Message[]>([]);
  const [conversationId,setConversationId]=useState("");
  const [activeFriend,setActiveFriend]=useState<Person|null>(null);
  const [message,setMessage]=useState("");
  const [stories,setStories]=useState<Story[]>([]);
  const [snaps,setSnaps]=useState<Snap[]>([]);
  const [selectedRecipients,setSelectedRecipients]=useState<string[]>([]);
  const [snapCaption,setSnapCaption]=useState("");
  const [toast,setToast]=useState("");
  const [busy,setBusy]=useState(false);
  const [cameraOn,setCameraOn]=useState(false);
  const [flash,setFlash]=useState(false);
  const [snapPreview,setSnapPreview]=useState("");
  const [storyFile,setStoryFile]=useState<File|null>(null);
  const [mapGhost,setMapGhost]=useState(true);
  const videoRef=useRef<HTMLVideoElement>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const chatFileRef=useRef<HTMLInputElement>(null);
  const snapFileRef=useRef<HTMLInputElement>(null);
  const storyFileRef=useRef<HTMLInputElement>(null);

  function notify(text:string){setToast(text);window.setTimeout(()=>setToast(""),2400)}

  async function loadProfile(userId:string) {
    const {data}=await supabase.from("profiles").select("id,username,display_name,avatar_url").eq("id",userId).maybeSingle();
    if(data)setProfile(data);
  }

  async function loadFriends(userId:string) {
    const {data}=await supabase.from("friendships").select("requester_id,addressee_id,status").eq("status","accepted");
    const ids=(data||[]).flatMap((r:any)=>r.requester_id===userId?[r.addressee_id]:r.addressee_id===userId?[r.requester_id]:[]);
    if(ids.length){
      const {data:p}=await supabase.rpc("get_blink_profiles",{ids});
      setFriends((p||[]).map((x:any)=>({...x,online:false})));
    } else setFriends([]);
    const incoming=(data||[]).filter((r:any)=>r.addressee_id===userId&&r.status==="pending").map((r:any)=>r.requester_id);
    if(incoming.length){const {data:p}=await supabase.rpc("get_blink_profiles",{ids:incoming});setRequests(p||[])} else setRequests([]);
  }

  async function loadStories(userId:string) {
    const {data}=await supabase.from("stories").select("*").gt("expires_at",new Date().toISOString()).order("created_at",{ascending:false});
    setStories((data||[]).filter((s:any)=>s.user_id===userId||s.privacy==="friends"));
  }

  async function loadSnaps(userId:string) {
    const {data}=await supabase.from("snap_recipients").select("snap_id,opened_at,replay_count").eq("recipient_id",userId);
    const ids=(data||[]).filter((x:any)=>!x.opened_at).map((x:any)=>x.snap_id);
    if(ids.length){const {data:s}=await supabase.from("snaps").select("*").in("id",ids).gt("expires_at",new Date().toISOString());setSnaps(s||[])} else setSnaps([]);
  }

  async function loadMessages(cid:string) {
    const {data}=await supabase.from("messages").select("*").eq("conversation_id",cid).is("deleted_at",null).gt("expires_at",new Date().toISOString()).order("created_at",{ascending:true});
    setMessages(data||[]);
  }

  useEffect(()=>{
    let alive=true;
    (async()=>{
      const {data}=await supabase.auth.getUser();
      if(!alive||!data.user)return;
      setMe(data.user.id);
      await Promise.all([loadProfile(data.user.id),loadFriends(data.user.id),loadStories(data.user.id),loadSnaps(data.user.id)]);
    })();
    return()=>{alive=false;streamRef.current?.getTracks().forEach(t=>t.stop())};
  },[]);

  useEffect(()=>{
    if(!conversationId)return;
    loadMessages(conversationId);
    const channel=supabase.channel("blink-chat-"+conversationId)
      .on("postgres_changes",{event:"*",schema:"public",table:"messages",filter:"conversation_id=eq."+conversationId},()=>loadMessages(conversationId))
      .subscribe();
    return()=>{supabase.removeChannel(channel)};
  },[conversationId]);

  useEffect(()=>{
    if(!me)return;
    const channel=supabase.channel("blink-presence", {config:{presence:{key:me}}})
      .on("presence",{event:"sync"},()=>{})
      .subscribe(async status=>{if(status==="SUBSCRIBED")await channel.track({online:true,at:Date.now()})});
    return()=>{supabase.removeChannel(channel)};
  },[me]);

  async function searchPeople(value:string){
    setQuery(value);
    if(!value.trim()){setPeople([]);return}
    const {data}=await supabase.rpc("search_blink_profiles",{term:value.trim()});
    setPeople((data||[]).map((x:any)=>({...x,online:false})));
  }

  async function sendFriendRequest(person:Person){
    if(!me)return;
    const {error}=await supabase.from("friendships").insert({requester_id:me,addressee_id:person.id});
    notify(error?"Unable to send request.":"Friend request sent.");
  }

  async function acceptRequest(person:Person){
    const {error}=await supabase.from("friendships").update({status:"accepted"}).eq("requester_id",person.id).eq("addressee_id",me).eq("status","pending");
    if(!error){await loadFriends(me);notify("Friend request accepted.")}
  }

  async function openChat(person:Person){
    if(!me)return;
    const {data,error}=await supabase.rpc("get_or_create_direct_conversation",{other_user:person.id});
    if(error){notify(error.message);return}
    setActiveFriend(person);setConversationId(data);
    setTab("chat");
  }

  async function sendText(){
    if(!message.trim()||!conversationId||!me)return;
    const body=message.trim();setMessage("");
    const {error}=await supabase.from("messages").insert({conversation_id:conversationId,sender_id:me,body,message_type:"text",expires_at:new Date(Date.now()+24*3600e3).toISOString()});
    if(error){setMessage(body);notify(error.message)}
  }

  async function sendChatFile(file:File){
    if(!conversationId||!me)return;
    if(file.size>50*1024*1024){notify("File is too large.");return}
    const path=me+"/chat/"+crypto.randomUUID()+"-"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
    setBusy(true);
    const {error:up}=await supabase.storage.from("blink-ephemeral").upload(path,file,{contentType:file.type});
    if(up){setBusy(false);notify(up.message);return}
    const type=file.type.startsWith("video/")?"video":file.type.startsWith("audio/")?"voice":"image";
    const {error}=await supabase.from("messages").insert({conversation_id:conversationId,sender_id:me,media_path:path,message_type:type,expires_at:new Date(Date.now()+24*3600e3).toISOString()});
    setBusy(false);if(error)notify(error.message);
  }

  async function startCamera(){
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});
      streamRef.current=stream;if(videoRef.current)videoRef.current.srcObject=stream;setCameraOn(true);
    }catch{notify("Camera permission was not granted.")}
  }

  function stopCamera(){streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setCameraOn(false)}

  async function captureSnap(){
    const video=videoRef.current;if(!video||!me)return;
    const canvas=document.createElement("canvas");canvas.width=video.videoWidth||1080;canvas.height=video.videoHeight||1920;
    canvas.getContext("2d")?.drawImage(video,0,0,canvas.width,canvas.height);
    const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,"image/jpeg",.88));
    if(!blob)return;
    const file=new File([blob],"camera.jpg",{type:"image/jpeg"});
    await prepareSnap(file);
  }

  async function prepareSnap(file:File){
    const url=URL.createObjectURL(file);setSnapPreview(url);
    (window as any).__blinkSnapFile=file;
    stopCamera();
    notify("Snap ready — choose recipients.");
  }

  async function sendSnap(){
    const file=(window as any).__blinkSnapFile as File|undefined;
    if(!file||!me||selectedRecipients.length===0){notify("Choose at least one friend.");return}
    setBusy(true);
    const id=crypto.randomUUID();const path=me+"/snaps/"+id+"-"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
    const {error:up}=await supabase.storage.from("blink-ephemeral").upload(path,file,{contentType:file.type});
    if(up){setBusy(false);notify(up.message);return}
    const {error:se}=await supabase.from("snaps").insert({id,sender_id:me,media_path:path,media_type:file.type.startsWith("video/")?"video":"image",caption:snapCaption,duration_seconds:10,expires_at:new Date(Date.now()+7*24*3600e3).toISOString()});
    if(!se)await supabase.from("snap_recipients").insert(selectedRecipients.map(recipient_id=>({snap_id:id,recipient_id})));
    setBusy(false);if(se)notify(se.message);else{setSnapPreview("");setSnapCaption("");setSelectedRecipients([]);(window as any).__blinkSnapFile=undefined;notify("Snap sent.")}
  }

  async function publishStory(){
    if(!storyFile||!me)return;
    setBusy(true);const id=crypto.randomUUID();const path=me+"/stories/"+id+"-"+storyFile.name.replace(/[^a-zA-Z0-9._-]/g,"_");
    const {error:up}=await supabase.storage.from("blink-ephemeral").upload(path,storyFile,{contentType:storyFile.type});
    if(up){setBusy(false);notify(up.message);return}
    const {error}=await supabase.from("stories").insert({id,user_id:me,media_path:path,media_type:storyFile.type.startsWith("video/")?"video":"image",privacy:"friends",expires_at:new Date(Date.now()+24*3600e3).toISOString()});
    setBusy(false);if(error)notify(error.message);else{setStoryFile(null);await loadStories(me);notify("Story posted for 24 hours.")}
  }

  async function mediaUrl(path:string){
    const {data}=await supabase.storage.from("blink-ephemeral").createSignedUrl(path,120);
    return data?.signedUrl||"";
  }

  async function openSnap(snap:Snap){
    const url=await mediaUrl(snap.media_path);if(!url){notify("Snap expired.");return}
    const win=window.open(url,"_blank","noopener,noreferrer");
    if(win){await supabase.from("snap_recipients").update({opened_at:new Date().toISOString()}).eq("snap_id",snap.id).eq("recipient_id",me);setSnaps(s=>s.filter(x=>x.id!==snap.id))}
  }

  const friendIds=useMemo(()=>new Set(friends.map(f=>f.id)),[friends]);
  const nav:[Tab,string,string][]=[["camera","◉","Camera"],["chat","◌","Chat"],["friends","♙","Friends"],["stories","◫","Stories"],["map","⌖","Map"],["profile","●","Profile"]];

  return <main className="blink-app">
    <header className="blink-topbar">
      <button className="blink-brand" onClick={()=>setTab("camera")}>BLINK</button>
      <div className="blink-top-actions"><button className="blink-round" onClick={()=>setTab("friends")}>⌕</button><button className="blink-round" onClick={()=>notify(snaps.length?snaps.length+" new Snap(s)":"No new Snaps")}>♡</button><SignOutButton/></div>
    </header>

    <section className="blink-content">
      {tab==="camera"&&<div className="blink-camera-page">
        <div className="blink-camera-stage">
          {snapPreview?<div className="blink-snap-preview"><img src={snapPreview} alt="Snap preview"/><div className="blink-preview-actions"><button onClick={()=>{setSnapPreview("");(window as any).__blinkSnapFile=undefined}}>Retake</button><button className="blink-primary" onClick={sendSnap} disabled={busy}>Send Snap</button></div></div>:
          cameraOn?<><video ref={videoRef} autoPlay playsInline muted className="blink-video"/><div className="blink-camera-gradient"/><div className="blink-camera-toolbar"><button className={flash?"active":""} onClick={()=>setFlash(!flash)}>⚡</button><button onClick={()=>notify("Effects are ready for the next camera build.")}>✦</button><button onClick={()=>snapFileRef.current?.click()}>▣</button><button onClick={stopCamera}>×</button></div><button className="blink-shutter" onClick={captureSnap}><span/></button></>:
          <div className="blink-camera-off"><div className="blink-big-icon">◉</div><h1>BLINK CAMERA</h1><p>Capture a photo, choose friends, send a disappearing Snap.</p><button className="blink-primary" onClick={startCamera}>Enable camera</button><button className="blink-button secondary" onClick={()=>snapFileRef.current?.click()}>Choose from gallery</button></div>}
          <input ref={snapFileRef} type="file" accept="image/*,video/*" hidden onChange={(e:ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(f)prepareSnap(f)}}/>
        </div>
        {friends.length>0&&<div className="blink-recipient-strip"><b>Send to:</b>{friends.map(f=><button key={f.id} className={selectedRecipients.includes(f.id)?"selected":""} onClick={()=>setSelectedRecipients(s=>s.includes(f.id)?s.filter(x=>x!==f.id):[...s,f.id])}><Avatar person={f}/><span>{f.display_name||f.username}</span></button>)}<input value={snapCaption} onChange={e=>setSnapCaption(e.target.value)} placeholder="Caption…"/></div>}
        {snaps.length>0&&<div className="blink-inbox-snaps"><b>New Snaps</b>{snaps.map(s=><button key={s.id} onClick={()=>openSnap(s)}><span>●</span> {s.media_type} Snap · {Math.round((Date.now()-new Date(s.created_at).getTime())/60000)}m</button>)}</div>}
      </div>}

      {tab==="chat"&&<div className="blink-panel"><div className="blink-panel-head"><div><span className="blink-eyebrow">REALTIME</span><h1>Chat</h1></div><button className="blink-primary small" onClick={()=>setTab("friends")}>＋ New chat</button></div>
        <div className="blink-chat-layout"><aside className="blink-chat-list">{friends.length?friends.map(f=><button key={f.id} className={activeFriend?.id===f.id?"blink-chat-row selected":"blink-chat-row"} onClick={()=>openChat(f)}><Avatar person={f}/><span className="blink-chat-copy"><b>{f.display_name||f.username||"Friend"}</b><small>@{f.username||"user"}</small></span></button>):<div className="blink-empty">Add friends to start messaging.</div>}</aside>
          <section className="blink-conversation">{activeFriend?<><div className="blink-conversation-head"><Avatar person={activeFriend}/><div><b>{activeFriend.display_name||activeFriend.username}</b><small>Disappearing chat · 24 hours</small></div></div><div className="blink-messages">{messages.map(m=><div key={m.id} className={"blink-message-line "+(m.sender_id===me?"mine":"")}><div className={"blink-bubble "+(m.sender_id===me?"mine":"other")}>{m.body||("["+m.message_type+"]")}</div></div>)}</div><div className="blink-composer"><button onClick={()=>chatFileRef.current?.click()}>＋</button><input value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendText()} placeholder="Send a message…"/><button onClick={sendText}>➤</button><input ref={chatFileRef} hidden type="file" accept="image/*,video/*,audio/*" onChange={e=>{const f=e.target.files?.[0];if(f)sendChatFile(f)}}/></div></>:<div className="blink-empty">Choose a friend to start a real conversation.</div>}</section></div>
      </div>}

      {tab==="friends"&&<div className="blink-panel"><div className="blink-panel-head"><div><span className="blink-eyebrow">PEOPLE</span><h1>Friends</h1></div></div><input className="blink-search" value={query} onChange={e=>searchPeople(e.target.value)} placeholder="Search username or name…"/>
        {requests.length>0&&<div className="blink-request-box"><b>Friend requests</b>{requests.map(p=><div key={p.id}><Avatar person={p}/><span>{p.display_name||p.username}</span><button className="blink-primary small" onClick={()=>acceptRequest(p)}>Accept</button></div>)}</div>}
        <div className="blink-friend-grid">{(query?people:friends).map(p=><article className="blink-friend-card" key={p.id}><Avatar person={p} size="large"/><h3>{p.display_name||p.username||"BLINK user"}</h3><p>@{p.username||"user"}</p><div className="blink-card-actions">{friendIds.has(p.id)?<button onClick={()=>openChat(p)}>Chat</button>:<button onClick={()=>sendFriendRequest(p)}>Add friend</button>}</div></article>)}</div>
      </div>}

      {tab==="stories"&&<div className="blink-panel"><div className="blink-panel-head"><div><span className="blink-eyebrow">DISAPPEARS IN 24H</span><h1>Stories</h1></div><button className="blink-primary small" onClick={()=>storyFileRef.current?.click()}>＋ Your Story</button></div><input ref={storyFileRef} hidden type="file" accept="image/*,video/*" onChange={e=>{const f=e.target.files?.[0];if(f){setStoryFile(f);notify("Story ready — post it from this screen.")}}}/>{storyFile&&<div className="blink-story-compose"><b>{storyFile.name}</b><button className="blink-primary" onClick={publishStory} disabled={busy}>Post Story</button></div>}<div className="blink-story-grid">{stories.map(s=><button key={s.id} className="blink-story-card" onClick={async()=>{const u=await mediaUrl(s.media_path);if(u)window.open(u,"_blank","noopener,noreferrer")}}><div className="blink-story-ring"><span>BL</span></div><b>{s.user_id===me?"Your Story":"Friend Story"}</b><small>{Math.max(1,Math.round((Date.now()-new Date(s.created_at).getTime())/3600000))}h ago</small></button>)}</div></div>}

      {tab==="map"&&<div className="blink-panel"><div className="blink-panel-head"><div><span className="blink-eyebrow">TEMPORARY LOCATION</span><h1>Map</h1></div><button className="blink-primary small" onClick={()=>setMapGhost(!mapGhost)}>{mapGhost?"Ghost Mode ON":"Share location"}</button></div><div className="blink-map"><div className="blink-map-grid"/><div className="blink-map-label">{mapGhost?"Ghost Mode — location hidden":"Location sharing is temporary"}</div></div><div className="blink-map-controls"><button onClick={()=>setMapGhost(true)}>👻 Ghost Mode</button><button onClick={()=>notify("Location expiry controls opened.")}>⌖ Expiry</button><button onClick={()=>notify("Place discovery opened.")}>✦ Explore</button></div></div>}

      {tab==="profile"&&<div className="blink-profile-page"><div className="blink-profile-cover"><Avatar person={profile} size="large"/></div><div className="blink-profile-body"><span className="blink-eyebrow">MY PROFILE</span><h1>{profile?.display_name||profile?.username||email.split("@")[0]}</h1><p>@{profile?.username||email.split("@")[0]}</p><div className="blink-profile-stats"><div><b>{friends.length}</b><small>Friends</small></div><div><b>0</b><small>Streaks</small></div><div><b>{stories.filter(s=>s.user_id===me).length}</b><small>Stories</small></div></div><div className="blink-settings-list"><button onClick={()=>notify("Edit profile is next in the profile module.")}>✎ <span>Edit profile</span><b>›</b></button><button onClick={()=>notify("Privacy controls are active in the database.")}>♙ <span>Privacy & safety</span><b>›</b></button><button onClick={()=>notify("Ghost Mode controls your temporary location.")}>👻 <span>Ghost Mode</span><b>›</b></button><button onClick={()=>notify("Security center opened.")}>◆ <span>Security center</span><b>›</b></button></div><p className="blink-account">{email}</p></div></div>}
    </section>

    <nav className="blink-bottom-nav" aria-label="Main navigation">{nav.map(([id,icon,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><span className="blink-icon">{icon}</span><small>{label}</small></button>)}</nav>
    {toast&&<div className="blink-toast" role="status">{toast}</div>}
  </main>;
}
