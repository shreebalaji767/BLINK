"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SignOutButton from "@/components/blink/auth/SignOutButton";

type Tab = "camera" | "chat" | "friends" | "stories" | "map" | "profile";
type Person = { id: string; online?: boolean };
type Bot = { id: string; bot_key: string; display_name: string; avatar_emoji: string };
type Message = {
  id: string; conversation_id: string; sender_id: string | null; sender_bot_id: string | null;
  body: string | null; media_path: string | null; message_type: string; created_at: string; expires_at: string;
  bot_profiles?: { bot_key: string; display_name: string; avatar_emoji: string } | { bot_key: string; display_name: string; avatar_emoji: string }[] | null;
};
type Story = { id: string; user_id: string; media_path: string; media_type: string; caption: string | null; created_at: string; expires_at: string };
type Snap = { id: string; sender_id: string; media_path: string; media_type: string; caption: string | null; duration_seconds: number; created_at: string; expires_at: string };

const supabase = createClient();

function shortId(id: string) {
  return id.slice(0, 8);
}

function Avatar({ id, emoji, large = false }: { id?: string; emoji?: string; large?: boolean }) {
  return <span className={"blink-avatar " + (large ? "large" : "")}>{emoji ?? shortId(id ?? "?").slice(0, 2).toUpperCase()}</span>;
}

export default function BlinkApp({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>("camera");
  const [me, setMe] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [directory, setDirectory] = useState<Person[]>([]);
  const [outgoing, setOutgoing] = useState<Person[]>([]);
  const [friends, setFriends] = useState<Person[]>([]);
  const [requests, setRequests] = useState<Person[]>([]);
  const [blocked, setBlocked] = useState<Person[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [activePerson, setActivePerson] = useState<Person | null>(null);
  const [activeBot, setActiveBot] = useState<Bot | null>(null);
  const [message, setMessage] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [snapCaption, setSnapCaption] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [snapPreview, setSnapPreview] = useState("");
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [ghostMode, setGhostMode] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const snapFileRef = useRef<HTMLInputElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function loadFriends(userId: string) {
    const [{ data: accepted }, { data: incoming }, { data: sent }] = await Promise.all([
      supabase.from("friendships").select("requester_id,addressee_id").eq("status", "accepted")
        .or("requester_id.eq." + userId + ",addressee_id.eq." + userId),
      supabase.from("friendships").select("requester_id").eq("addressee_id", userId).eq("status", "pending"),
      supabase.from("friendships").select("addressee_id").eq("requester_id", userId).eq("status", "pending")
    ]);
    const ids = (accepted ?? []).map((r: any) => r.requester_id === userId ? r.addressee_id : r.requester_id);
    setFriends(ids.map((id: string) => ({ id })));
    setRequests((incoming ?? []).map((r: any) => ({ id: r.requester_id })));
    setOutgoing((sent ?? []).map((r: any) => ({ id: r.addressee_id })));
  }

  async function loadBlocked(userId: string) {
    const { data } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", userId);
    setBlocked((data ?? []).map((x: any) => ({ id: x.blocked_id })));
  }

  async function loadStories(userId: string) {
    const { data } = await supabase.from("stories").select("id,user_id,media_path,media_type,caption,created_at,expires_at")
      .gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false });
    setStories((data ?? []).filter((s: any) => s.user_id === userId));
  }

  async function loadSnaps(userId: string) {
    const { data } = await supabase.from("snap_recipients").select("snap_id,opened_at").eq("recipient_id", userId);
    const ids = (data ?? []).filter((x: any) => !x.opened_at).map((x: any) => x.snap_id);
    if (!ids.length) {
      setSnaps([]);
      return;
    }
    const { data: s } = await supabase.from("snaps").select("*").in("id", ids).gt("expires_at", new Date().toISOString());
    setSnaps(s ?? []);
  }

  async function loadBots() {
    const { data } = await supabase.from("bot_profiles").select("id,bot_key,display_name,avatar_emoji").eq("enabled", true).order("display_name");
    setBots((data ?? []) as Bot[]);
  }

  async function loadMessages(cid: string) {
    const { data } = await supabase.from("messages")
      .select("*,bot_profiles:sender_bot_id(bot_key,display_name,avatar_emoji)")
      .eq("conversation_id", cid).is("deleted_at", null).gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as Message[]);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive || !data.user) return;
      setMe(data.user.id);
      await Promise.all([loadFriends(data.user.id), loadBlocked(data.user.id), loadStories(data.user.id), loadSnaps(data.user.id), loadBots()]);
      const { data: allIds } = await supabase.from("user_ids").select("id").limit(5000);
      setDirectory((allIds ?? []).map((x: any) => ({ id: x.id })).filter((x: Person) => x.id !== data.user!.id));
    })();
    return () => {
      alive = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    loadMessages(conversationId);
    const channel = supabase.channel("blink-chat-" + conversationId)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: "conversation_id=eq." + conversationId }, () => loadMessages(conversationId))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  async function findUserId(value: string) {
    setQuery(value);
    const trimmed = value.trim();
    if (!trimmed) { setPeople([]); return; }
    const needle = trimmed.toLowerCase();
    setPeople(directory.filter((p) => p.id.toLowerCase().includes(needle)).slice(0, 60));
  }

  async function sendFriendRequest(person: Person) {
    const { error } = await supabase.from("friendships").insert({ requester_id: me, addressee_id: person.id });
    if (!error) { setOutgoing((items) => [...items, person]); setPeople((items) => items.filter((p) => p.id !== person.id)); }
    notify(error ? "Friend request could not be sent." : "Friend request sent.");
  }

  async function respondToRequest(person: Person, status: "accepted" | "rejected") {
    const { error } = await supabase.from("friendships").update({ status })
      .eq("requester_id", person.id).eq("addressee_id", me).eq("status", "pending");
    if (!error) { await loadFriends(me); notify(status === "accepted" ? "Friend request accepted." : "Request declined."); }
    else notify("Could not update request.");
  }
  async function declineRequest(person: Person) {
    const { error } = await supabase.from("friendships").delete()
      .eq("requester_id", person.id).eq("addressee_id", me).eq("status", "pending");
    if (!error) { await loadFriends(me); notify("Request declined."); }
    else notify("Could not decline request.");
  }
  async function cancelRequest(person: Person) {
    const { error } = await supabase.from("friendships").delete()
      .eq("requester_id", me).eq("addressee_id", person.id).eq("status", "pending");
    if (!error) { setOutgoing((items) => items.filter((p) => p.id !== person.id)); notify("Friend request cancelled."); }
    else notify("Could not cancel request.");
  }

  async function blockUser(person: Person) {
    await supabase.from("friendships").delete()
      .or("and(requester_id.eq." + me + ",addressee_id.eq." + person.id + "),and(requester_id.eq." + person.id + ",addressee_id.eq." + me + ")");
    const { error } = await supabase.from("blocks").upsert({ blocker_id: me, blocked_id: person.id });
    await loadFriends(me);
    await loadBlocked(me);
    notify(error ? "Block failed." : "User blocked.");
  }

  async function unblockUser(person: Person) {
    const { error } = await supabase.from("blocks").delete().eq("blocker_id", me).eq("blocked_id", person.id);
    await loadBlocked(me);
    notify(error ? "Unblock failed." : "User unblocked.");
  }

  async function openFriendChat(person: Person) {
    const { data, error } = await supabase.rpc("get_or_create_direct_conversation", { other_user: person.id });
    if (error) {
      notify(error.message);
      return;
    }
    setActivePerson(person);
    setActiveBot(null);
    setConversationId(data);
    setTab("chat");
  }

  async function openBotChat(bot: Bot) {
    const { data: conversation, error } = await supabase.from("conversations")
      .insert({ kind: "direct", created_by: me, title: bot.display_name }).select("id").single();
    if (error || !conversation) {
      notify(error?.message ?? "Could not create bot chat.");
      return;
    }
    await supabase.from("conversation_members").insert({ conversation_id: conversation.id, user_id: me });
    const { error: botError } = await supabase.from("conversation_bots").insert({ conversation_id: conversation.id, bot_id: bot.id });
    if (botError) {
      notify(botError.message);
      return;
    }
    setActiveBot(bot);
    setActivePerson(null);
    setConversationId(conversation.id);
    setTab("chat");
  }

  async function sendText() {
    if (!message.trim() || !conversationId || !me) return;
    const body = message.trim();
    setMessage("");
    const { data, error } = await supabase.from("messages")
      .insert({ conversation_id: conversationId, sender_id: me, body, message_type: "text", expires_at: new Date(Date.now() + 86400000).toISOString() })
      .select("id").single();
    if (error || !data) {
      setMessage(body);
      notify(error?.message ?? "Message failed.");
      return;
    }
    if (activeBot) {
      const { error: botError } = await supabase.functions.invoke("blink-bot-reply", { body: { conversationId, messageId: data.id } });
      if (botError) notify("Computer bot is unavailable.");
    }
  }

  async function sendChatFile(file: File) {
    if (!conversationId || !me) return;
    if (file.size > 50 * 1024 * 1024) {
      notify("File is too large.");
      return;
    }
    const path = me + "/chat/" + crypto.randomUUID();
    setBusy(true);
    const { error: uploadError } = await supabase.storage.from("blink-ephemeral").upload(path, file, { contentType: file.type });
    if (uploadError) {
      setBusy(false);
      notify(uploadError.message);
      return;
    }
    const type = file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "voice" : "image";
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId, sender_id: me, media_path: path, message_type: type,
      expires_at: new Date(Date.now() + 86400000).toISOString()
    });
    setBusy(false);
    if (error) notify(error.message);
    else if (activeBot) notify("Media sent. Computer bots reply to text commands.");
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      notify("Camera permission was not granted.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function prepareSnap(file: File) {
    const url = URL.createObjectURL(file);
    setSnapPreview(url);
    (window as any).__blinkSnapFile = file;
    stopCamera();
    notify("Snap ready — choose recipients.");
  }

  async function captureSnap() {
    const video = videoRef.current;
    if (!video || !me) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (blob) await prepareSnap(new File([blob], "camera.jpg", { type: "image/jpeg" }));
  }

  async function sendSnap() {
    const file = (window as any).__blinkSnapFile as File | undefined;
    if (!file || !me || !selectedRecipients.length) {
      notify("Choose at least one friend.");
      return;
    }
    setBusy(true);
    const id = crypto.randomUUID();
    const path = me + "/snaps/" + id;
    const { error: uploadError } = await supabase.storage.from("blink-ephemeral").upload(path, file, { contentType: file.type });
    if (uploadError) {
      setBusy(false);
      notify(uploadError.message);
      return;
    }
    const { error } = await supabase.from("snaps").insert({
      id, sender_id: me, media_path: path, media_type: file.type.startsWith("video/") ? "video" : "image",
      caption: snapCaption, duration_seconds: 10, expires_at: new Date(Date.now() + 7 * 86400000).toISOString()
    });
    if (!error) {
      const { error: recipientError } = await supabase.from("snap_recipients")
        .insert(selectedRecipients.map((recipient_id) => ({ snap_id: id, recipient_id })));
      if (recipientError) notify(recipientError.message);
    }
    setBusy(false);
    if (!error) {
      setSnapPreview("");
      setSnapCaption("");
      setSelectedRecipients([]);
      (window as any).__blinkSnapFile = undefined;
      notify("Snap sent.");
    } else notify(error.message);
  }

  async function publishStory() {
    if (!storyFile || !me) return;
    setBusy(true);
    const id = crypto.randomUUID();
    const path = me + "/stories/" + id;
    const { error: uploadError } = await supabase.storage.from("blink-ephemeral").upload(path, storyFile, { contentType: storyFile.type });
    if (uploadError) {
      setBusy(false);
      notify(uploadError.message);
      return;
    }
    const { error } = await supabase.from("stories").insert({
      id, user_id: me, media_path: path, media_type: storyFile.type.startsWith("video/") ? "video" : "image",
      privacy: "friends", expires_at: new Date(Date.now() + 86400000).toISOString()
    });
    setBusy(false);
    if (error) notify(error.message);
    else {
      setStoryFile(null);
      await loadStories(me);
      notify("Story posted for 24 hours.");
    }
  }

  async function mediaUrl(path: string) {
    const { data } = await supabase.storage.from("blink-ephemeral").createSignedUrl(path, 60);
    return data?.signedUrl ?? "";
  }

  async function openSnap(snap: Snap) {
    const url = await mediaUrl(snap.media_path);
    if (!url) {
      notify("Snap expired.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    await supabase.from("snap_recipients").update({ opened_at: new Date().toISOString() })
      .eq("snap_id", snap.id).eq("recipient_id", me);
    setSnaps((s) => s.filter((x) => x.id !== snap.id));
  }

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const nav: [Tab, string, string][] = [
    ["camera", "◉", "Camera"], ["chat", "◌", "Chat"], ["friends", "♙", "Friends"],
    ["stories", "◫", "Stories"], ["map", "⌖", "Map"], ["profile", "●", "Account"]
  ];

  return <main className="blink-app">
    <header className="blink-topbar">
      <button className="blink-brand" onClick={() => setTab("camera")}>BLINK</button>
      <div className="blink-top-actions">
        <button className="blink-round" onClick={() => setTab("friends")}>⌕</button>
        <button className="blink-round" onClick={() => notify(snaps.length ? snaps.length + " new Snap(s)" : "No new Snaps")}>♡</button>
        <SignOutButton />
      </div>
    </header>

    <section className="blink-content">
      {tab === "camera" && <div className="blink-camera-page">
        <div className="blink-camera-stage">
          {snapPreview ? <div className="blink-snap-preview">
            <img src={snapPreview} alt="Snap preview" />
            <div className="blink-preview-actions">
              <button onClick={() => { setSnapPreview(""); (window as any).__blinkSnapFile = undefined; }}>Retake</button>
              <button className="blink-primary" onClick={sendSnap} disabled={busy}>Send Snap</button>
            </div>
          </div> : cameraOn ? <>
            <video ref={videoRef} autoPlay playsInline muted className="blink-video" />
            <div className="blink-camera-gradient" />
            <div className="blink-camera-toolbar">
              <button onClick={() => notify("Flash is controlled by the device.")}>⚡</button>
              <button onClick={() => notify("Effects are computer-safe and local.")}>✦</button>
              <button onClick={() => snapFileRef.current?.click()}>▣</button>
              <button onClick={stopCamera}>×</button>
            </div>
            <button className="blink-shutter" onClick={captureSnap}><span /></button>
          </> : <div className="blink-camera-off">
            <div className="blink-big-icon">◉</div>
            <h1>BLINK CAMERA</h1>
            <p>Capture a photo or video and send it as a disappearing Snap.</p>
            <button className="blink-primary" onClick={startCamera}>Enable camera</button>
            <button className="blink-button secondary" onClick={() => snapFileRef.current?.click()}>Choose from gallery</button>
          </div>}
          <input ref={snapFileRef} type="file" accept="image/*,video/*" capture="user" hidden onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0]; if (f) prepareSnap(f);
          }} />
        </div>
        {friends.length > 0 && <div className="blink-recipient-strip"><b>Send to:</b>
          {friends.map((f) => <button key={f.id} className={selectedRecipients.includes(f.id) ? "selected" : ""} onClick={() => setSelectedRecipients((s) => s.includes(f.id) ? s.filter((x) => x !== f.id) : [...s, f.id])}>
            <Avatar id={f.id} /><span>{shortId(f.id)}</span>
          </button>)}
          <input value={snapCaption} onChange={(e) => setSnapCaption(e.target.value)} placeholder="Caption…" />
        </div>}
        {snaps.length > 0 && <div className="blink-inbox-snaps"><b>New Snaps</b>{snaps.map((s) =>
          <button key={s.id} onClick={() => openSnap(s)}>● {s.media_type} Snap</button>
        )}</div>}
      </div>}

      {tab === "chat" && <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">EPHEMERAL CHAT</span><h1>Chat</h1></div><button className="blink-primary small" onClick={() => setTab("friends")}>＋ New chat</button></div>
        <div className="blink-chat-layout">
          <aside className="blink-chat-list">
            <div className="blink-bot-list"><b>COMPUTERS — NOT AI</b>{bots.map((b) =>
              <button key={b.id} className={activeBot?.id === b.id ? "blink-chat-row selected" : "blink-chat-row"} onClick={() => openBotChat(b)}>
                <Avatar emoji={b.avatar_emoji} /><span className="blink-chat-copy"><b>{b.display_name}</b><small>Computer rules · no AI</small></span>
              </button>
            )}</div>
            {friends.length ? friends.map((f) =>
              <button key={f.id} className={activePerson?.id === f.id ? "blink-chat-row selected" : "blink-chat-row"} onClick={() => openFriendChat(f)}>
                <Avatar id={f.id} /><span className="blink-chat-copy"><b>{shortId(f.id)}</b><small>Disappears after 24h</small></span>
              </button>
            ) : <div className="blink-empty">Add a friend to start messaging.</div>}
          </aside>
          <section className="blink-conversation">
            {(activePerson || activeBot) ? <>
              <div className="blink-conversation-head">
                <Avatar id={activePerson?.id} emoji={activeBot?.avatar_emoji} />
                <div><b>{activeBot?.display_name ?? shortId(activePerson?.id ?? "")}</b><small>Disappearing chat · 24 hours</small></div>
              </div>
              <div className="blink-messages">
                {messages.map((m) => {
                  const botProfile = Array.isArray(m.bot_profiles) ? m.bot_profiles[0] : m.bot_profiles;
                  const mine = m.sender_id === me;
                  return <div key={m.id} className={"blink-message-line " + (mine ? "mine" : "")}>
                    <div className={"blink-bubble " + (mine ? "mine" : "other")}>
                      {m.media_path ? "[" + m.message_type + " · disappearing]" : m.body}
                      {botProfile && <small className="blink-bot-tag">{botProfile.avatar_emoji} computer</small>}
                    </div>
                  </div>;
                })}
              </div>
              <div className="blink-composer">
                <button onClick={() => chatFileRef.current?.click()}>＋</button>
                <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendText()} placeholder={activeBot ? "Talk to the computer…" : "Send a message…"} />
                <button onClick={sendText}>➤</button>
                <input ref={chatFileRef} hidden type="file" accept="image/*,video/*,audio/*" capture="environment" onChange={(e) => {
                  const f = e.target.files?.[0]; if (f) sendChatFile(f);
                }} />
              </div>
            </> : <div className="blink-empty">Choose a friend or a computer bot.</div>}
          </section>
        </div>
      </div>}

      {tab === "friends" && <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">USER IDS ONLY</span><h1>Friends</h1></div></div>
        <input className="blink-search" value={query} onChange={(e) => findUserId(e.target.value)} placeholder="Search people by any part of their User ID…" />
        {requests.length > 0 && <div className="blink-request-box"><b>Friend requests</b>{requests.map((p) =>
          <div key={p.id}><Avatar id={p.id} /><span>{shortId(p.id)}</span><button className="blink-primary small" onClick={() => respondToRequest(p, "accepted")}>Accept</button><button className="blink-button secondary small" onClick={() => declineRequest(p)}>Decline</button></div>
        )}</div>}
        <div className="blink-friend-grid">
          {(query ? people : friends).map((p) => <article className="blink-friend-card" key={p.id}>
            <Avatar id={p.id} large /><h3>{shortId(p.id)}</h3><p>{p.id}</p>
            <div className="blink-card-actions">
              {friendIds.has(p.id) ? <button onClick={() => openFriendChat(p)}>Chat</button> : outgoing.some((x) => x.id === p.id) ? <button onClick={() => cancelRequest(p)}>Requested · Cancel</button> : requests.some((x) => x.id === p.id) ? <button onClick={() => respondToRequest(p, "accepted")}>Accept request</button> : <button onClick={() => sendFriendRequest(p)}>＋ Add friend</button>}
              <button onClick={() => blocked.some((b) => b.id === p.id) ? unblockUser(p) : blockUser(p)}>{blocked.some((b) => b.id === p.id) ? "Unblock" : "Block"}</button>
            </div>
          </article>)}
        </div>
        {outgoing.length > 0 && <div className="blink-request-box"><b>Sent requests</b>{outgoing.map((p) => <div key={p.id}><Avatar id={p.id} /><span>{p.id}</span><button onClick={() => cancelRequest(p)}>Cancel request</button></div>)}</div>}
        {blocked.length > 0 && <div className="blink-request-box"><b>Blocked by you</b>{blocked.map((p) =>
          <div key={p.id}><Avatar id={p.id} /><span>{shortId(p.id)}</span><button onClick={() => unblockUser(p)}>Unblock</button></div>
        )}</div>}
      </div>}

      {tab === "stories" && <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">24 HOURS THEN DELETED</span><h1>Stories</h1></div><button className="blink-primary small" onClick={() => storyFileRef.current?.click()}>＋ Story</button></div>
        <input ref={storyFileRef} hidden type="file" accept="image/*,video/*" capture="environment" onChange={(e) => {
          const f = e.target.files?.[0]; if (f) { setStoryFile(f); notify("Story ready."); }
        }} />
        {storyFile && <div className="blink-story-compose"><b>{storyFile.name}</b><button className="blink-primary" onClick={publishStory} disabled={busy}>Post 24h Story</button></div>}
        <div className="blink-story-grid">{stories.map((s) =>
          <button key={s.id} className="blink-story-card" onClick={async () => { const u = await mediaUrl(s.media_path); if (u) window.open(u, "_blank", "noopener,noreferrer"); }}>
            <div className="blink-story-ring"><span>{shortId(s.user_id)}</span></div><b>{s.user_id === me ? "Your Story" : shortId(s.user_id)}</b><small>expires in 24h</small>
          </button>
        )}</div>
      </div>}

      {tab === "map" && <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">NO LOCATION HISTORY</span><h1>Map</h1></div>
          <button className="blink-primary small" onClick={() => setGhostMode(!ghostMode)}>{ghostMode ? "Ghost Mode ON" : "Share temporarily"}</button>
        </div>
        <div className="blink-map"><div className="blink-map-grid" /><div className="blink-map-label">{ghostMode ? "Ghost Mode — no location is stored" : "Location sharing is temporary and not stored as history"}</div></div>
        <div className="blink-map-controls"><button onClick={() => setGhostMode(true)}>👻 Ghost Mode</button><button onClick={() => notify("Temporary location expires automatically.")}>⌖ Expiry</button><button onClick={() => notify("No location history is stored.")}>✦ Privacy</button></div>
      </div>}

      {tab === "profile" && <div className="blink-profile-page">
        <div className="blink-profile-cover"><Avatar id={me} large /></div>
        <div className="blink-profile-body"><span className="blink-eyebrow">ACCOUNT</span><h1>BLINK User</h1><p>User ID</p>
          <div className="blink-id-box"><code>{me}</code><button onClick={() => navigator.clipboard.writeText(me).then(() => notify("User ID copied."))}>Copy</button></div>
          <div className="blink-settings-list">
            <button onClick={() => notify("Only the User ID is stored by BLINK outside authentication.")}>◆ <span>Data retention</span><b>Ephemeral</b></button>
            <button onClick={() => notify("Messages, Snaps and Stories are deleted after expiry.")}>◌ <span>Disappearing content</span><b>24h / Snap expiry</b></button>
            <button onClick={() => setGhostMode(true)}>👻 <span>Ghost Mode</span><b>ON</b></button>
            <button onClick={() => notify("Bots are deterministic computer programs, not AI.")}>💻 <span>Computer bots</span><b>NO AI</b></button>
          </div>
          <p className="blink-account">{email}</p>
        </div>
      </div>}
    </section>

    <nav className="blink-bottom-nav" aria-label="Main navigation">{nav.map(([id, icon, label]) =>
      <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><span className="blink-icon">{icon}</span><small>{label}</small></button>
    )}</nav>
    {toast && <div className="blink-toast" role="status">{toast}</div>}
  </main>;
}
