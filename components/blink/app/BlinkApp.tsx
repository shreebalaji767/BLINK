"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SignOutButton from "@/components/blink/auth/SignOutButton";

type Tab = "camera" | "chat" | "friends" | "stories" | "map" | "profile";
type Friend = { id: string; name: string; username: string; online: boolean; avatar?: string | null };
type Chat = { id: string; name: string; preview: string; time: string; unread: number };

const demoFriends: Friend[] = [
  { id: "f1", name: "Aarav", username: "aarav", online: true },
  { id: "f2", name: "Mahi", username: "mahi", online: true },
  { id: "f3", name: "Kabir", username: "kabir", online: false },
  { id: "f4", name: "Riya", username: "riya", online: false },
];

const demoChats: Chat[] = [
  { id: "c1", name: "Mahi", preview: "That snap 😂", time: "2m", unread: 3 },
  { id: "c2", name: "Aarav", preview: "🔥 streak", time: "12m", unread: 1 },
  { id: "c3", name: "BLINK Squad", preview: "New message", time: "1h", unread: 0 },
];

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="blink-icon" aria-hidden="true">{children}</span>;
}

export default function BlinkApp({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>("camera");
  const [cameraOn, setCameraOn] = useState(false);
  const [flash, setFlash] = useState(false);
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(demoChats[0]);
  const [query, setQuery] = useState("");
  const [profileName, setProfileName] = useState(email.split("@")[0]);
  const [toast, setToast] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const filteredFriends = useMemo(() => demoFriends.filter(f =>
    (f.name + f.username).toLowerCase().includes(query.toLowerCase())
  ), [query]);

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), []);

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      setToast("Camera permission was not granted.");
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  function snap() {
    setToast("Snap captured. Media is kept temporary for delivery.");
    setTimeout(() => setToast(""), 2500);
  }

  async function sendMessage() {
    if (!message.trim()) return;
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      await supabase.from("ephemeral_messages").insert({
        sender_id: user.user.id,
        body: message.trim(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    }
    setMessage("");
    setToast("Message sent.");
    setTimeout(() => setToast(""), 1800);
  }

  const nav = [
    ["camera", "◉", "Camera"], ["chat", "◌", "Chat"], ["friends", "♙", "Friends"],
    ["stories", "◫", "Stories"], ["map", "⌖", "Map"], ["profile", "◉", "Profile"]
  ] as const;

  return (
    <main className="blink-app">
      <header className="blink-topbar">
        <button className="blink-brand" onClick={() => setTab("camera")} aria-label="BLINK home">BLINK</button>
        <div className="blink-top-actions">
          <button className="blink-round" onClick={() => setToast("Search is ready.")} aria-label="Search">⌕</button>
          <button className="blink-round" onClick={() => setToast("Notifications opened.")} aria-label="Notifications">♡</button>
          <SignOutButton />
        </div>
      </header>

      <section className="blink-content">
        {tab === "camera" && (
          <div className="blink-camera-page">
            <div className="blink-camera-stage">
              {cameraOn ? <video ref={videoRef} autoPlay playsInline muted className="blink-video" /> :
                <div className="blink-camera-off">
                  <div className="blink-big-icon">◉</div>
                  <h1>BLINK CAMERA</h1>
                  <p>Capture a Snap. Send it. Let it disappear.</p>
                  <button className="blink-primary" onClick={openCamera}>Enable camera</button>
                </div>}
              <div className="blink-camera-gradient" />
              <div className="blink-camera-toolbar">
                <button onClick={() => setFlash(!flash)} className={flash ? "active" : ""}>⚡</button>
                <button onClick={() => setToast("Effects picker opened.")}>✦</button>
                <button onClick={() => setToast("Gallery picker opened.")}>▣</button>
                <button onClick={() => setToast("Camera switched.")}>↻</button>
              </div>
              {cameraOn && <button className="blink-shutter" onClick={snap} aria-label="Take Snap"><span /></button>}
              {cameraOn && <button className="blink-camera-close" onClick={closeCamera}>×</button>}
            </div>
            <div className="blink-camera-bottom">
              <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption…" aria-label="Snap caption" />
              <button className="blink-primary" onClick={() => setToast("Choose recipients to send this Snap.")}>Send Snap →</button>
            </div>
          </div>
        )}

        {tab === "chat" && (
          <div className="blink-panel">
            <div className="blink-panel-head"><div><span className="blink-eyebrow">MESSAGES</span><h1>Chat</h1></div><button className="blink-primary small" onClick={() => setToast("New chat created.")}>＋ New</button></div>
            <div className="blink-chat-layout">
              <aside className="blink-chat-list">
                {demoChats.map(chat => <button key={chat.id} className={selectedChat?.id === chat.id ? "blink-chat-row selected" : "blink-chat-row"} onClick={() => setSelectedChat(chat)}>
                  <span className="blink-avatar">{chat.name[0]}</span><span className="blink-chat-copy"><b>{chat.name}</b><small>{chat.preview}</small></span><span className="blink-chat-meta"><small>{chat.time}</small>{chat.unread > 0 && <i>{chat.unread}</i>}</span>
                </button>)}
              </aside>
              <section className="blink-conversation">
                {selectedChat ? <>
                  <div className="blink-conversation-head"><span className="blink-avatar">{selectedChat.name[0]}</span><div><b>{selectedChat.name}</b><small>Active now · disappearing chat</small></div></div>
                  <div className="blink-messages"><div className="blink-bubble other">Hey 👋</div><div className="blink-bubble mine">{selectedChat.preview}</div><div className="blink-bubble other">Send me a Snap!</div></div>
                  <div className="blink-composer"><button>＋</button><input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Send a chat…" /><button onClick={sendMessage}>➤</button></div>
                </> : <div className="blink-empty">Select a chat</div>}
              </section>
            </div>
          </div>
        )}

        {tab === "friends" && (
          <div className="blink-panel">
            <div className="blink-panel-head"><div><span className="blink-eyebrow">PEOPLE</span><h1>Friends</h1></div><button className="blink-primary small">＋ Add friends</button></div>
            <input className="blink-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people or username…" />
            <div className="blink-friend-grid">{filteredFriends.map(f => <article className="blink-friend-card" key={f.id}><div className="blink-friend-top"><span className="blink-avatar large">{f.name[0]}</span><span className={f.online ? "blink-online" : "blink-offline"} /></div><h3>{f.name}</h3><p>@{f.username}</p><div className="blink-card-actions"><button onClick={() => setToast("Chat opened.")}>Chat</button><button onClick={() => setToast("Friend request sent.")}>Add</button></div></article>)}</div>
          </div>
        )}

        {tab === "stories" && (
          <div className="blink-panel"><div className="blink-panel-head"><div><span className="blink-eyebrow">24 HOURS</span><h1>Stories</h1></div><button className="blink-primary small" onClick={() => setToast("Story composer opened.")}>＋ Your Story</button></div>
            <div className="blink-story-hero"><div className="blink-story-orb">B</div><div><h2>Your day, your people.</h2><p>Post photos or video that disappear after 24 hours.</p></div></div>
            <div className="blink-story-grid">{["Mahi","Aarav","Riya","Kabir"].map((name,i)=><button className="blink-story-card" key={name} onClick={() => setToast("Story viewer opened.")}><div className={"blink-story-ring r"+i}><span>{name[0]}</span></div><b>{name}</b><small>{i+2}m ago</small></button>)}</div>
          </div>
        )}

        {tab === "map" && (
          <div className="blink-panel"><div className="blink-panel-head"><div><span className="blink-eyebrow">TEMPORARY LOCATION</span><h1>Map</h1></div><button className="blink-primary small" onClick={() => setToast("Location sharing expires automatically.")}>Share location</button></div>
            <div className="blink-map"><div className="blink-map-grid" /><div className="blink-map-pin p1">●</div><div className="blink-map-pin p2">●</div><div className="blink-map-pin p3">●</div><div className="blink-map-label">Friends nearby</div></div>
            <div className="blink-map-controls"><button onClick={() => setToast("Ghost mode enabled.")}>👻 Ghost Mode</button><button onClick={() => setToast("Location picker opened.")}>⌖ Choose expiry</button><button onClick={() => setToast("Place discovery opened.")}>✦ Explore places</button></div>
          </div>
        )}

        {tab === "profile" && (
          <div className="blink-profile-page"><div className="blink-profile-cover"><span className="blink-profile-avatar">{profileName[0]?.toUpperCase()}</span></div><div className="blink-profile-body"><span className="blink-eyebrow">MY PROFILE</span><h1>{profileName}</h1><p>@{profileName.toLowerCase().replace(/[^a-z0-9]/g,"")}</p><div className="blink-profile-stats"><div><b>0</b><small>Friends</small></div><div><b>0</b><small>Streaks</small></div><div><b>0</b><small>Stories</small></div></div><div className="blink-settings-list"><button onClick={() => setToast("Edit profile opened.")}>✎ <span>Edit profile</span> <b>›</b></button><button onClick={() => setToast("Privacy settings opened.")}>♙ <span>Privacy & safety</span> <b>›</b></button><button onClick={() => setToast("Appearance settings opened.")}>◐ <span>Appearance</span> <b>›</b></button><button onClick={() => setToast("Notifications settings opened.")}>♢ <span>Notifications</span> <b>›</b></button><button onClick={() => setToast("Security center opened.")}>◆ <span>Security center</span> <b>›</b></button></div><p className="blink-account">{email}</p></div></div>
        )}
      </section>

      <nav className="blink-bottom-nav" aria-label="Main navigation">{nav.map(([id,icon,label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id as Tab)}><Icon>{icon}</Icon><small>{label}</small></button>)}</nav>
      {toast && <div className="blink-toast" role="status">{toast}</div>}
    </main>
  );
}
