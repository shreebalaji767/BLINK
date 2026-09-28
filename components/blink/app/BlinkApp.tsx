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
    const allIds = [...new Set([
      ...ids,
      ...(incoming ?? []).map((r: any) => r.requester_id),
      ...(sent ?? []).map((r: any) => r.addressee_id)
    ])];
    const names = new Map(directory.map((p) => [p.id, p.username]));
    setFriends(ids.map((id: string) => ({ id, username: names.get(id) ?? "" })));
    setRequests((incoming ?? []).map((r: any) => ({ id: r.requester_id, username: names.get(r.requester_id) ?? "" })));
    setOutgoing((sent ?? []).map((r: any) => ({ id: r.addressee_id, username: names.get(r.addressee_id) ?? "" })));
  }

  async function loadBlocked(userId: string) {
    const { data } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", userId);
    setBlocked((data ?? []).map((x: any) => ({ id: x.blocked_id, username: "" })));
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

  async function loadSpotlight() {
    const { data } = await supabase.from("spotlight_posts").select("*").order("created_at", { ascending: false }).limit(60);
    setSpotlight(data ?? []);
  }

  function loadMemories() {
    try {
      const raw = window.localStorage.getItem("blink_memories");
      setMemoryItems(raw ? JSON.parse(raw) : []);
    } catch { setMemoryItems([]); }
  }

  function saveMemoryLocal(dataUrl: string, type: string, privateOnly = false) {
    const item = { id: crypto.randomUUID(), dataUrl, type, createdAt: new Date().toISOString(), privateOnly };
    const next = [item, ...memoryItems].slice(0, 100);
    try {
      window.localStorage.setItem("blink_memories", JSON.stringify(next));
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
    setBusy(true);
    const id = crypto.randomUUID();
    const path = me + "/spotlight/" + id;
    const { error: uploadError } = await supabase.storage.from("blink-ephemeral").upload(path, file, { contentType: file.type });
    if (uploadError) { setBusy(false); return notify(uploadError.message); }
    const { error } = await supabase.from("spotlight_posts").insert({
      id, user_id: me, media_path: path, media_type: file.type.startsWith("video/") ? "video" : "image", caption: snapCaption
    });
    setBusy(false);
    if (error) notify(error.message);
    else { await loadSpotlight(); notify("Posted to Spotlight."); }
  }

  async function toggleSpotlightLike(postId: string) {
    const { data: existing } = await supabase.from("spotlight_likes").select("post_id").eq("post_id", postId).eq("user_id", me).maybeSingle();
    if (existing) await supabase.from("spotlight_likes").delete().eq("post_id", postId).eq("user_id", me);
    else await supabase.from("spotlight_likes").insert({ post_id: postId, user_id: me });
    await loadSpotlight();
  }

  async function createGroup() {
    const members = [...new Set([me, ...groupMembers])];
    if (members.length < 3) return notify("Select at least two friends for a group.");
    if (!groupTitle.trim()) return notify("Enter a group name.");
    const { data: group, error } = await supabase.from("conversations").insert({ kind: "group", created_by: me, title: groupTitle.trim() }).select("id").single();
    if (error || !group) return notify(error?.message ?? "Could not create group.");
    const { error: memberError } = await supabase.from("conversation_members").insert(members.map(user_id => ({ conversation_id: group.id, user_id })));
    if (memberError) return notify(memberError.message);
    setGroupTitle(""); setGroupMembers([]);
    setConversationId(group.id); setActivePerson(null); setActiveBot(null); setTab("chat");
    notify("Group chat created.");
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

  async function reactToMessage(messageId: string, emoji: string) {
    const { data: existing } = await supabase.from("message_reactions").select("emoji").eq("message_id", messageId).eq("user_id", me).maybeSingle();
    if (existing) await supabase.from("message_reactions").delete().eq("message_id", messageId).eq("user_id", me);
    else await supabase.from("message_reactions").insert({ message_id: messageId, user_id: me, emoji });
    notify(existing ? "Reaction removed." : emoji + " reaction added.");
  }

  async function toggleSavedMessage(messageId: string) {
    const { data: existing } = await supabase.from("saved_messages").select("message_id").eq("message_id", messageId).eq("user_id", me).maybeSingle();
    if (existing) await supabase.from("saved_messages").delete().eq("message_id", messageId).eq("user_id", me);
    else await supabase.from("saved_messages").insert({ message_id: messageId, user_id: me });
    notify(existing ? "Message unsaved." : "Message saved.");
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
      setSettingsEmail(data.user.email ?? email);
      if (typeof window !== "undefined") {
        const savedAvatar = window.localStorage.getItem("blink_avatar_emoji");
        const savedAppearance = window.localStorage.getItem("blink_appearance");
        const savedGhost = window.localStorage.getItem("blink_ghost_mode");
        if (savedAvatar) setAvatarEmoji(savedAvatar);
        if (savedAppearance === "light" || savedAppearance === "dark") setAppearance(savedAppearance);
        if (savedGhost !== null) setGhostMode(savedGhost !== "false");
      }
      const { data: myProfile } = await supabase.from("profiles").select("username").eq("id", data.user.id).single();
      setMeUsername(myProfile?.username ?? "");
      await Promise.all([loadFriends(data.user.id), loadBlocked(data.user.id), loadStories(data.user.id), loadSnaps(data.user.id), loadBots(), loadSpotlight()]);
      loadMemories();
      const { data: allProfiles, error: profileError } = await supabase.from("profiles").select("id,username").order("username").limit(5000);
      if (profileError) notify(profileError.message);
      const loadedDirectory = (allProfiles ?? []).map((x: any) => ({ id: x.id, username: x.username })).filter((x: Person) => x.id !== data.user!.id);
      setDirectory(loadedDirectory);
      const names = new Map(loadedDirectory.map((p) => [p.id, p.username]));
      setFriends((items) => items.map((p) => ({ ...p, username: names.get(p.id) ?? p.username })));
      setRequests((items) => items.map((p) => ({ ...p, username: names.get(p.id) ?? p.username })));
      setOutgoing((items) => items.map((p) => ({ ...p, username: names.get(p.id) ?? p.username })));
      setBlocked((items) => items.map((p) => ({ ...p, username: names.get(p.id) ?? p.username })));
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

  async function saveProfileSettings() {
    const username = settingsUsername.trim().toLowerCase();
    const name = settingsName.trim();

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      notify("Username must be 3–24 characters: a-z, 0-9, _");
      return;
    }
    if (name.length > 80) {
      notify("Name must be 80 characters or less.");
      return;
    }

    setSettingsBusy(true);
    const [{ error: usernameError }, { error: nameError }] = await Promise.all([
      supabase.from("profiles").update({ username }).eq("id", me),
      supabase.auth.updateUser({ data: { full_name: name, name } })
    ]);
    setSettingsBusy(false);

    if (usernameError) {
      notify(usernameError.code === "23505" ? "That username is already taken." : usernameError.message);
      return;
    }
    if (nameError) {
      notify(nameError.message);
      return;
    }

    setMeUsername(username);
    setDisplayName(name);
    setDirectory((items) => items);
    notify("Profile updated.");
  }

  async function changeEmail() {
    const nextEmail = settingsEmail.trim().toLowerCase();
    if (!nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      notify("Enter a valid email address.");
      return;
    }
    if (nextEmail === email.toLowerCase()) {
      notify("Email is already unchanged.");
      return;
    }
    setSettingsBusy(true);
    const { error } = await supabase.auth.updateUser({ email: nextEmail });
    setSettingsBusy(false);
    if (error) {
      notify(error.message);
      return;
    }
    notify("Email change requested. Check your email to confirm it.");
  }

  function saveAppearance(value: "dark" | "light") {
    setAppearance(value);
    window.localStorage.setItem("blink_appearance", value);
    document.documentElement.dataset.theme = value;
    notify(value === "light" ? "Light appearance enabled." : "Dark appearance enabled.");
  }

  function saveAvatar(value: string) {
    setAvatarEmoji(value);
    window.localStorage.setItem("blink_avatar_emoji", value);
    notify("Profile avatar updated.");
  }

  function saveGhostMode(value: boolean) {
    setGhostMode(value);
    window.localStorage.setItem("blink_ghost_mode", String(value));
    notify(value ? "Ghost Mode ON." : "Temporary location sharing enabled.");
  }

  async function changePassword() {
    if (newPassword.length < 8) {
      notify("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      notify("New passwords do not match.");
      return;
    }

    setSettingsBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSettingsBusy(false);

    if (error) {
      notify(error.message);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    notify("Password changed successfully.");
  }

  async function findUser(value: string) {
    setQuery(value);
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) { setPeople([]); return; }
    setPeople(directory.filter((p) => p.username.toLowerCase().includes(trimmed)).slice(0, 60));
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraFacing }, audio: false });
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
      privacy: ((window as any).__blinkStoryPrivacy || "friends"), expires_at: new Date(Date.now() + 86400000).toISOString()
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
            <video ref={videoRef} autoPlay playsInline muted className="blink-video" style={{ filter: cameraFilter === "mono" ? "grayscale(1)" : cameraFilter === "sepia" ? "sepia(1)" : cameraFilter === "vivid" ? "saturate(1.7) contrast(1.08)" : cameraFilter === "cool" ? "hue-rotate(25deg) saturate(1.2)" : "none", transform: `scale(${cameraZoom})` }} />
            <div className="blink-camera-gradient" />
            {cameraLens !== "none" && <div className="blink-camera-lens" aria-hidden="true">{cameraLens === "hearts" ? "💗  💗" : cameraLens === "dog" ? "🐶" : cameraLens === "crown" ? "👑" : "👽"}</div>}
            <div className="blink-camera-toolbar">
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
        <div className="blink-panel-head"><div><span className="blink-eyebrow">EPHEMERAL CHAT</span><h1>Chat</h1></div><button className="blink-primary small" onClick={() => setTab("friends")}>＋ New chat</button><button className="blink-button secondary small" onClick={() => notify("Select friends below to create a group.")}>👥 Group</button></div>
        <div className="blink-group-create">
          <input className="blink-search" value={groupTitle} onChange={e => setGroupTitle(e.target.value)} placeholder="Group name" />
          <div className="blink-group-members">{friends.map(f => <button key={f.id} className={groupMembers.includes(f.id) ? "selected" : ""} onClick={() => setGroupMembers(s => s.includes(f.id) ? s.filter(x => x !== f.id) : [...s, f.id])}>@{f.username}</button>)}</div>
          <button className="blink-primary small" onClick={createGroup}>Create group</button>
        </div>
        <div className="blink-chat-layout">
          <aside className="blink-chat-list">
            <div className="blink-bot-list"><b>COMPUTERS — NOT AI</b>{bots.map((b) =>
              <button key={b.id} className={activeBot?.id === b.id ? "blink-chat-row selected" : "blink-chat-row"} onClick={() => openBotChat(b)}>
                <Avatar emoji={b.avatar_emoji} /><span className="blink-chat-copy"><b>{b.display_name}</b><small>Computer rules · no AI</small></span>
              </button>
            )}</div>
            {friends.length ? friends.map((f) =>
              <button key={f.id} className={activePerson?.id === f.id ? "blink-chat-row selected" : "blink-chat-row"} onClick={() => openFriendChat(f)}>
                <Avatar id={f.id} /><span className="blink-chat-copy"><b>{f.username || shortId(f.id)}</b><small>Disappears after 24h</small></span>
              </button>
            ) : <div className="blink-empty">Add a friend to start messaging.</div>}
          </aside>
          <section className="blink-conversation">
            {(activePerson || activeBot) ? <>
              <div className="blink-conversation-head">
                <Avatar id={activePerson?.id} emoji={activeBot?.avatar_emoji} />
                <div><b>{activeBot?.display_name ?? activePerson?.username ?? shortId(activePerson?.id ?? "")}</b><small>Disappearing chat · 24 hours</small></div>
              </div>
              <div className="blink-messages">
                {messages.map((m) => {
                  const botProfile = Array.isArray(m.bot_profiles) ? m.bot_profiles[0] : m.bot_profiles;
                  const mine = m.sender_id === me;
                  return <div key={m.id} className={"blink-message-line " + (mine ? "mine" : "")}>
                    <div className={"blink-bubble " + (mine ? "mine" : "other")}>
                      {m.media_path ? "[" + m.message_type + " · disappearing]" : m.body}
                      {botProfile && <small className="blink-bot-tag">{botProfile.avatar_emoji} computer</small>}
                      {!botProfile && <div className="blink-message-tools"><button onClick={() => reactToMessage(m.id, "❤️")}>❤️</button><button onClick={() => reactToMessage(m.id, "😂")}>😂</button><button onClick={() => toggleSavedMessage(m.id)}>🔖</button></div>}
                    </div>
                  </div>;
                })}
              </div>
              <div className="blink-composer">
                <button onClick={() => chatFileRef.current?.click()}>＋</button>
                <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendText()} placeholder={activeBot ? "Talk to the computer…" : "Send a message…"} />
                <button onClick={recordingVoice ? stopVoiceRecording : startVoiceRecording}>{recordingVoice ? "■" : "🎙"}</button>
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
        <div className="blink-panel-head"><div><span className="blink-eyebrow">USERNAME DIRECTORY</span><h1>Friends</h1></div></div>
        <input className="blink-search" value={query} onChange={(e) => findUser(e.target.value)} placeholder="Search people by username…" />
        {requests.length > 0 && <div className="blink-request-box"><b>Friend requests</b>{requests.map((p) =>
          <div key={p.id}><Avatar id={p.id} /><span>{p.username || shortId(p.id)}</span><button className="blink-primary small" onClick={() => respondToRequest(p, "accepted")}>Accept</button><button className="blink-button secondary small" onClick={() => declineRequest(p)}>Decline</button></div>
        )}</div>}
        <div className="blink-friend-grid">
          {(query ? people : directory).map((p) => <article className="blink-friend-card" key={p.id}>
            <Avatar id={p.id} large /><h3>{shortId(p.id)}</h3><p>{p.username || shortId(p.id)}</p>
            <div className="blink-card-actions">
              {friendIds.has(p.id) ? <button onClick={() => openFriendChat(p)}>Chat</button> : outgoing.some((x) => x.id === p.id) ? <button onClick={() => cancelRequest(p)}>Requested · Cancel</button> : requests.some((x) => x.id === p.id) ? <button onClick={() => respondToRequest(p, "accepted")}>Accept request</button> : <button onClick={() => sendFriendRequest(p)}>＋ Add friend</button>}
              <button onClick={() => blocked.some((b) => b.id === p.id) ? unblockUser(p) : blockUser(p)}>{blocked.some((b) => b.id === p.id) ? "Unblock" : "Block"}</button>
            </div>
          </article>)}
        </div>
        {outgoing.length > 0 && <div className="blink-request-box"><b>Sent requests</b>{outgoing.map((p) => <div key={p.id}><Avatar id={p.id} /><span>{p.username || shortId(p.id)}</span><button onClick={() => cancelRequest(p)}>Cancel request</button></div>)}</div>}
        {blocked.length > 0 && <div className="blink-request-box"><b>Blocked by you</b>{blocked.map((p) =>
          <div key={p.id}><Avatar id={p.id} /><span>{p.username || shortId(p.id)}</span><button onClick={() => unblockUser(p)}>Unblock</button></div>
        )}</div>}
      </div>}

      {tab === "stories" && <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">24 HOURS THEN DELETED</span><h1>Stories</h1></div><button className="blink-primary small" onClick={() => storyFileRef.current?.click()}>＋ Story</button></div>
        <input ref={storyFileRef} hidden type="file" accept="image/*,video/*" capture="environment" onChange={(e) => {
          const f = e.target.files?.[0]; if (f) { setStoryFile(f); notify("Story ready."); }
        }} />
        {storyFile && <div className="blink-story-compose"><b>{storyFile.name}</b><select className="blink-search" defaultValue="friends" onChange={(e) => (window as any).__blinkStoryPrivacy = e.target.value}><option value="friends">My Story · Friends</option><option value="public">My Story · Public</option><option value="private">Private Story</option></select><button className="blink-primary" onClick={publishStory} disabled={busy}>Post Story</button></div>}
        <div className="blink-story-grid">{stories.map((s) =>
          <button key={s.id} className="blink-story-card" onClick={async () => { const u = await mediaUrl(s.media_path); if (u) window.open(u, "_blank", "noopener,noreferrer"); }}>
            <div className="blink-story-ring"><span>{shortId(s.user_id)}</span></div><b>{s.user_id === me ? "Your Story" : shortId(s.user_id)}</b><small>expires in 24h</small>
          </button>
        )}</div>
      </div>}


      {tab === "spotlight" && (\n        <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">PUBLIC DISCOVERY</span><h1>Spotlight</h1></div><button className="blink-primary small" onClick={() => setTab("camera")}>＋ Create</button></div>
        <p className="blink-feature-note">A public short-video/photo feed for discovery. Posts can be liked and remain separate from private chats.</p>
        <div className="blink-spotlight-feed">{spotlight.map((p) => <article className="blink-spotlight-card" key={p.id}>
          <div className="blink-spotlight-media">{p.media_path ? <button onClick={async()=>{const u=await mediaUrl(p.media_path); if(u) window.open(u,"_blank","noopener,noreferrer")}}>▶ Open Snap</button> : null}</div>
          <div className="blink-spotlight-copy"><b>@{directory.find(x=>x.id===p.user_id)?.username || (p.user_id===me ? meUsername : "blink_user")}</b><span>{p.caption || "Spotlight post"}</span><button onClick={()=>toggleSpotlightLike(p.id)}>♡ Like</button></div>
        </article>)}</div>
        {!spotlight.length && <div className="blink-empty">No Spotlight posts yet. Create the first one from Camera.</div>}
      </div>
      {tab === "memories" && (\n        <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">PRIVATE ARCHIVE</span><h1>Memories</h1></div><button className="blink-primary small" onClick={() => (memoryPrivate ? setMemoryUnlocked(false) : setMemoryPrivate(false))}>{memoryUnlocked ? "Lock" : "My Eyes Only"}</button></div>
        <div className="blink-memory-toolbar">
          <input className="blink-search" type="password" value={memoryPasscode} onChange={e=>setMemoryPasscode(e.target.value)} placeholder="Device-only passcode for My Eyes Only" />
          <button onClick={()=>{ if(memoryPasscode.length>=4){ setMemoryUnlocked(true); notify("Private Memories unlocked on this device."); } else notify("Use at least 4 characters."); }}>Unlock</button>
          <input ref={storyFileRef} hidden type="file" accept="image/*,video/*" onChange={async e=>{const f=e.target.files?.[0]; if(f && f.size<=4*1024*1024) saveMemoryLocal(await fileToDataUrl(f),f.type,false); else if(f) notify("Choose a file under 4 MB.");}} />
          <button onClick={()=>storyFileRef.current?.click()}>＋ Import</button>
        </div>
        <small className="blink-feature-note">Memories are stored locally in this browser in this version. My Eyes Only is a local privacy feature; it is not a substitute for device encryption.</small>
        <div className="blink-memory-grid">{memoryItems.filter(m=>!m.privateOnly || memoryUnlocked).map(m=><article key={m.id} className="blink-memory-card">
          <img src={m.dataUrl} alt="Memory" /><div><small>{new Date(m.createdAt).toLocaleString()}</small><button onClick={()=>{const next=memoryItems.filter(x=>x.id!==m.id);setMemoryItems(next);window.localStorage.setItem("blink_memories",JSON.stringify(next));}}>Delete</button></div>
        </article>)}</div>
        {!memoryItems.length && <div className="blink-empty">Save a Snap to Memories to build your private archive.</div>}
      </div>
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
              <div className="blink-setting-readonly"><span>Data retention</span><b>Ephemeral</b></div>
              <div className="blink-setting-readonly"><span>Disappearing content</span><b>24h / Snap expiry</b></div>
              <div className="blink-setting-readonly"><span>Computer bots</span><b>NO AI</b></div>
              <small>These are app-wide BLINK rules, so they are shown here but cannot be changed per account.</small>
            </div>
          </div>

          <div className="blink-settings-list">
            <button onClick={() => notify("Your username is used for finding and connecting with other BLINK users.")}>◆ <span>Username search</span><b>@{meUsername || "—"}</b></button>
            <button onClick={() => notify("Messages, Snaps and Stories are deleted after expiry.")}>◌ <span>Disappearing content</span><b>24h / Snap expiry</b></button>
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
