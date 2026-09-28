"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SignOutButton from "@/components/blink/auth/SignOutButton";

type Tab = "camera" | "chat" | "friends" | "stories" | "spotlight" | "map" | "memories" | "profile";
type Person = { id: string; username: string; online?: boolean };
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
  const [meUsername, setMeUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [settingsName, setSettingsName] = useState("");
  const [settingsUsername, setSettingsUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [settingsEmail, setSettingsEmail] = useState(email);
  const [avatarEmoji, setAvatarEmoji] = useState("3F");
  const [appearance, setAppearance] = useState<"dark" | "light">("dark");
  const [ghostMode, setGhostMode] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [cameraFilter, setCameraFilter] = useState<"normal" | "mono" | "sepia" | "vivid" | "cool">("normal");
  const [cameraLens, setCameraLens] = useState<"none" | "hearts" | "dog" | "crown" | "alien">("none");
  const [cameraZoom, setCameraZoom] = useState(1);
  const [snapTimer, setSnapTimer] = useState(0);
  const [flashOn, setFlashOn] = useState(false);
  const [chatRetention, setChatRetention] = useState("24h");
  const [snapRetention, setSnapRetention] = useState("seen");
  const [spotlight, setSpotlight] = useState<any[]>([]);
  const [memoryItems, setMemoryItems] = useState<any[]>([]);
  const [memoryPrivate, setMemoryPrivate] = useState(false);
  const [memoryPasscode, setMemoryPasscode] = useState("");
  const [memoryUnlocked, setMemoryUnlocked] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [recordingVoice, setRecordingVoice] = useState(false);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const snapFileRef = useRef<HTMLInputElement>(null);
  const storyFileRef = useRef<HTMLInputElement>(null);
  const realtimeChannelRef = useRef<any>(null);
  const conversationIdRef = useRef("");
  conversationIdRef.current = conversationId;

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function loadFriends(userId: string) {
    const [{ data: accepted, error: acceptedError }, { data: incoming, error: incomingError }, { data: sent, error: sentError }] = await Promise.all([
      supabase.from("friendships").select("requester_id,addressee_id").eq("status", "accepted")
        .or("requester_id.eq." + userId + ",addressee_id.eq." + userId),
      supabase.from("friendships").select("requester_id").eq("addressee_id", userId).eq("status", "pending"),
      supabase.from("friendships").select("addressee_id").eq("requester_id", userId).eq("status", "pending")
    ]);
    if (acceptedError || incomingError || sentError) {
      notify("Could not load your friend list.");
      return;
    }
    const ids = (accepted ?? []).map((r: { requester_id: string; addressee_id: string }) =>
      r.requester_id === userId ? r.addressee_id : r.requester_id
    );
    const allIds = [...new Set([
      ...ids,
      ...(incoming ?? []).map((r: { requester_id: string }) => r.requester_id),
      ...(sent ?? []).map((r: { addressee_id: string }) => r.addressee_id)
    ])];
    const names = new Map(directory.map((p) => [p.id, p.username]));
    if (allIds.length) {
      const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", allIds);
      (profiles ?? []).forEach((p: { id: string; username: string }) => names.set(p.id, p.username));
      if (profiles?.length) {
        setDirectory((current) => {
          const merged = new Map(current.map((p) => [p.id, p]));
          profiles.forEach((p: { id: string; username: string }) => merged.set(p.id, p));
          return Array.from(merged.values());
        });
      }
    }
    setFriends(ids.map((id: string) => ({ id, username: names.get(id) ?? "" })));
    setRequests((incoming ?? []).map((r: { requester_id: string }) => ({ id: r.requester_id, username: names.get(r.requester_id) ?? "" })));
    setOutgoing((sent ?? []).map((r: { addressee_id: string }) => ({ id: r.addressee_id, username: names.get(r.addressee_id) ?? "" })));
  }

  async function loadBlocked(userId: string) {
    const { data, error } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", userId);
    if (error) {
      notify("Could not load your blocked list.");
      return;
    }
    const ids = (data ?? []).map((x: { blocked_id: string }) => x.blocked_id);
    if (!ids.length) return setBlocked([]);
    const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", ids);
    setBlocked(ids.map((id: string) => ({
      id,
      username: (profiles ?? []).find((p: { id: string }) => p.id === id)?.username ?? ""
    })));
  }

  async function sendFriendRequest(person: Person) {
    if (!me || person.id === me) return;
    if (blocked.some((p) => p.id === person.id)) return notify("Unblock this person first.");
    const { error } = await supabase.from("friendships").insert({ requester_id: me, addressee_id: person.id, status: "pending" });
    if (error) {
      notify(error.code === "23505" ? "A friend relationship already exists." : "Could not send the friend request.");
      return;
    }
    await loadFriends(me);
    notify("Friend request sent.");
  }

  async function respondToRequest(person: Person, status: "accepted") {
    const { error } = await supabase.from("friendships").update({ status, updated_at: new Date().toISOString() })
      .eq("requester_id", person.id).eq("addressee_id", me).eq("status", "pending");
    if (error) return notify("Could not accept the friend request.");
    await loadFriends(me);
    notify("Friend request accepted.");
  }

  async function declineRequest(person: Person) {
    const { error } = await supabase.from("friendships").delete()
      .eq("requester_id", person.id).eq("addressee_id", me).eq("status", "pending");
    if (error) return notify("Could not decline the friend request.");
    await loadFriends(me);
    notify("Friend request declined.");
  }

  async function cancelRequest(person: Person) {
    const { error } = await supabase.from("friendships").delete()
      .eq("requester_id", me).eq("addressee_id", person.id).eq("status", "pending");
    if (error) return notify("Could not cancel the friend request.");
    await loadFriends(me);
    notify("Friend request cancelled.");
  }

  async function blockUser(person: Person) {
    if (!me || person.id === me) return;
    const { error } = await supabase.from("blocks").upsert({ blocker_id: me, blocked_id: person.id });
    if (error) return notify("Could not block this person.");
    await supabase.from("friendships").delete().or(
      "and(requester_id.eq." + me + ",addressee_id.eq." + person.id + "),and(requester_id.eq." + person.id + ",addressee_id.eq." + me + ")"
    );
    await Promise.all([loadBlocked(me), loadFriends(me)]);
    if (activePerson?.id === person.id) {
      setActivePerson(null);
      setConversationId("");
      setMessages([]);
    }
    notify("Person blocked.");
  }

  async function unblockUser(person: Person) {
    const { error } = await supabase.from("blocks").delete().eq("blocker_id", me).eq("blocked_id", person.id);
    if (error) return notify("Could not unblock this person.");
    await loadBlocked(me);
    notify("Person unblocked.");
  }

  function saveAvatar(value: string) {
    setAvatarEmoji(value);
    window.localStorage.setItem("blink_avatar_" + me, value);
  }

  function saveGhostMode(value: boolean) {
    setGhostMode(value);
    window.localStorage.setItem("blink_ghost_mode_" + me, String(value));
  }

  function saveAppearance(value: "dark" | "light") {
    setAppearance(value);
    window.localStorage.setItem("blink_appearance_" + me, value);
  }

  async function saveProfileSettings() {
    if (!me) return;
    const username = settingsUsername.trim().toLowerCase();
    const name = settingsName.trim();
    if (!/^[a-z0-9_]{3,24}$/.test(username)) return notify("Username must be 3–24 characters: lowercase letters, numbers, or underscore.");
    if (name.length > 80) return notify("Name is too long.");
    setSettingsBusy(true);
    try {
      const { error: profileError } = await supabase.from("profiles").update({ username }).eq("id", me);
      if (profileError) return notify(profileError.code === "23505" ? "That username is already taken." : "Could not save username.");
      const { error: authError } = await supabase.auth.updateUser({ data: { name, full_name: name } });
      if (authError) return notify("Username saved, but display name could not be updated.");
      setMeUsername(username);
      setDisplayName(name);
      setDirectory((current) => current.map((p) => p.id === me ? { ...p, username } : p));
      notify("Profile saved.");
    } finally {
      setSettingsBusy(false);
    }
  }

  async function changeEmail() {
    const nextEmail = settingsEmail.trim().toLowerCase();
    if (!nextEmail || nextEmail === email.toLowerCase()) return notify("Enter a different email address.");
    setSettingsBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: nextEmail });
      notify(error ? "Could not start the email change." : "Check your email to confirm the change.");
    } finally {
      setSettingsBusy(false);
    }
  }

  async function changePassword() {
    if (!currentPassword) return notify("Enter your current password.");
    if (newPassword.length < 8) return notify("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return notify("New passwords do not match.");
    setSettingsBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentEmail = userData.user?.email;
      if (!currentEmail) return notify("No email/password account was found.");
      const { error: verifyError } = await supabase.auth.signInWithPassword({ email: currentEmail, password: currentPassword });
      if (verifyError) return notify("Current password is incorrect.");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return notify("Could not change the password.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notify("Password changed.");
    } finally {
      setSettingsBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user || cancelled) return;
      setMe(user.id);
      setSettingsEmail(user.email ?? email);
      const { data: profile } = await supabase.from("profiles").select("id, username").eq("id", user.id).maybeSingle();
      if (cancelled) return;
      const username = profile?.username ?? "";
      const metadata = user.user_metadata ?? {};
      const name = String(metadata.full_name ?? metadata.name ?? "");
      setMeUsername(username);
      setSettingsUsername(username);
      setDisplayName(name);
      setSettingsName(name);
      const storedAppearance = window.localStorage.getItem("blink_appearance_" + user.id);
      const storedGhost = window.localStorage.getItem("blink_ghost_mode_" + user.id);
      setAvatarEmoji(window.localStorage.getItem("blink_avatar_" + user.id) || "3F");
      setGhostMode(storedGhost === null ? true : storedGhost === "true");
      setAppearance(storedAppearance === "light" ? "light" : "dark");
      setChatRetention(window.localStorage.getItem("blink_chat_retention") || "24h");
      setSnapRetention(window.localStorage.getItem("blink_snap_retention") || "seen");
      loadBots();
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.access_token) {
        await supabase.realtime.setAuth(sessionData.session.access_token);
      }
      const channel = supabase
        .channel("blink-user:" + user.id, { config: { private: true } })
        .on("broadcast", { event: "blink" }, (event: any) => {
          const payload = event?.payload;
          if (!payload || payload.recipient_id !== user.id || payload.sender_id === user.id) return;
          const senderId = String(payload.sender_id);
          const cid = "friend:" + senderId;
          if (payload.kind === "chat" || payload.kind === "media") {
            const incoming: Message = {
              id: String(payload.id || crypto.randomUUID()),
              conversation_id: cid,
              sender_id: senderId,
              sender_bot_id: null,
              body: payload.body ?? null,
              media_path: payload.media_path ?? null,
              message_type: payload.message_type || "text",
              created_at: payload.created_at || new Date().toISOString(),
              expires_at: payload.expires_at || "after_seen"
            };
            const key = "blink_chat_" + user.id + "_" + cid;
            const current: Message[] = JSON.parse(window.localStorage.getItem(key) || "[]");
            const active = [...current.filter((m) => m.id !== incoming.id), incoming]
              .filter((m) => m.expires_at === "after_seen" || new Date(m.expires_at).getTime() > Date.now());
            window.localStorage.setItem(key, JSON.stringify(active));
            if (conversationIdRef.current === cid) setMessages(active);
          } else if (payload.kind === "snap") {
            const snap: Snap = {
              id: String(payload.id || crypto.randomUUID()),
              sender_id: senderId,
              media_path: String(payload.media_path || ""),
              media_type: payload.media_type === "video" ? "video" : "image",
              caption: payload.caption ?? null,
              duration_seconds: Number(payload.duration_seconds || 10),
              created_at: payload.created_at || new Date().toISOString(),
              expires_at: payload.expires_at || new Date(Date.now() + 7 * 86400000).toISOString()
            };
            const key = "blink_snaps_" + user.id;
            const current: Snap[] = JSON.parse(window.localStorage.getItem(key) || "[]");
            const next = [...current.filter((s) => s.id !== snap.id), snap];
            window.localStorage.setItem(key, JSON.stringify(next));
            setSnaps(next.filter((s) => new Date(s.expires_at).getTime() > Date.now() && !(s as any).opened_at));
            notify("New Snap received.");
          }
        })
        .subscribe();
      realtimeChannelRef.current = channel;
      await Promise.all([loadDirectory(), loadFriends(user.id), loadBlocked(user.id), loadStories(user.id), loadSnaps(user.id)]);
      if (!cancelled) {
        loadSpotlight(user.id);
        loadMemories(user.id);
      }
    }
    initialize();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      voiceRecorderRef.current?.stop();
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, []);

  async function loadDirectory() {
    const { data, error } = await supabase.from("profiles").select("id, username").order("username").limit(5000);
    if (error) {
      notify("Could not load the username directory.");
      return;
    }
    setDirectory((data ?? []).map((p: { id: string; username: string }) => ({ id: p.id, username: p.username })));
  }

  function localStoriesKey(userId: string) {
    return "blink_stories_" + userId;
  }

  async function loadStories(userId: string) {
    try {
      const raw = window.localStorage.getItem(localStoriesKey(userId));
      const now = Date.now();
      const items = raw ? JSON.parse(raw) : [];
      const active = Array.isArray(items) ? items.filter((s: Story) => new Date(s.expires_at).getTime() > now) : [];
      setStories(active);
      window.localStorage.setItem(localStoriesKey(userId), JSON.stringify(active));
    } catch {
      setStories([]);
    }
  }

  function localChatKey(cid: string) {
    return "blink_chat_" + me + "_" + cid;
  }

  function localSnapKey() {
    return "blink_snaps_" + me;
  }

  function retentionMs(value: string) {
    if (value === "10s") return 10 * 1000;
    if (value === "1m") return 60 * 1000;
    if (value === "5m") return 5 * 60 * 1000;
    if (value === "1h") return 60 * 60 * 1000;
    if (value === "24h") return 24 * 60 * 60 * 1000;
    if (value === "7d") return 7 * 24 * 60 * 60 * 1000;
    return 0;
  }

  function loadLocalChat(cid: string) {
    try {
      const raw = window.localStorage.getItem(localChatKey(cid));
      const now = Date.now();
      const items = raw ? JSON.parse(raw) : [];
      const active = Array.isArray(items) ? items.filter((m: Message) => m.expires_at === "after_seen" || new Date(m.expires_at).getTime() > now) : [];
      setMessages(active);
      window.localStorage.setItem(localChatKey(cid), JSON.stringify(active));
    } catch {
      setMessages([]);
    }
  }

  function saveLocalChat(cid: string, items: Message[]) {
    const active = items.filter((m) => m.expires_at === "after_seen" || new Date(m.expires_at).getTime() > Date.now());
    setMessages(active);
    window.localStorage.setItem(localChatKey(cid), JSON.stringify(active));
  }

  async function loadSnaps(userId: string) {
    try {
      const raw = window.localStorage.getItem("blink_snaps_" + userId);
      const now = Date.now();
      const items = raw ? JSON.parse(raw) : [];
      const active = Array.isArray(items) ? items.filter((s: Snap) => new Date(s.expires_at).getTime() > now && !((s as any).opened_at)) : [];
      setSnaps(active);
      window.localStorage.setItem("blink_snaps_" + userId, JSON.stringify(active));
    } catch {
      setSnaps([]);
    }
  }

  function loadSpotlight(userId = me) {
    try {
      const raw = window.localStorage.getItem("blink_spotlight_" + userId);
      const items = raw ? JSON.parse(raw) : [];
      setSpotlight(Array.isArray(items) ? items : []);
    } catch {
      setSpotlight([]);
    }
  }

  function loadMemories(userId: string) {
    try {
      const raw = window.localStorage.getItem("blink_memories_" + userId);
      setMemoryItems(raw ? JSON.parse(raw) : []);
    } catch { setMemoryItems([]); }
  }

  function saveMemoryLocal(dataUrl: string, type: string, privateOnly = false) {
    const item = { id: crypto.randomUUID(), dataUrl, type, createdAt: new Date().toISOString(), privateOnly };
    const next = [item, ...memoryItems].slice(0, 100);
    try {
      window.localStorage.setItem("blink_memories_" + me, JSON.stringify(next));
      setMemoryItems(next);
      notify(privateOnly ? "Saved to My Eyes Only on this device." : "Saved to Memories on this device.");
    } catch {
      notify("Memory storage is full. Delete an old Memory first.");
    }
  }

  async function fileToDataUrl(file: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function saveCurrentSnapToMemory(privateOnly = false) {
    const file = (window as any).__blinkSnapFile as File | undefined;
    if (!file) return notify("Take or choose a Snap first.");
    if (file.size > 4 * 1024 * 1024) return notify("For browser Memories, choose a file under 4 MB.");
    const dataUrl = await fileToDataUrl(file);
    saveMemoryLocal(dataUrl, file.type, privateOnly);
  }

  async function publishSpotlight() {
    const file = (window as any).__blinkSnapFile as File | undefined;
    if (!file || !me) return notify("Take a Snap first.");
    if (file.size > 4 * 1024 * 1024) return notify("For browser-only Spotlight, choose a file under 4 MB.");
    try {
      const dataUrl = await fileToDataUrl(file);
      const post = {
        id: crypto.randomUUID(),
        user_id: me,
        media_path: dataUrl,
        media_type: file.type.startsWith("video/") ? "video" : "image",
        caption: snapCaption,
        created_at: new Date().toISOString()
      };
      const current = JSON.parse(window.localStorage.getItem("blink_spotlight_" + me) || "[]");
      const next = [post, ...current].slice(0, 60);
      window.localStorage.setItem("blink_spotlight_" + me, JSON.stringify(next));
      setSpotlight(next);
      notify("Spotlight saved only in this browser.");
    } catch {
      notify("Browser storage is full. Delete older local content first.");
    }
  }

  function toggleSpotlightLike(postId: string) {
    const key = "blink_spotlight_likes_" + me;
    const current = JSON.parse(window.localStorage.getItem(key) || "{}");
    current[postId] = !current[postId];
    window.localStorage.setItem(key, JSON.stringify(current));
    notify(current[postId] ? "Like added." : "Like removed.");
  }

  async function createGroup() {
    const members = [...new Set([me, ...groupMembers])];
    if (members.length < 3) return notify("Select at least two friends for a group.");
    if (!groupTitle.trim()) return notify("Enter a group name.");
    const localConversationId = "group:" + crypto.randomUUID();
    const groupsRaw = window.localStorage.getItem("blink_groups_" + me);
    const groups = groupsRaw ? JSON.parse(groupsRaw) : [];
    groups.unshift({ id: localConversationId, title: groupTitle.trim(), members });
    window.localStorage.setItem("blink_groups_" + me, JSON.stringify(groups));
    setGroupTitle(""); setGroupMembers([]);
    setConversationId(localConversationId); setActivePerson(null); setActiveBot(null); setTab("chat");
    notify("Local group chat created. Chat data stays in this browser.");
  }

  async function startVoiceRecording() {
    if (!conversationId || recordingVoice) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return notify("Voice recording is not supported by this browser.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      voiceChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size) voiceChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(voiceChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const file = new File([blob], "voice.webm", { type: blob.type });
        await sendChatFile(file);
      };
      voiceRecorderRef.current = recorder;
      recorder.start();
      setRecordingVoice(true);
    } catch { notify("Microphone permission was not granted."); }
  }

  function stopVoiceRecording() {
    voiceRecorderRef.current?.stop();
    voiceRecorderRef.current = null;
    setRecordingVoice(false);
  }

  function reactToMessage(messageId: string, emoji: string) {
    const key = "blink_reactions_" + me;
    const current = JSON.parse(window.localStorage.getItem(key) || "{}");
    current[messageId] = current[messageId] === emoji ? null : emoji;
    window.localStorage.setItem(key, JSON.stringify(current));
    notify(current[messageId] ? emoji + " reaction added." : "Reaction removed.");
  }

  function toggleSavedMessage(messageId: string) {
    const key = "blink_saved_messages_" + me;
    const current = JSON.parse(window.localStorage.getItem(key) || "[]") as string[];
    const next = current.includes(messageId) ? current.filter((id) => id !== messageId) : [...current, messageId];
    window.localStorage.setItem(key, JSON.stringify(next));
    notify(current.includes(messageId) ? "Message unsaved." : "Message saved.");
  }

  function personalityLabel(key: string) {
    const labels: Record<string, string> = {
      warm: "Warm · listens first", curious: "Curious · asks why", chill: "Chill · low pressure", bright: "Bright · upbeat",
      dry: "Dry · deadpan humor", chaotic: "Chaotic · unpredictable", shy: "Shy · gentle", confident: "Confident · direct",
      serious: "Serious · thoughtful", sarcastic: "Sarcastic · teasing", kind: "Kind · supportive", energetic: "Energetic · loud fun",
      philosopher: "Philosophical · reflective", competitive: "Competitive · goal driven", grouchy: "Grouchy · coffee powered",
      dramatic: "Dramatic · theatrical", practical: "Practical · useful", romantic: "Romantic · sentimental", storyteller: "Storyteller · vivid",
      rebel: "Rebel · questions rules", mischief: "Mischief · playful trouble", polite: "Polite · considerate", blunt: "Blunt · straight talk",
      motivator: "Motivator · encouraging", debater: "Debater · challenges ideas"
    };
    return labels[key] || "Distinct personality";
  }

  function loadBots() {
    setBots([
      { id: "mira-warm", bot_key: "warm", display_name: "Mira", avatar_emoji: "🌷" },
      { id: "leo-curious", bot_key: "curious", display_name: "Leo", avatar_emoji: "🔎" },
      { id: "sam-chill", bot_key: "chill", display_name: "Sam", avatar_emoji: "🧢" },
      { id: "nora-bright", bot_key: "bright", display_name: "Nora", avatar_emoji: "✨" },
      { id: "max-dry", bot_key: "dry", display_name: "Max", avatar_emoji: "😐" },
      { id: "ruby-chaotic", bot_key: "chaotic", display_name: "Ruby", avatar_emoji: "🔥" },
      { id: "eli-shy", bot_key: "shy", display_name: "Eli", avatar_emoji: "🌙" },
      { id: "zoe-confident", bot_key: "confident", display_name: "Zoe", avatar_emoji: "🕶️" },
      { id: "ivan-serious", bot_key: "serious", display_name: "Ivan", avatar_emoji: "📚" },
      { id: "maya-sarcastic", bot_key: "sarcastic", display_name: "Maya", avatar_emoji: "🙃" },
      { id: "aaron-kind", bot_key: "kind", display_name: "Aaron", avatar_emoji: "🤝" },
      { id: "tess-energetic", bot_key: "energetic", display_name: "Tess", avatar_emoji: "⚡" },
      { id: "noah-philosopher", bot_key: "philosopher", display_name: "Noah", avatar_emoji: "🌌" },
      { id: "jade-competitive", bot_key: "competitive", display_name: "Jade", avatar_emoji: "🏁" },
      { id: "ben-grouchy", bot_key: "grouchy", display_name: "Ben", avatar_emoji: "☕" },
      { id: "lina-dramatic", bot_key: "dramatic", display_name: "Lina", avatar_emoji: "🎭" },
      { id: "kai-practical", bot_key: "practical", display_name: "Kai", avatar_emoji: "🛠️" },
      { id: "rhea-romantic", bot_key: "romantic", display_name: "Rhea", avatar_emoji: "💌" },
      { id: "omar-storyteller", bot_key: "storyteller", display_name: "Omar", avatar_emoji: "📖" },
      { id: "ivy-rebel", bot_key: "rebel", display_name: "Ivy", avatar_emoji: "🧨" },
      { id: "dev-mischief", bot_key: "mischief", display_name: "Dev", avatar_emoji: "😈" },
      { id: "anna-polite", bot_key: "polite", display_name: "Anna", avatar_emoji: "🌼" },
      { id: "cole-blunt", bot_key: "blunt", display_name: "Cole", avatar_emoji: "🪨" },
      { id: "sana-motivator", bot_key: "motivator", display_name: "Sana", avatar_emoji: "🏆" },
      { id: "raj-debater", bot_key: "debater", display_name: "Raj", avatar_emoji: "⚖️" }
    ]);
  }

  function casualGreeting(text: string): boolean {
    const value = text.trim().toLowerCase();
    if (!value) return false;
    if (/^(hi+|hello+|hey+|hiya|hola|namaste|yo+|sup+|wassup|wazzup|ayo|howdy|morning|good morning|good evening)[!?., ]*$/i.test(value)) return true;
    const target = "howdy";
    if (value.length >= 4 && value.length <= 8) {
      let previous = Array.from({ length: target.length + 1 }, (_, i) => i);
      for (let i = 0; i < value.length; i += 1) {
        const current = [i + 1];
        for (let j = 0; j < target.length; j += 1) current.push(Math.min(current[j] + 1, previous[j + 1] + 1, previous[j] + (value[i] === target[j] ? 0 : 1)));
        previous = current;
      }
      if (previous[target.length] <= 2) return true;
    }
    return false;
  }

  function computerReply(bot: Bot, body: string): string {
    const text = body.trim();
    const lower = text.toLowerCase();
    const name = bot.display_name;
    if (!text) return "...";
    if (casualGreeting(text)) {
      const greetings: Record<string,string[]> = {
        warm: ["Hey 😊", "Heyyy. Good to see you.", "Howdy! How are you?"],
        curious: ["Hey! What is going on?", "Howdy 👀 what is the story?", "Yo, what is up?"],
        chill: ["Hey 😎 what is up?", "Howdy. Just vibing.", "Yo 😎"],
        bright: ["Heyyy! ✨", "Howdy! I am listening 😄", "Yooo! What is good?"],
        dry: ["Howdy.", "Well, hello there.", "Ah. A greeting."],
        chaotic: ["HOWDYYYY 😂", "YOOOOO 😭", "AYOOO, what is happening?!"],
        shy: ["Oh... hey.", "Um, hi.", "Oh. Howdy... I guess 😅"],
        confident: ["Hey. What is up?", "Howdy. What have you got?", "Yo."],
        serious: ["Hello. What is going on?", "Howdy. How can I help?", "Hey. I am listening."],
        sarcastic: ["Well, well, well. Howdy.", "Ah yes, a greeting. Revolutionary.", "Howdy, partner 🤠"],
        kind: ["Hey 😊 I am here.", "Howdy. How are you doing?", "Heyyy, good to hear from you."],
        energetic: ["HEY! 😂 What is happening?!", "HOWDYYYY! 🔥", "YOOOO!"],
        philosopher: ["Howdy. Funny how a simple greeting can start a whole conversation.", "Hello. What is on your mind?", "Hey. Where are we going with this?"],
        competitive: ["Howdy. Let us hear it.", "Yo. What is the challenge?", "Hey. What are we tackling today?"],
        grouchy: ["Howdy. Coffee first.", "Hey. I am awake, unfortunately.", "Yeah, hi. What is up?"],
        dramatic: ["HOWDY?! The entrance has been made.", "Well HELLO there.", "Ah. The protagonist has arrived."],
        practical: ["Hey. What is up?", "Howdy. What is the situation?", "Hi. What do you need?"],
        romantic: ["Hey you 💌", "Howdy. Nice to hear from you.", "Heyyy. I was wondering when you would show up."],
        storyteller: ["Howdy! Now that is an entrance.", "Well hello there. This feels like the start of a story.", "Hey. Come on, tell me what is happening."],
        rebel: ["Howdy. Why should greetings be boring anyway?", "Yo. What is really going on?", "Hey. Skip the small talk if you want."],
        mischief: ["Howdy 🤠 I have a suspicious feeling about this.", "Yooo 😈 what is the plan?", "Ayo. This could get interesting."],
        polite: ["Hello! It is nice to hear from you.", "Howdy, and hello to you.", "Good to hear from you."],
        blunt: ["Hey. What is up?", "Howdy.", "Yo."],
        motivator: ["Hey! Let us make today count.", "Howdy! What is the next move?", "Yo! What are we working on?"],
        debater: ["Howdy. What are we arguing about today?", "Hey. Give me your take.", "Yo. What is your position?"]
      };
      const options = greetings[bot.bot_key] || ["Hey. It is " + name + ". What is going on?"];
      return options[Math.floor(Math.random() * options.length)];
    }
    if (/\b(name|who are you)\b/.test(lower)) return "I am " + name + ". That is what people here call me.";
    if (/\b(how are you|howre you)\b/.test(lower)) return bot.bot_key === "energetic" ? "Fantastic. Way too much energy today." : bot.bot_key === "grouchy" ? "I have been better. Coffee would help." : "I am doing alright.";
    if (/\b(bye|goodnight|good night)\b/.test(lower)) return "See you around.";
    const slangKey = /\b(fr|frfr|no cap)\b/.test(lower) ? "fr" : /\b(lol+|lmao+|lmfao+)\b|[😂🤣💀😭]/.test(lower) ? "lol" : /\b(bro+|bruh+|dude)\b/.test(lower) ? "bro" : /\b(nah+|nope)\b/.test(lower) ? "nah" : /\b(bet)\b/.test(lower) ? "bet" : /\b(ngl|tbh)\b/.test(lower) ? "ngl" : /\b(idk|dunno)\b/.test(lower) ? "idk" : /\b(cooked)\b/.test(lower) ? "cooked" : /\b(mid)\b/.test(lower) ? "mid" : /\b(sus)\b/.test(lower) ? "sus" : null;
    const slangReplies: Record<string,string[]> = { fr: ["fr 😭", "Yeah, honestly.", "No cap."], lol: ["lmao 😂", "😭 okay, that got me.", "lol yeah."], bro: ["bro 😭", "BRO, what happened?", "Yeahhh bro, I am listening."], nah: ["nahhh 😂", "Yeah, I am not buying that.", "Fair. Nah."], bet: ["Bet.", "Alright, deal.", "Say less."], ngl: ["Honestly? Same.", "Ngl, I get it.", "Yeah, fair."], idk: ["Fair. Sometimes you just do not know.", "Yeah, that is okay.", "Honestly, same."], cooked: ["💀 How cooked are we talking?", "Oh no 😭", "Yeahhh, that is not ideal."], mid: ["Mid? 😭", "Okay, harsh.", "Honestly... maybe."], sus: ["💀 that is a little sus.", "Okay, now I am suspicious.", "Hmm. Very sus."] };
    if (slangKey) {
      if (bot.bot_key === "serious" || bot.bot_key === "polite") return slangKey === "bro" ? "I get you. What is going on?" : "I understand. Tell me more.";
      const options = slangReplies[slangKey];
      if (options) return options[Math.floor(Math.random() * options.length)];
    }
    if (/\\b(hp?wd?y|howdy|what'?s up|whats up|what are you doing|wyd)\\b/i.test(lower)) {
      const casual: Record<string,string[]> = {
        warm: ["Not much. I am here though. What is going on with you?", "Just hanging around. How is your day actually going?"],
        curious: ["Now I want the real answer. What are you up to?", "Okay, but what is the story behind that?"],
        chill: ["Not much 😎 just taking it easy. You?", "Just vibing. What about you?"],
        bright: ["I am good! What are you up to? ✨", "Doing alright! Give me the interesting version."],
        dry: ["Existing. Very ambitious, I know.", "Apparently I am answering questions today."],
        chaotic: ["CURRENTLY MAKING QUESTIONABLE LIFE CHOICES 😂 You?", "Trying to behave. It is not going well."],
        shy: ["Um... not much. I am glad you messaged though.", "Just here. What are you doing?"],
        confident: ["I am good. What are you working on?", "Doing fine. Your turn."],
        serious: ["I am alright. What is actually on your mind?", "Doing okay. What brought you here?"],
        sarcastic: ["Oh, you know. Thriving dramatically.", "Living the dream. The budget version."],
        kind: ["I am okay. Thanks for asking. How are you really doing?", "I am here. Tell me what is going on."],
        energetic: ["FULL POWER 😂 What are YOU doing?!", "I am good! Give me the update!"],
        philosopher: ["Doing alright. Funny how 'what are you doing?' can mean 'how are you?' too.", "I am here, thinking about things. What about you?"],
        competitive: ["I am good. What are we trying to accomplish?", "Ready. What is today's challenge?"],
        grouchy: ["Surviving. Coffee would improve the situation.", "Still here. Against all odds."],
        dramatic: ["I am surviving act two. The plot remains unstable.", "Present, alive, and waiting for the next plot twist."],
        practical: ["I am good. What do you need?", "Doing fine. What is the next thing?"],
        romantic: ["I am good. It is nicer now that you are here.", "Just thinking. And now I am curious about you."],
        storyteller: ["I am between chapters. What happened in your day?", "Waiting for the next interesting scene, apparently."],
        rebel: ["Doing my own thing. Obviously.", "Questioning the premise, as usual."],
        mischief: ["Planning absolutely nothing suspicious. Probably.", "Trying not to cause trouble. No promises."],
        polite: ["I am doing well, thank you. How are you?", "I am alright. It is nice to hear from you."],
        blunt: ["I am fine. What do you want to talk about?", "Good enough. Your turn."],
        motivator: ["Doing well. Now tell me what you are working toward.", "I am good. What is your next move?"],
        debater: ["I am fine. But what do you actually mean by 'howdy'?", "Doing alright. What is your position on the day so far?"]
      };
      const options = casual[bot.bot_key] || casual.warm;
      return options[Math.floor(Math.random() * options.length)];
    }
    const replies: Record<string,string[]> = { warm: ["That sounds important to you. Tell me more.", "I am listening. No rush.", "Yeah, I get why you would feel that way."], curious: ["Wait, why? I need the backstory.", "Interesting. What happened next?", "Okay, now I am curious."], chill: ["Fair enough 😎", "Yeah, that is a vibe.", "I can live with that."], bright: ["Okayyy, I like where this is going!", "That actually sounds fun.", "Wait, that is kind of great."], dry: ["Well. That certainly happened.", "Ah yes, the classic situation.", "Beautiful. A tiny disaster with excellent timing."], chaotic: ["OH. We are doing this now.", "Okay, this escalated beautifully.", "I have questions. Probably bad ones."], shy: ["Oh... yeah, I get that.", "Um. Okay. I was thinking about that too.", "I do not know if this helps, but..."], confident: ["I see the situation.", "Yeah. I know what I would do.", "That is manageable."], serious: ["Let us look at this carefully.", "There are a couple of things here.", "Okay. Let us separate the facts from the noise."], sarcastic: ["Oh, excellent. Because apparently life needed another subplot.", "Naturally. Why would anything be simple?", "Love that for you. Truly."], kind: ["That sounds hard.", "I get why that would matter to you.", "Hey, that is okay."], energetic: ["YES! Okay, I am listening!", "Ohhh, now we are talking!", "Okay! Give me the whole story!"], philosopher: ["That is interesting, because it says something bigger too.", "Hmm. There is a deeper question underneath that.", "Maybe the strange part is why we care about it at all."], competitive: ["Okay. I see the challenge.", "Interesting. Now I want to beat that problem.", "Fine. Let us make a plan."], grouchy: ["Yeah, because apparently peace was too much to ask.", "Great. Another thing to deal with.", "I have opinions, and most of them involve coffee."], dramatic: ["Oh, this is a MOMENT.", "I can already hear the soundtrack.", "No. No, this deserves a full story."], practical: ["Okay. Let us make this useful.", "Simple version: here is what matters.", "Got it. We can work with that."], romantic: ["That has a little more feeling in it than you are admitting.", "Hmm. That sounds like one of those moments.", "Some things are easier to feel than explain."], storyteller: ["Oh, I can see the scene already.", "Now that sounds like the beginning of a story.", "And suddenly, the ordinary day was not ordinary anymore."], rebel: ["Why are we assuming the usual way is the right way?", "I would question that rule.", "Maybe the problem is the rule itself."], mischief: ["I have a terrible idea.", "This is dangerously entertaining.", "Okay, do not panic, but I have a plan."], polite: ["I understand.", "That makes sense.", "Thank you for explaining that."], blunt: ["Okay. Straight answer.", "Here is the thing.", "I am going to be direct."], motivator: ["Good. Keep going.", "That is a start.", "You are not stuck; you are just at the next step."], debater: ["I can see the argument, but I am not convinced yet.", "Okay, let us test that idea.", "There is another side to this."] };
    const options = replies[bot.bot_key] || replies.warm;
    return options[Math.floor(Math.random() * options.length)];
  }
  function openFriendChat(friend: Person) {
    setActivePerson(friend);
    setActiveBot(null);
    setConversationId("friend:" + friend.id);
    setTab("chat");
    loadLocalChat("friend:" + friend.id);
  }

  async function openBotChat(bot: Bot) {
    const localConversationId = "bot:" + bot.id;
    setActiveBot(bot);
    setActivePerson(null);
    setConversationId(localConversationId);
    setTab("chat");
    loadLocalChat(localConversationId);
  }

  async function sendText() {
    if (!message.trim() || !conversationId || !me) return;
    const body = message.trim();
    setMessage("");
    const item: Message = {
      id: crypto.randomUUID(), conversation_id: conversationId, sender_id: me, sender_bot_id: null,
      body, media_path: null, message_type: "text", created_at: new Date().toISOString(),
      expires_at: chatRetention === "seen" ? "after_seen" : new Date(Date.now() + retentionMs(chatRetention)).toISOString()
    };
    const raw = window.localStorage.getItem(localChatKey(conversationId));
    const current: Message[] = raw ? JSON.parse(raw) : [];
    const next = [...current, item];
    saveLocalChat(conversationId, next);
    if (activePerson) {
      const channel = supabase.channel("blink-user:" + activePerson.id, { config: { private: true } });
      const result = await channel.send({
        type: "broadcast",
        event: "blink",
        payload: {
          kind: "chat",
          id: item.id,
          sender_id: me,
          recipient_id: activePerson.id,
          body,
          message_type: "text",
          created_at: item.created_at,
          expires_at: item.expires_at
        }
      });
      await supabase.removeChannel(channel);
      if (result === "error") notify("Message could not be delivered. The friend may be offline.");
    }
    if (activeBot) {
      let replyBody = "";
      const base = (process.env.NEXT_PUBLIC_BLINK_COMPUTER_URL || "").replace(/\/$/, "");
      if (base) {
        try {
          const response = await fetch(base + "/reply", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversation_id: conversationId, bot_key: activeBot.bot_key, bot_name: activeBot.display_name, message: body, history: next.slice(-12) })
          });
          if (response.ok) {
            const data = await response.json();
            if (typeof data.reply === "string" && data.reply.trim()) replyBody = data.reply.trim();
          }
        } catch {}
      }
      if (!replyBody) replyBody = computerReply(activeBot, body);
      const reply: Message = {
        id: crypto.randomUUID(), conversation_id: conversationId, sender_id: null, sender_bot_id: activeBot.id,
        body: replyBody, media_path: null, message_type: "text",
        created_at: new Date(Date.now() + 50).toISOString(),
        expires_at: chatRetention === "seen" ? "after_seen" : new Date(Date.now() + retentionMs(chatRetention)).toISOString()
      };
      saveLocalChat(conversationId, [...next, reply]);
    }
  }
  async function sendChatFile(file: File) {
    if (!conversationId || !me) return;
    if (file.size > 4 * 1024 * 1024) {
      notify("For browser-only Chat, choose a file under 4 MB.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    const type = file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "voice" : "image";
    const item: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      sender_id: me,
      sender_bot_id: null,
      body: null,
      media_path: dataUrl,
      message_type: type,
      created_at: new Date().toISOString(),
      expires_at: chatRetention === "seen" ? "after_seen" : new Date(Date.now() + retentionMs(chatRetention)).toISOString()
    };
    const raw = window.localStorage.getItem(localChatKey(conversationId));
    const current: Message[] = raw ? JSON.parse(raw) : [];
    try {
      saveLocalChat(conversationId, [...current, item]);
      if (activePerson) {
        const channel = supabase.channel("blink-user:" + activePerson.id, { config: { private: true } });
        const result = await channel.send({
          type: "broadcast",
          event: "blink",
          payload: {
            kind: "media",
            id: item.id,
            sender_id: me,
            recipient_id: activePerson.id,
            media_path: dataUrl,
            message_type: type,
            created_at: item.created_at,
            expires_at: item.expires_at
          }
        });
        await supabase.removeChannel(channel);
        if (result === "error") notify("Media could not be delivered. The friend may be offline.");
      } else if (activeBot) {
        notify("Media saved in this browser. Character chats reply to text.");
      }
    } catch {
      notify("Browser storage is full. Delete older local chats or media.");
    }
  }

  async function startCamera() {
    if (typeof window === "undefined") return;
    if (!window.isSecureContext) {
      notify("Camera needs HTTPS. Open the deployed BLINK address, not an insecure HTTP page.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      notify("This browser does not expose camera access here. Use HTTPS in Chrome or Edge.");
      return;
    }

    try {
      if (streamRef.current) stopCamera();

      // Ask for the requested lens explicitly. "ideal" can be ignored by mobile browsers,
      // which is why the old version sometimes stayed on the front camera.
      const baseVideo = {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { ...baseVideo, facingMode: { exact: cameraFacing } },
          audio: false
        });
      } catch (exactError) {
        // Some desktop browsers do not support an exact facingMode. Fall back to
        // enumerating physical cameras and selecting a rear/front device by label.
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const wanted = cameraFacing === "environment"
          ? /(back|rear|environment|world|main)/i
          : /(front|user|facetime|selfie)/i;
        const opposite = cameraFacing === "environment"
          ? /(front|user|facetime|selfie)/i
          : /(back|rear|environment|world|main)/i;
        const labelled = cameras.find((device) => wanted.test(device.label));
        const fallback = labelled ?? cameras.find((device) => !opposite.test(device.label)) ?? cameras[0];

        if (!fallback?.deviceId) throw exactError;

        stream = await navigator.mediaDevices.getUserMedia({
          video: { ...baseVideo, deviceId: { exact: fallback.deviceId } },
          audio: false
        });
      }

      streamRef.current = stream;

      // Verify the browser actually selected the requested facing direction.
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings();
      if (cameraFacing === "environment" && settings?.facingMode === "user") {
        track.stop();
        streamRef.current = null;
        setCameraOn(false);
        notify("The browser did not switch to the back camera. Please try Back again.");
        return;
      }

      setCameraOn(true);
      requestAnimationFrame(async () => {
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        try { await video.play(); } catch {}
      });
    } catch (error) {
      const err = error as DOMException;
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        notify("Camera permission is blocked. Allow Camera for BLINK in your browser site settings, then try again.");
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        notify("No camera was found on this device.");
      } else if (err?.name === "NotReadableError" || err?.name === "TrackStartError") {
        notify("The camera is already being used by another app. Close it and try again.");
      } else if (err?.name === "OverconstrainedError") {
        notify("That camera mode is unavailable on this device.");
      } else if (err?.name === "SecurityError") {
        notify("The browser blocked camera access. Use the HTTPS BLINK site and allow Camera.");
      } else {
        notify("Could not open the requested camera. Check browser camera permission and try again.");
      }
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
    if (snapTimer > 0) await new Promise(resolve => window.setTimeout(resolve, snapTimer * 1000));
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.filter = cameraFilter === "mono" ? "grayscale(1)" : cameraFilter === "sepia" ? "sepia(1)" : cameraFilter === "vivid" ? "saturate(1.7) contrast(1.08)" : cameraFilter === "cool" ? "hue-rotate(25deg) saturate(1.2)" : "none";
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (blob) await prepareSnap(new File([blob], "camera.jpg", { type: "image/jpeg" }));
  }

  async function sendSnap() {
    const file = (window as any).__blinkSnapFile as File | undefined;
    if (!file || !me || !selectedRecipients.length) {
      notify("Choose at least one friend.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      notify("For browser-only Snaps, choose a file under 4 MB.");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      const snap: Snap = {
        id: crypto.randomUUID(),
        sender_id: me,
        media_path: dataUrl,
        media_type: file.type.startsWith("video/") ? "video" : "image",
        caption: snapCaption,
        duration_seconds: 10,
        created_at: new Date().toISOString(),
        expires_at: snapRetention === "seen" ? new Date(Date.now() + 7 * 86400000).toISOString() : new Date(Date.now() + retentionMs(snapRetention)).toISOString()
      };
      const raw = window.localStorage.getItem(localSnapKey());
      const current: Snap[] = raw ? JSON.parse(raw) : [];
      window.localStorage.setItem(localSnapKey(), JSON.stringify([...current, snap]));
      for (const recipientId of selectedRecipients) {
        const channel = supabase.channel("blink-user:" + recipientId, { config: { private: true } });
        const result = await channel.send({
          type: "broadcast",
          event: "blink",
          payload: {
            kind: "snap",
            id: snap.id,
            sender_id: me,
            recipient_id: recipientId,
            media_path: snap.media_path,
            media_type: snap.media_type,
            caption: snap.caption,
            duration_seconds: snap.duration_seconds,
            created_at: snap.created_at,
            expires_at: snap.expires_at
          }
        });
        await supabase.removeChannel(channel);
        if (result === "error") notify("A Snap could not be delivered to one or more recipients.");
      }
      setSnapPreview("");
      setSnapCaption("");
      setSelectedRecipients([]);
      (window as any).__blinkSnapFile = undefined;
      await loadSnaps(me);
      notify("Snap saved only in this browser. It is not stored in the database or server storage.");
    } catch {
      notify("Browser storage is full. Delete older local Snaps or Memories.");
    }
  }

  async function publishStory() {
    if (!storyFile || !me) return;
    if (storyFile.size > 4 * 1024 * 1024) return notify("For browser-only Stories, choose a file under 4 MB.");
    try {
      const dataUrl = await fileToDataUrl(storyFile);
      const story: Story = {
        id: crypto.randomUUID(),
        user_id: me,
        media_path: dataUrl,
        media_type: storyFile.type.startsWith("video/") ? "video" : "image",
        caption: null,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString()
      };
      const current = JSON.parse(window.localStorage.getItem(localStoriesKey(me)) || "[]");
      const next = [story, ...current].slice(0, 100);
      window.localStorage.setItem(localStoriesKey(me), JSON.stringify(next));
      setStories(next);
      setStoryFile(null);
      notify("Story saved only in this browser for 24 hours.");
    } catch {
      notify("Browser storage is full. Delete older local content first.");
    }
  }

  async function mediaUrl(path: string) {
    return path;
  }

  async function openSnap(snap: Snap) {
    if (!snap.media_path) {
      notify("Snap expired.");
      return;
    }
    window.open(snap.media_path, "_blank", "noopener,noreferrer");
    const raw = window.localStorage.getItem(localSnapKey());
    const current: Snap[] = raw ? JSON.parse(raw) : [];
    const next = current.filter((x) => x.id !== snap.id);
    window.localStorage.setItem(localSnapKey(), JSON.stringify(next));
    setSnaps(next);
  }

  async function findUser(search: string) {
    const value = search.trim().toLowerCase();
    setQuery(search);
    if (!value) {
      setPeople([]);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", value + "%")
      .neq("id", me)
      .limit(30);
    if (error) {
      setPeople([]);
      notify("Could not search usernames right now.");
      return;
    }
    const results = (data ?? []).map((p: { id: string; username: string }) => ({
      id: p.id,
      username: p.username,
    }));
    setPeople(results);
    setDirectory((current) => {
      const merged = new Map(current.map((p) => [p.id, p]));
      results.forEach((p) => merged.set(p.id, p));
      return Array.from(merged.values());
    });
  }

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const nav: [Tab, string, string][] = [
    ["camera", "◉", "Camera"], ["chat", "◌", "Chat"], ["friends", "♙", "Friends"],
    ["stories", "◫", "Stories"], ["spotlight", "▷", "Spotlight"], ["map", "⌖", "Map"], ["memories", "▣", "Memories"], ["profile", "●", "Account"]
  ];

  return <main className="blink-app">
    <header className="blink-topbar">
      <button className="blink-brand" onClick={() => setTab("camera")}>BLINK</button>
      <div className="blink-top-actions">
        <button className="blink-round" onClick={() => setTab("friends")}>⌕</button><button className="blink-round" onClick={() => setTab("spotlight")}>▷</button><button className="blink-round" onClick={() => setTab("memories")}>▣</button>
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
              <button onClick={() => saveCurrentSnapToMemory(false)}>Save</button>
              <button onClick={() => saveCurrentSnapToMemory(true)}>🔒 My Eyes Only</button>
              <button onClick={publishSpotlight}>▷ Spotlight</button>
              <button className="blink-primary" onClick={sendSnap} disabled={busy}>Send Snap</button>
            </div>
          </div> : cameraOn ? <>
            <video ref={videoRef} autoPlay playsInline muted className="blink-video" onLoadedMetadata={(e) => { e.currentTarget.play().catch(() => {}); }} style={{ filter: cameraFilter === "mono" ? "grayscale(1)" : cameraFilter === "sepia" ? "sepia(1)" : cameraFilter === "vivid" ? "saturate(1.7) contrast(1.08)" : cameraFilter === "cool" ? "hue-rotate(25deg) saturate(1.2)" : "none", transform: `scale(${cameraZoom})` }} />
            <div className="blink-camera-gradient" />
            {cameraLens !== "none" && <div className="blink-camera-lens" aria-hidden="true">{cameraLens === "hearts" ? "💗  💗" : cameraLens === "dog" ? "🐶" : cameraLens === "crown" ? "👑" : "👽"}</div>}
            <div className="blink-camera-toolbar">
              <button className={cameraFacing === "user" ? "active" : ""} onClick={() => { if (cameraFacing !== "user") { stopCamera(); setCameraFacing("user"); window.setTimeout(startCamera, 120); } }} aria-label="Use front camera" title="Front camera">🤳 Front</button>
              <button className={cameraFacing === "environment" ? "active" : ""} onClick={() => { if (cameraFacing !== "environment") { stopCamera(); setCameraFacing("environment"); window.setTimeout(startCamera, 120); } }} aria-label="Use back camera" title="Back camera">📷 Back</button>
              <button className={flashOn ? "active" : ""} onClick={async () => {
                const track = streamRef.current?.getVideoTracks()[0];
                const capabilities = track?.getCapabilities?.() as any;
                if (capabilities?.torch) { await track?.applyConstraints({ advanced: [{ torch: !flashOn }] } as any); setFlashOn(!flashOn); }
                else notify("Flash/torch is not available on this device.");
              }}>⚡</button>
              <button onClick={() => { stopCamera(); setCameraFacing(cameraFacing === "user" ? "environment" : "user"); window.setTimeout(startCamera, 120); }}>↔</button>
              <button onClick={() => setCameraFilter(cameraFilter === "normal" ? "mono" : cameraFilter === "mono" ? "sepia" : cameraFilter === "sepia" ? "vivid" : cameraFilter === "vivid" ? "cool" : "normal")}>✦</button>
              <button onClick={() => setCameraLens(cameraLens === "none" ? "hearts" : cameraLens === "hearts" ? "dog" : cameraLens === "dog" ? "crown" : cameraLens === "crown" ? "alien" : "none")}>◎</button>
              <button onClick={() => snapFileRef.current?.click()}>▣</button>
              <button onClick={stopCamera}>×</button>
            </div>
            <div className="blink-camera-controls">
              <button onClick={() => setCameraZoom(Math.max(1, Math.min(2, Number((cameraZoom + .25).toFixed(2)))))}>＋</button>
              <button onClick={() => setCameraZoom(Math.max(1, Number((cameraZoom - .25).toFixed(2))))}>−</button>
              <button onClick={() => setSnapTimer(snapTimer === 0 ? 3 : snapTimer === 3 ? 10 : 0)}>⏱ {snapTimer || "0"}s</button>
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
            <Avatar id={f.id} /><span>{f.username || shortId(f.id)}</span>
          </button>)}
          <input value={snapCaption} onChange={(e) => setSnapCaption(e.target.value)} placeholder="Caption…" />
        </div>}
        {snaps.length > 0 && <div className="blink-inbox-snaps"><b>New Snaps</b>{snaps.map((s) =>
          <button key={s.id} onClick={() => openSnap(s)}>● {s.media_type} Snap</button>
        )}</div>}
      </div>}

      {tab === "chat" && <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">DEVICE-LOCAL EPHEMERAL CHAT</span><h1>Chat</h1></div><button className="blink-primary small" onClick={() => setTab("friends")}>＋ New chat</button><button className="blink-button secondary small" onClick={() => notify("Select friends below to create a group.")}>👥 Group</button></div>
        <div className="blink-ephemeral-settings">
          <label>Delete chat messages
            <select className="blink-search" value={chatRetention} onChange={(e) => { setChatRetention(e.target.value); window.localStorage.setItem("blink_chat_retention", e.target.value); }}>
              <option value="seen">After seen</option>
              <option value="10s">After 10 seconds</option>
              <option value="1m">After 1 minute</option>
              <option value="5m">After 5 minutes</option>
              <option value="1h">After 1 hour</option>
              <option value="24h">After 24 hours</option>
              <option value="7d">After 7 days</option>
            </select>
          </label>
          <label>Delete Snaps
            <select className="blink-search" value={snapRetention} onChange={(e) => { setSnapRetention(e.target.value); window.localStorage.setItem("blink_snap_retention", e.target.value); }}>
              <option value="seen">After seen</option>
              <option value="10s">After 10 seconds</option>
              <option value="1m">After 1 minute</option>
              <option value="5m">After 5 minutes</option>
              <option value="1h">After 1 hour</option>
              <option value="24h">After 24 hours</option>
              <option value="7d">After 7 days</option>
            </select>
          </label>
        </div>
        <div className="blink-group-create">
          <input className="blink-search" value={groupTitle} onChange={e => setGroupTitle(e.target.value)} placeholder="Group name" />
          <div className="blink-group-members">{friends.map(f => <button key={f.id} className={groupMembers.includes(f.id) ? "selected" : ""} onClick={() => setGroupMembers(s => s.includes(f.id) ? s.filter(x => x !== f.id) : [...s, f.id])}>@{f.username}</button>)}</div>
          <button className="blink-primary small" onClick={createGroup}>Create group</button>
        </div>
        <div className="blink-chat-layout">
          <aside className="blink-chat-list">
            <div className="blink-bot-list"><b>PEOPLE — EVERYONE HAS A PERSONALITY</b>{bots.map((b) =>
              <button key={b.id} className={activeBot?.id === b.id ? "blink-chat-row selected" : "blink-chat-row"} onClick={() => openBotChat(b)}>
                <Avatar emoji={b.avatar_emoji} /><span className="blink-chat-copy"><b>{b.display_name}</b><small>{personalityLabel(b.bot_key)}</small></span>
              </button>
            )}</div>
            {friends.length ? friends.map((f) =>
              <button key={f.id} className={activePerson?.id === f.id ? "blink-chat-row selected" : "blink-chat-row"} onClick={() => openFriendChat(f)}>
                <Avatar id={f.id} /><span className="blink-chat-copy"><b>{f.username || shortId(f.id)}</b><small>Browser-only · {chatRetention === "seen" ? "after seen" : chatRetention}</small></span>
              </button>
            ) : <div className="blink-empty">Add a friend to start messaging.</div>}
          </aside>
          <section className="blink-conversation">
            {(activePerson || activeBot) ? <>
              <div className="blink-conversation-head">
                <Avatar id={activePerson?.id} emoji={activeBot?.avatar_emoji} />
                <div><b>{activeBot?.display_name ?? "@" + (activePerson?.username ?? shortId(activePerson?.id ?? ""))}</b><small>{activeBot ? personalityLabel(activeBot.bot_key) : "Friend · browser-only chat"} · {chatRetention === "seen" ? "disappears after seen" : "expires " + chatRetention}</small></div>
              </div>
              <div className="blink-messages">
                {messages.map((m) => {
                  const botProfile = Array.isArray(m.bot_profiles) ? m.bot_profiles[0] : m.bot_profiles;
                  const mine = m.sender_id === me;
                  return <div key={m.id} className={"blink-message-line " + (mine ? "mine" : "")}>
                    <div className={"blink-bubble " + (mine ? "mine" : "other")} onClick={() => { if (!mine && m.expires_at === "after_seen") { const raw = window.localStorage.getItem(localChatKey(conversationId)); const current: Message[] = raw ? JSON.parse(raw) : []; saveLocalChat(conversationId, current.filter(x => x.id !== m.id)); } }}>
                      {m.media_path ? "[" + m.message_type + " · disappearing]" : m.body}
                      {botProfile && <small className="blink-bot-tag">{botProfile.avatar_emoji} {botProfile.display_name}</small>}
                      {!botProfile && <div className="blink-message-tools"><button onClick={() => reactToMessage(m.id, "❤️")}>❤️</button><button onClick={() => reactToMessage(m.id, "😂")}>😂</button><button onClick={() => toggleSavedMessage(m.id)}>🔖</button></div>}
                    </div>
                  </div>;
                })}
              </div>
              <div className="blink-composer">
                <button onClick={() => chatFileRef.current?.click()}>＋</button>
                <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendText()} placeholder={activeBot ? "Write a message…" : "Send a message…"} />
                <button onClick={recordingVoice ? stopVoiceRecording : startVoiceRecording}>{recordingVoice ? "■" : "🎙"}</button>
                <button onClick={sendText}>➤</button>
                <input ref={chatFileRef} hidden type="file" accept="image/*,video/*,audio/*" capture="environment" onChange={(e) => {
                  const f = e.target.files?.[0]; if (f) sendChatFile(f);
                }} />
              </div>
            </> : <div className="blink-empty">Choose someone to talk to. Your chats stay on this device.</div>}
          </section>
        </div>
      </div>}

      {tab === "friends" && <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">USERNAME DIRECTORY</span><h1>Friends</h1></div></div>
        <input className="blink-search" value={query} onChange={(e) => findUser(e.target.value)} placeholder="Search people by username…" />
        {requests.length > 0 && <div className="blink-request-box"><b>Friend requests</b>{requests.map((p) =>
          <div key={p.id}><Avatar id={p.id} /><span>@{p.username || "blink_user"}</span><button className="blink-primary small" onClick={() => respondToRequest(p, "accepted")}>Accept</button><button className="blink-button secondary small" onClick={() => declineRequest(p)}>Decline</button></div>
        )}</div>}
        <div className="blink-friend-grid">
          {(query ? people : directory).map((p) => <article className="blink-friend-card" key={p.id}>
            <Avatar id={p.id} large /><h3>@{p.username || "blink_user"}</h3><p>BLINK member · username searchable</p>
            <div className="blink-card-actions">
              {friendIds.has(p.id) ? <button onClick={() => openFriendChat(p)}>Chat</button> : outgoing.some((x) => x.id === p.id) ? <button onClick={() => cancelRequest(p)}>Requested · Cancel</button> : requests.some((x) => x.id === p.id) ? <button onClick={() => respondToRequest(p, "accepted")}>Accept request</button> : <button onClick={() => sendFriendRequest(p)}>＋ Add friend</button>}
              <button onClick={() => blocked.some((b) => b.id === p.id) ? unblockUser(p) : blockUser(p)}>{blocked.some((b) => b.id === p.id) ? "Unblock" : "Block"}</button>
            </div>
          </article>)}
        </div>
        {outgoing.length > 0 && <div className="blink-request-box"><b>Sent requests</b>{outgoing.map((p) => <div key={p.id}><Avatar id={p.id} /><span>@{p.username || "blink_user"}</span><button onClick={() => cancelRequest(p)}>Cancel request</button></div>)}</div>}
        {blocked.length > 0 && <div className="blink-request-box"><b>Blocked by you</b>{blocked.map((p) =>
          <div key={p.id}><Avatar id={p.id} /><span>@{p.username || "blink_user"}</span><button onClick={() => unblockUser(p)}>Unblock</button></div>
        )}</div>}
      </div>}

      {tab === "stories" && <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">BROWSER ONLY · 24 HOURS</span><h1>Stories</h1></div><button className="blink-primary small" onClick={() => storyFileRef.current?.click()}>＋ Story</button></div>
        <input ref={storyFileRef} hidden type="file" accept="image/*,video/*" capture="environment" onChange={(e) => {
          const f = e.target.files?.[0]; if (f) { setStoryFile(f); notify("Story ready."); }
        }} />
        {storyFile && <div className="blink-story-compose"><b>{storyFile.name}</b><select className="blink-search" defaultValue="friends" onChange={(e) => (window as any).__blinkStoryPrivacy = e.target.value}><option value="friends">My Story · Friends</option><option value="public">My Story · Public</option><option value="private">Private Story</option></select><button className="blink-primary" onClick={publishStory} disabled={busy}>Post Story</button></div>}
        <div className="blink-story-grid">{stories.map((s) =>
          <button key={s.id} className="blink-story-card" onClick={() => { if (s.media_path) window.open(s.media_path, "_blank", "noopener,noreferrer"); }}>
            <div className="blink-story-ring"><span>{shortId(s.user_id)}</span></div><b>{s.user_id === me ? "Your Story" : shortId(s.user_id)}</b><small>browser-local · expires in 24h</small>
          </button>
        )}</div>
      </div>}


      {tab === "spotlight" && (
        <div className="blink-panel">
          <div className="blink-panel-head"><div><span className="blink-eyebrow">PUBLIC DISCOVERY</span><h1>Spotlight</h1></div><button className="blink-primary small" onClick={() => setTab("camera")}>＋ Create</button></div>
          <p className="blink-feature-note">Spotlight is browser-local in BLINK. Posts, likes and media stay on this device and are not written to the database.</p>
          <div className="blink-spotlight-feed">{spotlight.map((p) => <article className="blink-spotlight-card" key={p.id}>
            <div className="blink-spotlight-media">{p.media_path ? <button onClick={()=>{ if(p.media_path) window.open(p.media_path,"_blank","noopener,noreferrer") }}>▶ Open Snap</button> : null}</div>
            <div className="blink-spotlight-copy"><b>@{directory.find(x=>x.id===p.user_id)?.username || (p.user_id===me ? meUsername : "blink_user")}</b><span>{p.caption || "Spotlight post"}</span><button onClick={()=>toggleSpotlightLike(p.id)}>♡ Like</button></div>
          </article>)}</div>
          {!spotlight.length && <div className="blink-empty">No Spotlight posts yet. Create the first one from Camera.</div>}
        </div>
      )}

      {tab === "memories" && (
        <div className="blink-panel">
          <div className="blink-panel-head"><div><span className="blink-eyebrow">PRIVATE ARCHIVE</span><h1>Memories</h1></div><button className="blink-primary small" onClick={() => setMemoryUnlocked(v => !v)}>{memoryUnlocked ? "Lock" : "My Eyes Only"}</button></div>
          <div className="blink-memory-toolbar">
            <input className="blink-search" type="password" value={memoryPasscode} onChange={e=>setMemoryPasscode(e.target.value)} placeholder="Device-only passcode for My Eyes Only" />
            <button onClick={()=>{ if(memoryPasscode.length>=4){ setMemoryUnlocked(true); notify("Private Memories unlocked on this device."); } else notify("Use at least 4 characters."); }}>Unlock</button>
            <input ref={storyFileRef} hidden type="file" accept="image/*,video/*" onChange={async e=>{const f=e.target.files?.[0]; if(f && f.size<=4*1024*1024) saveMemoryLocal(await fileToDataUrl(f),f.type,false); else if(f) notify("Choose a file under 4 MB.");}} />
            <button onClick={()=>storyFileRef.current?.click()}>＋ Import</button>
          </div>
          <small className="blink-feature-note">Memories are stored only in this browser for this user. They are never written to the chat database. My Eyes Only is a local privacy feature; it is not a substitute for device encryption.</small>
          <div className="blink-memory-grid">{memoryItems.filter(m=>!m.privateOnly || memoryUnlocked).map(m=><article key={m.id} className="blink-memory-card">
            <img src={m.dataUrl} alt="Memory" /><div><small>{new Date(m.createdAt).toLocaleString()}</small><button onClick={()=>{const next=memoryItems.filter(x=>x.id!==m.id);setMemoryItems(next);window.localStorage.setItem("blink_memories_" + me,JSON.stringify(next));}}>Delete</button></div>
          </article>)}</div>
          {!memoryItems.length && <div className="blink-empty">Save a Snap to Memories to build your private archive.</div>}
        </div>
      )}
      {tab === "map" && <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">NO LOCATION HISTORY</span><h1>Map</h1></div>
          <button className="blink-primary small" onClick={() => setGhostMode(!ghostMode)}>{ghostMode ? "Ghost Mode ON" : "Share temporarily"}</button>
        </div>
        <div className="blink-map"><div className="blink-map-grid" /><div className="blink-map-label">{ghostMode ? "Ghost Mode — no location is stored" : "Location sharing is temporary and not stored as history"}</div></div>
        <div className="blink-map-controls"><button onClick={() => setGhostMode(true)}>👻 Ghost Mode</button><button onClick={() => notify("Temporary location expires automatically.")}>⌖ Expiry</button><button onClick={() => notify("No location history is stored.")}>✦ Privacy</button></div>
      </div>}

      {tab === "profile" && <div className="blink-profile-page">
        <div className="blink-profile-cover"><Avatar id={me} emoji={avatarEmoji} large /></div>
        <div className="blink-profile-body"><span className="blink-eyebrow">ACCOUNT</span><h1>{displayName || meUsername || "BLINK User"}</h1>
          <p>@{meUsername || "username"}</p>
          <div className="blink-id-box"><code>{me}</code><button onClick={() => navigator.clipboard.writeText(me).then(() => notify("User ID copied."))}>Copy</button></div>

          <div className="blink-profile-settings">
            <div className="blink-settings-section">
              <span className="blink-eyebrow">PROFILE</span>
              <label>Name
                <input className="blink-search" value={settingsName} maxLength={80} onChange={(e) => setSettingsName(e.target.value)} placeholder="Your name" />
              </label>
              <label>Username
                <input className="blink-search" value={settingsUsername} maxLength={24} onChange={(e) => setSettingsUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="username" />
              </label>
              <label>Avatar
                <select className="blink-search" value={avatarEmoji} onChange={(e) => saveAvatar(e.target.value)}>
                  <option value="3F">3F</option>
                  <option value="⚡">⚡</option>
                  <option value="★">★</option>
                  <option value="●">●</option>
                  <option value="◆">◆</option>
                  <option value="✦">✦</option>
                  <option value="👻">👻</option>
                  <option value="🙂">🙂</option>
                  <option value="😎">😎</option>
                </select>
              </label>
              <button className="blink-primary" disabled={settingsBusy} onClick={saveProfileSettings}>{settingsBusy ? "Saving…" : "Save profile"}</button>
            </div>

            <div className="blink-settings-section">
              <span className="blink-eyebrow">EMAIL</span>
              <label>Email address
                <input className="blink-search" type="email" value={settingsEmail} onChange={(e) => setSettingsEmail(e.target.value)} autoComplete="email" />
              </label>
              <button className="blink-primary" disabled={settingsBusy} onClick={changeEmail}>{settingsBusy ? "Updating…" : "Change email"}</button>
              <small>Supabase may send a confirmation link before the new email becomes active.</small>
            </div>

            <div className="blink-settings-section">
              <span className="blink-eyebrow">PASSWORD</span>
              <input className="blink-search" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" autoComplete="current-password" />
              <input className="blink-search" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" autoComplete="new-password" />
              <input className="blink-search" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" />
              <button className="blink-primary" disabled={settingsBusy} onClick={changePassword}>{settingsBusy ? "Updating…" : "Change password"}</button>
            </div>

            <div className="blink-settings-section">
              <span className="blink-eyebrow">PRIVACY</span>
              <label className="blink-setting-toggle">
                <span>Ghost Mode</span>
                <input type="checkbox" checked={ghostMode} onChange={(e) => saveGhostMode(e.target.checked)} />
              </label>
              <small>When ON, BLINK does not share your location.</small>
            </div>

            <div className="blink-settings-section">
              <span className="blink-eyebrow">APPEARANCE</span>
              <label>Theme
                <select className="blink-search" value={appearance} onChange={(e) => saveAppearance(e.target.value as "dark" | "light")}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </label>
            </div>

            <div className="blink-settings-section">
              <span className="blink-eyebrow">BLINK RULES</span>
              <div className="blink-setting-readonly"><span>Data retention</span><b>Browser-local</b></div>
              <div className="blink-setting-readonly"><span>Local content expiry</span><b>{chatRetention === "seen" ? "chat after seen" : chatRetention} / {snapRetention === "seen" ? "Snap after seen" : snapRetention}</b></div>
              <div className="blink-setting-readonly"><span>Computer bots</span><b>NO AI</b></div>
              <small>Chats, Snaps and Memories are browser-local only. BLINK does not write their contents to the database.</small>
            </div>
          </div>

          <div className="blink-settings-list">
            <button onClick={() => notify("Your username is used for finding and connecting with other BLINK users.")}>◆ <span>Username search</span><b>@{meUsername || "—"}</b></button>
            <button onClick={() => notify("Chats, Snaps and Memories stay in this browser only; opened or expired items are removed locally.")}>◌ <span>Disappearing content</span><b>{chatRetention === "seen" ? "after seen" : chatRetention}</b></button>
            <button onClick={() => saveGhostMode(!ghostMode)}>👻 <span>Ghost Mode</span><b>{ghostMode ? "ON" : "OFF"}</b></button>
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