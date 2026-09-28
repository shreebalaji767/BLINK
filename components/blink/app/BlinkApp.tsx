"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SignOutButton from "@/components/blink/auth/SignOutButton";

type Tab = "camera" | "chat" | "friends" | "stories" | "spotlight" | "map" | "memories" | "profile" | "admin";
type Person = { id: string; username: string; avatar_emoji?: string | null; online?: boolean; role?: "owner" | "admin" | null };
type AdminUser = { id: string; email: string; username: string; avatar_emoji?: string | null; created_at: string; last_sign_in_at?: string | null; banned_until?: string | null; role?: "owner" | "admin" | null; admin_enabled: boolean; permissions: Record<string, boolean> };
type Message = {
  id: string; conversation_id: string; sender_id: string | null;
  body: string | null; media_path: string | null; message_type: string; created_at: string; expires_at: string;
};
type Story = { id: string; user_id: string; media_path: string; media_type: string; caption: string | null; created_at: string; expires_at: string; visibility: "private" | "friends" | "public" };
type Snap = { id: string; sender_id: string; media_path: string; media_type: string; caption: string | null; duration_seconds: number; created_at: string; expires_at: string };

const supabase = createClient();

function shortId(id: string) {
  return id.slice(0, 8);
}

function Avatar({ id, emoji, large = false }: { id?: string; emoji?: string | null; large?: boolean }) {
  return <span className={"blink-avatar " + (large ? "large" : "")}>{emoji ?? shortId(id ?? "?").slice(0, 2).toUpperCase()}</span>;
}

function RoleBadge({ role }: { role?: "owner" | "admin" | null }) {
  if (!role) return null;
  return (
    <span className={"blink-role-badge blink-role-" + role} title={role === "owner" ? "BLINK Owner" : "BLINK Admin"}>
      {role === "owner" ? "👑 OWNER" : "🛡️ ADMIN"}
    </span>
  );
}

const AVATAR_OPTIONS = [
  { id: "m01", gender: "Male", emoji: "👨🏻" }, { id: "m02", gender: "Male", emoji: "👨🏼" },
  { id: "m03", gender: "Male", emoji: "👨🏽" }, { id: "m04", gender: "Male", emoji: "👨🏾" },
  { id: "m05", gender: "Male", emoji: "👨🏿" }, { id: "m06", gender: "Male", emoji: "🧔🏻" },
  { id: "m07", gender: "Male", emoji: "👨‍🦱" }, { id: "m08", gender: "Male", emoji: "👨‍🦰" },
  { id: "m09", gender: "Male", emoji: "👨‍🦳" }, { id: "m10", gender: "Male", emoji: "👨‍🎓" },
  { id: "f01", gender: "Female", emoji: "👩🏻" }, { id: "f02", gender: "Female", emoji: "👩🏼" },
  { id: "f03", gender: "Female", emoji: "👩🏽" }, { id: "f04", gender: "Female", emoji: "👩🏾" },
  { id: "f05", gender: "Female", emoji: "👩🏿" }, { id: "f06", gender: "Female", emoji: "👩‍🦱" },
  { id: "f07", gender: "Female", emoji: "👩‍🦰" }, { id: "f08", gender: "Female", emoji: "👩‍🦳" },
  { id: "f09", gender: "Female", emoji: "👩‍🎓" }, { id: "f10", gender: "Female", emoji: "👩‍💻" }
];

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
  const [adminRole, setAdminRole] = useState<"owner" | "admin" | null>(null);
  const [adminAccessChecked, setAdminAccessChecked] = useState(false);
  const [adminPermissions, setAdminPermissions] = useState<Record<string, boolean>>({});
  const [ownerMetrics, setOwnerMetrics] = useState({
    totalUsers: 0,
    activeAdmins: 0,
    owners: 0,
    admins: 0,
    acceptedFriendships: 0,
    pendingFriendships: 0,
    blocks: 0,
    enabledAdmins: 0
  });
  const [ownerDashboardBusy, setOwnerDashboardBusy] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminUsersBusy, setAdminUsersBusy] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [adminUserSearch, setAdminUserSearch] = useState("");
  const [adminUserMenu, setAdminUserMenu] = useState<string | null>(null);
  const [platformSettings, setPlatformSettings] = useState<Record<string, boolean>>({
    camera: true, chat: true, friends: true, stories: true, spotlight: true, map: true, memories: true, profile: true, admin: true
  });
  const [platformSettingsBusy, setPlatformSettingsBusy] = useState(false);
  const [settingsEmail, setSettingsEmail] = useState(email);
  const [avatarEmoji, setAvatarEmoji] = useState("3F");
  const [appearance, setAppearance] = useState<"dark" | "light">("dark");
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lon: 78.9629 });
  const [ghostMode, setGhostMode] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [cameraFilter, setCameraFilter] = useState<"normal" | "mono" | "sepia" | "vivid" | "cool">("normal");
  const [cameraLens, setCameraLens] = useState<"none" | "hearts" | "dog" | "crown" | "alien">("none");
  const [cameraZoom, setCameraZoom] = useState(1);
  const [snapTimer, setSnapTimer] = useState(0);
  const [flashOn, setFlashOn] = useState(false);
  const [chatRetention, setChatRetention] = useState("24h");
  const [snapRetention, setSnapRetention] = useState("24h");
  const [storyRetention, setStoryRetention] = useState("24h");
  const [storyPrivacy, setStoryPrivacy] = useState<"private" | "friends" | "public">("friends");
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
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [activePerson, setActivePerson] = useState<Person | null>(null);
  const [message, setMessage] = useState("");
  const [stories, setStories] = useState<Story[]>([]);
  const [receivedStories, setReceivedStories] = useState<Story[]>([]);
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
  const publicStoryChannelRef = useRef<any>(null);
  const conversationIdRef = useRef("");
  conversationIdRef.current = conversationId;

  const validTabs: Tab[] = ["camera", "chat", "friends", "stories", "spotlight", "map", "memories", "profile", "admin"];

  function navigateTab(next: Tab) {
    const fallback: Tab[] = ["camera", "chat", "friends", "stories", "spotlight", "map", "memories", "profile", "admin"];
    const target = platformSettings[next] === false
      ? (fallback.find((id) => platformSettings[id] !== false && (id !== "admin" || Boolean(adminRole))) ?? "profile")
      : next;
    setTab(target);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", target);
      window.history.pushState({ blinkTab: target }, "", url.toString());
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const readTabFromUrl = () => {
      const requested = new URLSearchParams(window.location.search).get("tab") as Tab | null;
      navigateTab(requested && validTabs.includes(requested) ? requested : "camera");
    };
    readTabFromUrl();
    window.addEventListener("popstate", readTabFromUrl);
    return () => window.removeEventListener("popstate", readTabFromUrl);
  }, []);

  useEffect(() => {
    if (adminAccessChecked && tab === "admin" && !adminRole) navigateTab("camera");
  }, [adminAccessChecked, adminRole, tab]);

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function loadPlatformSettings() {
    const { data, error } = await supabase.from("blink_platform_settings").select("setting_key, enabled");
    if (error) return;
    const next = { ...platformSettings };
    (data ?? []).forEach((row: { setting_key: string; enabled: boolean }) => { next[row.setting_key] = row.enabled; });
    setPlatformSettings(next);
  }

  async function updatePlatformSetting(key: string, enabled: boolean) {
    if (adminRole !== "owner") return notify("Owner access required.");
    setPlatformSettingsBusy(true);
    const previous = platformSettings[key];
    setPlatformSettings((current) => ({ ...current, [key]: enabled }));
    const { error } = await supabase.from("blink_platform_settings").upsert(
      { setting_key: key, enabled, updated_by: me, updated_at: new Date().toISOString() },
      { onConflict: "setting_key" }
    );
    setPlatformSettingsBusy(false);
    if (error) {
      setPlatformSettings((current) => ({ ...current, [key]: previous }));
      notify("Could not update platform setting.");
      return;
    }
    if (!enabled && tab === key) navigateTab("camera");
    notify(key.charAt(0).toUpperCase() + key.slice(1) + (enabled ? " enabled." : " disabled."));
  }

  async function loadMyProfile(userId: string) {
    const { data } = await supabase.from("profiles").select("id, username, avatar_emoji").eq("id", userId).maybeSingle();
    if (!data) return;
    if (data.avatar_emoji) {
      setAvatarEmoji(data.avatar_emoji);
      window.localStorage.setItem("blink_avatar_" + userId, data.avatar_emoji);
    }
    setMeUsername(data.username ?? "");
    setSettingsUsername(data.username ?? "");
    setDirectory((current) => {
      const merged = new Map(current.map((p) => [p.id, p]));
      merged.set(userId, { id: userId, username: data.username ?? "", avatar_emoji: data.avatar_emoji ?? null });
      return Array.from(merged.values());
    });
  }

  async function loadMyAdminRole(userId: string) {
    const { data } = await supabase.from("blink_admins").select("role, permissions, enabled").eq("user_id", userId).maybeSingle();
    if (!data?.enabled) {
      setAdminRole(null);
      setAdminAccessChecked(true);
      setAdminPermissions({});
      return;
    }
    setAdminRole(data.role === "owner" || data.role === "admin" ? data.role : null);
    setAdminPermissions((data.permissions ?? {}) as Record<string, boolean>);
    setAdminAccessChecked(true);
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
    const avatars = new Map(directory.map((p) => [p.id, p.avatar_emoji]));
    const roleMap = await loadUserRoles(allIds);
    const roleFor = (id: string) => roleMap.get(id) ?? null;
    if (allIds.length) {
      const { data: profiles } = await supabase.from("profiles").select("id, username, avatar_emoji").in("id", allIds);
      (profiles ?? []).forEach((p: { id: string; username: string; avatar_emoji?: string | null }) => { names.set(p.id, p.username); avatars.set(p.id, p.avatar_emoji ?? null); });
      if (profiles?.length) {
        setDirectory((current) => {
          const merged = new Map(current.map((p) => [p.id, p]));
          profiles.forEach((p: { id: string; username: string; avatar_emoji?: string | null }) => merged.set(p.id, p));
          return Array.from(merged.values());
        });
      }
    }
    setFriends(ids.map((id: string) => ({ id, username: names.get(id) ?? "", avatar_emoji: avatars.get(id) ?? null, role: roleFor(id) })));
    setRequests((incoming ?? []).map((r: { requester_id: string }) => ({ id: r.requester_id, username: names.get(r.requester_id) ?? "", avatar_emoji: avatars.get(r.requester_id) ?? null, role: roleFor(r.requester_id) })));
    setOutgoing((sent ?? []).map((r: { addressee_id: string }) => ({ id: r.addressee_id, username: names.get(r.addressee_id) ?? "", avatar_emoji: avatars.get(r.addressee_id) ?? null, role: roleFor(r.addressee_id) })));
  }

  async function loadUserRoles(ids: string[]) {
    if (!ids.length) return new Map<string, "owner" | "admin">();
    const { data } = await supabase.from("blink_admins").select("user_id, role").in("user_id", ids).eq("enabled", true);
    return new Map((data ?? []).map((row: { user_id: string; role: "owner" | "admin" }) => [row.user_id, row.role]));
  }

  async function loadBlocked(userId: string) {
    const { data, error } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", userId);
    if (error) {
      notify("Could not load your blocked list.");
      return;
    }
    const ids = (data ?? []).map((x: { blocked_id: string }) => x.blocked_id);
    if (!ids.length) return setBlocked([]);
    const { data: profiles } = await supabase.from("profiles").select("id, username, avatar_emoji").in("id", ids);
    setBlocked(ids.map((id: string) => ({
      id,
      username: (profiles ?? []).find((p: { id: string }) => p.id === id)?.username ?? "",
      avatar_emoji: (profiles ?? []).find((p: { id: string; avatar_emoji?: string | null }) => p.id === id)?.avatar_emoji ?? null,
      role: null
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

  async function saveAvatar(value: string) {
    if (!me) return;
    setAvatarEmoji(value);
    window.localStorage.setItem("blink_avatar_" + me, value);
    const { error } = await supabase.from("profiles").update({ avatar_emoji: value }).eq("id", me);
    if (error) {
      notify("Could not save avatar to your profile.");
      return;
    }
    setDirectory((current) => current.map((p) => p.id === me ? { ...p, avatar_emoji: value } : p));
    setFriends((current) => current.map((p) => p.id === me ? { ...p, avatar_emoji: value } : p));
    notify("Avatar updated. Other users will now see it on your profile.");
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
      const { data: profile } = await supabase.from("profiles").select("id, username, avatar_emoji").eq("id", user.id).maybeSingle();
      if (cancelled) return;
      const username = profile?.username ?? "";
      const metadata = user.user_metadata ?? {};
      const name = String(metadata.full_name ?? metadata.name ?? "");
      setMeUsername(username);
      setSettingsUsername(username);
      setDisplayName(name);
      setSettingsName(name);

      const { data: adminRpc, error: adminRpcError } = await supabase
        .rpc("blink_get_my_admin");

      const adminRecord = Array.isArray(adminRpc) ? adminRpc[0] : adminRpc;
      if (adminRpcError) {
        console.error("BLINK admin role RPC failed:", adminRpcError);
        setAdminRole(null);
        setAdminPermissions({});
      } else if (adminRecord?.enabled && (adminRecord.role === "owner" || adminRecord.role === "admin")) {
        setAdminRole(adminRecord.role);
        setAdminPermissions((adminRecord.permissions ?? {}) as Record<string, boolean>);
      } else {
        setAdminRole(null);
        setAdminPermissions({});
      }
      setAdminAccessChecked(true);

      const storedAppearance = window.localStorage.getItem("blink_appearance_" + user.id);
      const storedGhost = window.localStorage.getItem("blink_ghost_mode_" + user.id);
      setAvatarEmoji(profile?.avatar_emoji || window.localStorage.getItem("blink_avatar_" + user.id) || "3F");
      setGhostMode(storedGhost === null ? true : storedGhost === "true");
      setAppearance(storedAppearance === "light" ? "light" : "dark");
      setChatRetention(window.localStorage.getItem("blink_chat_retention_" + user.id) || "24h");
      setSnapRetention(window.localStorage.getItem("blink_snap_retention_" + user.id) || "24h");
      setStoryRetention(window.localStorage.getItem("blink_story_retention_" + user.id) || "24h");
      const storedStoryPrivacy = window.localStorage.getItem("blink_story_privacy_" + user.id);
      setStoryPrivacy(storedStoryPrivacy === "private" || storedStoryPrivacy === "public" ? storedStoryPrivacy : "friends");
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.access_token) {
        await supabase.realtime.setAuth(sessionData.session.access_token);
      }
      const channel = supabase
        .channel("blink-user:" + user.id, { config: { private: true } })
        .on("broadcast", { event: "blink" }, (event: any) => {
          const payload = event?.payload;
          if (!payload || payload.recipient_id !== user.id || payload.sender_id === user.id) return;
          if (payload.kind === "story") {
            const incomingStory: Story = {
              id: String(payload.id || crypto.randomUUID()),
              user_id: String(payload.sender_id),
              media_path: String(payload.media_path || ""),
              media_type: payload.media_type === "video" ? "video" : "image",
              caption: payload.caption ?? null,
              created_at: payload.created_at || new Date().toISOString(),
              expires_at: payload.expires_at || new Date(Date.now() + 24 * 3600000).toISOString(),
              visibility: payload.visibility === "public" ? "public" : "friends"
            };
            const key = "blink_received_stories_" + user.id;
            const current: Story[] = JSON.parse(window.localStorage.getItem(key) || "[]");
            const active = [...current.filter((s) => s.id !== incomingStory.id), incomingStory]
              .filter((s) => new Date(s.expires_at).getTime() > Date.now());
            window.localStorage.setItem(key, JSON.stringify(active));
            setReceivedStories(active);
            notify("New Story received.");
            return;
          }
          const senderId = String(payload.sender_id);
          const cid = "friend:" + senderId;
          if (payload.kind === "chat" || payload.kind === "media") {
            const incoming: Message = {
              id: String(payload.id || crypto.randomUUID()),
              conversation_id: cid,
              sender_id: senderId,
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
      const publicStoryChannel = supabase
        .channel("blink-public-stories", { config: { private: true } })
        .on("broadcast", { event: "story" }, (event: any) => {
          const payload = event?.payload;
          if (!payload || payload.sender_id === user.id || payload.visibility !== "public") return;
          const incomingStory: Story = {
            id: String(payload.id || crypto.randomUUID()),
            user_id: String(payload.sender_id),
            media_path: String(payload.media_path || ""),
            media_type: payload.media_type === "video" ? "video" : "image",
            caption: payload.caption ?? null,
            created_at: payload.created_at || new Date().toISOString(),
            expires_at: payload.expires_at || new Date(Date.now() + 24 * 3600000).toISOString(),
            visibility: "public"
          };
          const key = "blink_received_stories_" + user.id;
          const current: Story[] = JSON.parse(window.localStorage.getItem(key) || "[]");
          const active = [...current.filter((s) => s.id !== incomingStory.id), incomingStory]
            .filter((s) => new Date(s.expires_at).getTime() > Date.now());
          window.localStorage.setItem(key, JSON.stringify(active));
          setReceivedStories(active);
          notify("New public Story received.");
        })
        .subscribe();
      publicStoryChannelRef.current = publicStoryChannel;
      await Promise.all([loadDirectory(), loadFriends(user.id), loadBlocked(user.id), loadStories(user.id), loadReceivedStories(user.id), loadSnaps(user.id), loadMyProfile(user.id)]);
      await loadPlatformSettings();
      if (!cancelled) {
        loadSpotlight(user.id);
        loadMemories(user.id);
        if (adminRecord?.enabled && (adminRecord.role === "owner" || adminRecord.role === "admin")) {
          if (adminRecord.role === "owner" || (adminRecord.permissions ?? {}).manage_users === true) {
            await loadAdminUsers();
          }
          if (adminRecord.role === "owner") await loadOwnerMetrics(user.id, "owner");
        }
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
      if (publicStoryChannelRef.current) {
        supabase.removeChannel(publicStoryChannelRef.current);
        publicStoryChannelRef.current = null;
      }
    };
  }, []);

  async function loadAdminUsers() {
    if (!me || !adminRole) return;
    const canManage = adminRole === "owner" || adminPermissions.manage_users === true;
    if (!canManage) return;
    setAdminUsersBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("blink-admin-users", { body: { action: "list" } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAdminUsers((data?.users ?? []) as AdminUser[]);
    } catch (error) {
      console.error("BLINK admin user list failed:", error);
      notify(error instanceof Error ? error.message : "Could not load users.");
    } finally {
      setAdminUsersBusy(false);
    }
  }

  async function adminUserAction(action: "ban" | "unban" | "delete" | "promote" | "demote", user: AdminUser) {
    if (user.id === me && ["ban", "delete", "demote"].includes(action)) {
      notify("You cannot perform this action on your own owner account.");
      return;
    }
    const labels: Record<string, string> = {
      ban: "ban", unban: "unban", delete: "permanently remove", promote: "promote to Admin", demote: "demote from Admin"
    };
    if (!window.confirm("Are you sure you want to " + labels[action] + " @" + (user.username || user.email) + "?")) return;
    setAdminUsersBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("blink-admin-users", {
        body: { action, user_id: user.id }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      notify("User " + labels[action] + "d successfully.");
      await Promise.all([loadAdminUsers(), adminRole === "owner" ? loadOwnerMetrics() : Promise.resolve()]);
    } catch (error) {
      console.error("BLINK admin user action failed:", error);
      notify(error instanceof Error ? error.message : "Admin action failed.");
    } finally {
      setAdminUsersBusy(false);
    }
  }

  async function createAdminUser() {
    if (adminRole !== "owner") return notify("Only an Owner can add users.");
    setAdminUsersBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("blink-admin-users", {
        body: {
          action: "create",
          email: newUserEmail.trim().toLowerCase(),
          username: newUserUsername.trim().toLowerCase(),
          password: newUserPassword,
          name: newUserName.trim()
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setNewUserEmail("");
      setNewUserUsername("");
      setNewUserPassword("");
      setNewUserName("");
      notify("BLINK user created.");
      await Promise.all([loadAdminUsers(), loadOwnerMetrics()]);
    } catch (error) {
      console.error("BLINK admin user creation failed:", error);
      notify(error instanceof Error ? error.message : "Could not create user.");
    } finally {
      setAdminUsersBusy(false);
    }
  }

  function adminUserIsBanned(user: AdminUser) {
    return !!user.banned_until && new Date(user.banned_until).getTime() > Date.now();
  }

  async function loadOwnerMetrics(userId = me, role = adminRole) {
    if (!userId || role !== "owner") return;
    setOwnerDashboardBusy(true);
    try {
      const [{ count: totalUsers }, { count: activeAdmins }, { count: owners }, { count: admins }, { count: acceptedFriendships }, { count: pendingFriendships }, { count: blocks }, { count: enabledAdmins }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("blink_admins").select("user_id", { count: "exact", head: true }).eq("enabled", true),
        supabase.from("blink_admins").select("user_id", { count: "exact", head: true }).eq("role", "owner").eq("enabled", true),
        supabase.from("blink_admins").select("user_id", { count: "exact", head: true }).eq("role", "admin").eq("enabled", true),
        supabase.from("friendships").select("id", { count: "exact", head: true }).eq("status", "accepted"),
        supabase.from("friendships").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("blocks").select("blocker_id", { count: "exact", head: true }),
        supabase.from("blink_admins").select("user_id", { count: "exact", head: true }).eq("enabled", true)
      ]);
      setOwnerMetrics({
        totalUsers: totalUsers ?? 0,
        activeAdmins: activeAdmins ?? 0,
        owners: owners ?? 0,
        admins: admins ?? 0,
        acceptedFriendships: acceptedFriendships ?? 0,
        pendingFriendships: pendingFriendships ?? 0,
        blocks: blocks ?? 0,
        enabledAdmins: enabledAdmins ?? 0
      });
    } finally {
      setOwnerDashboardBusy(false);
    }
  }

  async function loadDirectory() {
    const { data, error } = await supabase.from("profiles").select("id, username, avatar_emoji").order("username").limit(5000);
    if (error) {
      notify("Could not load the username directory.");
      return;
    }
    const rows = (data ?? []) as { id: string; username: string; avatar_emoji?: string | null }[];
    const roleMap = await loadUserRoles(rows.map((p) => p.id));
    setDirectory(rows.map((p) => ({ id: p.id, username: p.username, avatar_emoji: p.avatar_emoji ?? null, role: roleMap.get(p.id) ?? null })));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const purgeExpired = () => {
      const now = Date.now();
      const keys = Object.keys(window.localStorage);
      for (const key of keys) {
        if (!key.startsWith("blink_chat_") && !key.startsWith("blink_snaps_") && !key.startsWith("blink_stories_")) continue;
        try {
          const raw = window.localStorage.getItem(key);
          const items = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(items)) continue;
          const active = items.filter((item: any) => {
            if (item.expires_at === "after_seen") return true;
            const expiry = new Date(item.expires_at).getTime();
            return Number.isFinite(expiry) && expiry > now;
          });
          if (active.length !== items.length) window.localStorage.setItem(key, JSON.stringify(active));
          if (key === localChatKey(conversationIdRef.current)) setMessages(active);
          if (key === "blink_snaps_" + me) setSnaps(active);
          if (key === localStoriesKey(me)) setStories(active);
          if (key === "blink_received_stories_" + me) setReceivedStories(active.filter((item: Story) => item.visibility === "public" || item.visibility === "friends"));
        } catch {}
      }
    };
    purgeExpired();
    const timer = window.setInterval(purgeExpired, 1000);
    return () => window.clearInterval(timer);
  }, [me, conversationId]);
  
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

  async function loadReceivedStories(userId: string) {
    try {
      const key = "blink_received_stories_" + userId;
      const raw = window.localStorage.getItem(key);
      const now = Date.now();
      const items = raw ? JSON.parse(raw) : [];
      const active = Array.isArray(items)
        ? items.filter((s: Story) => (s.visibility === "public" || s.visibility === "friends") && new Date(s.expires_at).getTime() > now)
        : [];
      setReceivedStories(active);
      window.localStorage.setItem(key, JSON.stringify(active));
    } catch {
      setReceivedStories([]);
    }
  }

  function localChatKey(cid: string) {
    return "blink_chat_" + me + "_" + cid;
  }

  function localSnapKey() {
    return "blink_snaps_" + me;
  }

  function retentionMs(value: string) {
    const map: Record<string, number> = {
      "10s": 10 * 1000,
      "30s": 30 * 1000,
      "1m": 60 * 1000,
      "5m": 5 * 60 * 1000,
      "10m": 10 * 60 * 1000,
      "30m": 30 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "12h": 12 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "3d": 3 * 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000
    };
    return map[value] ?? 24 * 60 * 60 * 1000;
  }

  function retentionLabel(value: string) {
    const labels: Record<string, string> = {
      "10s": "10 seconds", "30s": "30 seconds", "1m": "1 minute", "5m": "5 minutes",
      "10m": "10 minutes", "30m": "30 minutes", "1h": "1 hour", "6h": "6 hours",
      "12h": "12 hours", "24h": "24 hours", "3d": "3 days", "7d": "7 days"
    };
    return labels[value] ?? value;
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
    setConversationId(localConversationId); setActivePerson(null); navigateTab("chat");
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

  function openFriendChat(friend: Person) {
    setActivePerson(friend);
    
    setConversationId("friend:" + friend.id);
    navigateTab("chat");
    loadLocalChat("friend:" + friend.id);
  }

  async function sendText() {
    if (!message.trim() || !conversationId || !me) return;
    const body = message.trim();
    setMessage("");
    const item: Message = {
      id: crypto.randomUUID(), conversation_id: conversationId, sender_id: me,
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
      }
    } catch {
      notify("Browser storage is full. Delete older local chats or media.");
    }
  }

  async function startCamera(requestedFacing: "user" | "environment" = cameraFacing) {
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
          video: { ...baseVideo, facingMode: { exact: requestedFacing } },
          audio: false
        });
      } catch (exactError) {
        // Some desktop browsers do not support an exact facingMode. Fall back to
        // enumerating physical cameras and selecting a rear/front device by label.
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const wanted = requestedFacing === "environment"
          ? /(back|rear|environment|world|main)/i
          : /(front|user|facetime|selfie)/i;
        const opposite = requestedFacing === "environment"
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
      if (requestedFacing === "environment" && settings?.facingMode === "user") {
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
        expires_at: new Date(Date.now() + retentionMs(snapRetention)).toISOString()
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
        expires_at: new Date(Date.now() + retentionMs(storyRetention)).toISOString(),
        visibility: storyPrivacy
      };
      const current = JSON.parse(window.localStorage.getItem(localStoriesKey(me)) || "[]");
      const next = [story, ...current].slice(0, 100);
      window.localStorage.setItem(localStoriesKey(me), JSON.stringify(next));
      setStories(next);

      const payload = {
        kind: "story",
        id: story.id,
        sender_id: me,
        media_path: story.media_path,
        media_type: story.media_type,
        caption: story.caption,
        created_at: story.created_at,
        expires_at: story.expires_at,
        visibility: story.visibility
      };

      if (storyPrivacy === "friends") {
        for (const friendId of friends.map((friend) => friend.id)) {
          const channel = supabase.channel("blink-user:" + friendId, { config: { private: true } });
          await channel.send({
            type: "broadcast",
            event: "blink",
            payload: { ...payload, recipient_id: friendId }
          });
          await supabase.removeChannel(channel);
        }
      } else if (storyPrivacy === "public") {
        const channel = supabase.channel("blink-public-stories", { config: { private: true } });
        const result = await channel.send({
          type: "broadcast",
          event: "story",
          payload
        });
        await supabase.removeChannel(channel);
        if (result === "error") notify("Public Story could not be delivered.");
      }

      setStoryFile(null);
      notify(storyPrivacy === "public"
        ? "Public Story posted. It is visible to authenticated BLINK users while it remains active."
        : storyPrivacy === "friends"
          ? "Friends-only Story posted to your friends while it remains active."
          : "Private Story saved only in this browser.");
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
      .select("id, username, avatar_emoji")
      .ilike("username", value + "%")
      .neq("id", me)
      .limit(30);
    if (error) {
      setPeople([]);
      notify("Could not search usernames right now.");
      return;
    }
    const results = (data ?? []).map((p: { id: string; username: string; avatar_emoji?: string | null }) => ({
      id: p.id,
      username: p.username,
      avatar_emoji: p.avatar_emoji ?? null,
    }));
    setPeople(results);
    setDirectory((current) => {
      const merged = new Map(current.map((p) => [p.id, p]));
      results.forEach((p) => merged.set(p.id, p));
      return Array.from(merged.values());
    });
  }

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const nav = ([
    ["camera", "◉", "Camera"], ["chat", "◌", "Chat"], ["friends", "♙", "Friends"],
    ["stories", "◫", "Stories"], ["spotlight", "▷", "Spotlight"], ["map", "⌖", "Map"], ["memories", "▣", "Memories"], ["profile", "●", "Account"],
    ...(adminAccessChecked && adminRole ? [["admin", "◆", "Admin"] as [Tab, string, string]] : [])
  ] as [Tab, string, string][]).filter(([id]) => platformSettings[id] !== false);

  return <main className="blink-app">
    <header className="blink-topbar">
      <button className="blink-brand" onClick={() => navigateTab("camera")}>BLINK</button>
      <div className="blink-top-actions">
        <button className="blink-round" onClick={() => navigateTab("friends")}>⌕</button><button className="blink-round" onClick={() => navigateTab("spotlight")}>▷</button><button className="blink-round" onClick={() => navigateTab("memories")}>▣</button>
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
              <button className={cameraFacing === "user" ? "active" : ""} onClick={() => { if (cameraFacing !== "user") { stopCamera(); setCameraFacing("user"); void startCamera("user"); } }} aria-label="Use front camera" title="Front camera">🤳 Front</button>
              <button className={cameraFacing === "environment" ? "active" : ""} onClick={() => { if (cameraFacing !== "environment") { stopCamera(); setCameraFacing("environment"); void startCamera("environment"); } }} aria-label="Use back camera" title="Back camera">📷 Back</button>
              <button className={flashOn ? "active" : ""} onClick={async () => {
                const track = streamRef.current?.getVideoTracks()[0];
                const capabilities = track?.getCapabilities?.() as any;
                if (capabilities?.torch) { await track?.applyConstraints({ advanced: [{ torch: !flashOn }] } as any); setFlashOn(!flashOn); }
                else notify("Flash/torch is not available on this device.");
              }}>⚡</button>
              <button onClick={() => { stopCamera(); setCameraFacing(cameraFacing === "user" ? "environment" : "user"); void startCamera(cameraFacing === "user" ? "environment" : "user"); }}>↔</button>
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
            <button className="blink-primary" onClick={() => { void startCamera(cameraFacing); }}>Enable camera</button>
            <button className="blink-button secondary" onClick={() => snapFileRef.current?.click()}>Choose from gallery</button>
          </div>}
          <input ref={snapFileRef} type="file" accept="image/*,video/*" capture="user" hidden onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const f = e.target.files?.[0]; if (f) prepareSnap(f);
          }} />
        </div>
        {friends.length > 0 && <div className="blink-recipient-strip"><b>Send to:</b>
          {friends.map((f) => <button key={f.id} className={selectedRecipients.includes(f.id) ? "selected" : ""} onClick={() => setSelectedRecipients((s) => s.includes(f.id) ? s.filter((x) => x !== f.id) : [...s, f.id])}>
            <Avatar id={f.id} emoji={f.avatar_emoji} /><span>{f.username || shortId(f.id)}</span>
          </button>)}
          <input value={snapCaption} onChange={(e) => setSnapCaption(e.target.value)} placeholder="Caption…" />
        </div>}
        {snaps.length > 0 && <div className="blink-inbox-snaps"><b>New Snaps</b>{snaps.map((s) =>
          <button key={s.id} onClick={() => openSnap(s)}>● {s.media_type} Snap</button>
        )}</div>}
      </div>}

      {tab === "chat" && <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">DEVICE-LOCAL EPHEMERAL CHAT</span><h1>Chat</h1></div><button className="blink-primary small" onClick={() => navigateTab("friends")}>＋ New chat</button><button className="blink-button secondary small" onClick={() => notify("Select friends below to create a group.")}>👥 Group</button></div>
        <div className="blink-ephemeral-settings">
          <label>Delete chat messages
            <select className="blink-search" value={chatRetention} onChange={(e) => { setChatRetention(e.target.value); window.localStorage.setItem("blink_chat_retention_" + me, e.target.value); }}>
              <option value="seen">After seen</option>
              <option value="10s">10 seconds</option>
              <option value="30s">30 seconds</option>
              <option value="1m">1 minute</option>
              <option value="5m">5 minutes</option>
              <option value="10m">10 minutes</option>
              <option value="30m">30 minutes</option>
              <option value="1h">1 hour</option>
              <option value="6h">6 hours</option>
              <option value="12h">12 hours</option>
              <option value="24h">24 hours</option>
              <option value="3d">3 days</option>
              <option value="7d">7 days</option>
            </select>
          </label>
          <label>Delete Snaps
            <select className="blink-search" value={snapRetention} onChange={(e) => { setSnapRetention(e.target.value); window.localStorage.setItem("blink_snap_retention_" + me, e.target.value); }}>
              <option value="10s">10 seconds</option>
              <option value="30s">30 seconds</option>
              <option value="1m">1 minute</option>
              <option value="5m">5 minutes</option>
              <option value="10m">10 minutes</option>
              <option value="30m">30 minutes</option>
              <option value="1h">1 hour</option>
              <option value="6h">6 hours</option>
              <option value="12h">12 hours</option>
              <option value="24h">24 hours</option>
              <option value="3d">3 days</option>
              <option value="7d">7 days</option>
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
            {friends.length ? friends.map((f) =>
              <button key={f.id} className={activePerson?.id === f.id ? "blink-chat-row selected" : "blink-chat-row"} onClick={() => openFriendChat(f)}>
                <Avatar id={f.id} emoji={f.avatar_emoji} /><span className="blink-chat-copy"><b>{f.username || shortId(f.id)}</b><small>Browser-only · {retentionLabel(chatRetention)}</small></span>
              </button>
            ) : <div className="blink-empty">Add a friend to start messaging.</div>}
          </aside>
          <section className="blink-conversation">
            {activePerson ? <>
              <div className="blink-conversation-head">
                <Avatar id={activePerson?.id} emoji={activePerson?.avatar_emoji} />
                <div><b>@{activePerson?.username ?? shortId(activePerson?.id ?? "")}</b><small>Friend · browser-only chat · {chatRetention === "seen" ? "disappears after seen" : "expires " + chatRetention}</small></div>
              </div>
              <div className="blink-messages">
                {messages.map((m) => {
                  const mine = m.sender_id === me;
                  return (
                    <div key={m.id} className={"blink-message-line " + (mine ? "mine" : "")}>
                      <div
                        className={"blink-bubble " + (mine ? "mine" : "other")}
                        onClick={() => {
                          if (!mine && m.expires_at === "after_seen") {
                            const raw = window.localStorage.getItem(localChatKey(conversationId));
                            const current: Message[] = raw ? JSON.parse(raw) : [];
                            saveLocalChat(conversationId, current.filter((x) => x.id !== m.id));
                          }
                        }}
                      >
                        {m.media_path ? "[" + m.message_type + " · disappearing]" : m.body}
                        <div className="blink-message-tools">
                          <button onClick={() => reactToMessage(m.id, "❤️")}>❤️</button>
                          <button onClick={() => reactToMessage(m.id, "😂")}>😂</button>
                          <button onClick={() => toggleSavedMessage(m.id)}>🔖</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="blink-composer">
                <button onClick={() => chatFileRef.current?.click()}>＋</button>
                <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendText()} placeholder="Send a message…" />
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
          <div key={p.id}><Avatar id={p.id} emoji={p.avatar_emoji} /><span>@{p.username || "blink_user"}</span><button className="blink-primary small" onClick={() => respondToRequest(p, "accepted")}>Accept</button><button className="blink-button secondary small" onClick={() => declineRequest(p)}>Decline</button></div>
        )}</div>}
        <div className="blink-friend-grid">
          {(query ? people : directory).map((p) => <article className="blink-friend-card" key={p.id}>
            <Avatar id={p.id} emoji={p.avatar_emoji} large /><h3>@{p.username || "blink_user"}</h3><p>BLINK member · username searchable</p>
            <div className="blink-card-actions">
              {friendIds.has(p.id) ? <button onClick={() => openFriendChat(p)}>Chat</button> : outgoing.some((x) => x.id === p.id) ? <button onClick={() => cancelRequest(p)}>Requested · Cancel</button> : requests.some((x) => x.id === p.id) ? <button onClick={() => respondToRequest(p, "accepted")}>Accept request</button> : <button onClick={() => sendFriendRequest(p)}>＋ Add friend</button>}
              <button onClick={() => blocked.some((b) => b.id === p.id) ? unblockUser(p) : blockUser(p)}>{blocked.some((b) => b.id === p.id) ? "Unblock" : "Block"}</button>
            </div>
          </article>)}
        </div>
        {outgoing.length > 0 && <div className="blink-request-box"><b>Sent requests</b>{outgoing.map((p) => <div key={p.id}><Avatar id={p.id} emoji={p.avatar_emoji} /><span>@{p.username || "blink_user"}</span><button onClick={() => cancelRequest(p)}>Cancel request</button></div>)}</div>}
        {blocked.length > 0 && <div className="blink-request-box"><b>Blocked by you</b>{blocked.map((p) =>
          <div key={p.id}><Avatar id={p.id} emoji={p.avatar_emoji} /><span>@{p.username || "blink_user"}</span><button onClick={() => unblockUser(p)}>Unblock</button></div>
        )}</div>}
      </div>}

      {tab === "stories" && <div className="blink-panel">
        <div className="blink-panel-head"><div><span className="blink-eyebrow">BROWSER ONLY · {storyRetention === "24h" ? "24 HOURS" : retentionLabel(storyRetention).toUpperCase()}</span><h1>Stories</h1></div><button className="blink-primary small" onClick={() => storyFileRef.current?.click()}>＋ Story</button></div>
        <div className="blink-ephemeral-settings">
          <label>Keep Story for
            <select className="blink-search" value={storyRetention} onChange={(e) => { setStoryRetention(e.target.value); window.localStorage.setItem("blink_story_retention_" + me, e.target.value); }}>
              <option value="10s">10 seconds</option>
              <option value="30s">30 seconds</option>
              <option value="1m">1 minute</option>
              <option value="5m">5 minutes</option>
              <option value="10m">10 minutes</option>
              <option value="30m">30 minutes</option>
              <option value="1h">1 hour</option>
              <option value="6h">6 hours</option>
              <option value="12h">12 hours</option>
              <option value="24h">24 hours</option>
              <option value="3d">3 days</option>
              <option value="7d">7 days</option>
            </select>
          </label>
          <small>New Stories automatically disappear when this period ends.</small>
        </div>
        <input ref={storyFileRef} hidden type="file" accept="image/*,video/*" capture="environment" onChange={(e) => {
          const f = e.target.files?.[0]; if (f) { setStoryFile(f); notify("Story ready."); }
        }} />
        {storyFile && <div className="blink-story-compose"><b>{storyFile.name}</b>
          <select className="blink-search" value={storyPrivacy} onChange={(e) => {
            const value = e.target.value as "private" | "friends" | "public";
            setStoryPrivacy(value);
            window.localStorage.setItem("blink_story_privacy_" + me, value);
          }}>
            <option value="friends">My Story · Friends</option>
            <option value="public">My Story · Public</option>
            <option value="private">Private Story</option>
          </select>
          <button className="blink-primary" onClick={publishStory} disabled={busy}>Post Story</button>
        </div>}
        <div className="blink-feature-note">Story privacy is enforced by delivery: <b>Private</b> stays on your device, <b>Friends</b> is delivered only to your accepted friends, and <b>Public</b> is delivered to authenticated BLINK users. Owners and Admins do not receive special access to private or friends-only Stories.</div>
        <div className="blink-story-grid">
          {stories.map((s) =>
            <button key={s.id} className="blink-story-card" onClick={() => { if (s.media_path) window.open(s.media_path, "_blank", "noopener,noreferrer"); }}>
              <div className="blink-story-ring"><span>{shortId(s.user_id)}</span></div>
              <b>Your Story</b>
              <small>{s.visibility === "public" ? "Public" : s.visibility === "friends" ? "Friends only" : "Private"} · expires {Math.max(0, Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 3600000))}h</small>
            </button>
          )}
          {receivedStories.map((s) =>
            <button key={"received-" + s.id} className="blink-story-card" onClick={() => { if (s.media_path) window.open(s.media_path, "_blank", "noopener,noreferrer"); }}>
              <div className="blink-story-ring"><span>{shortId(s.user_id)}</span></div>
              <b>@{directory.find((p) => p.id === s.user_id)?.username || shortId(s.user_id)}</b>
              <small>{s.visibility === "public" ? "Public" : "Friends only"} · expires {Math.max(0, Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 3600000))}h</small>
            </button>
          )}
        </div>
      </div>}


      {tab === "spotlight" && (
        <div className="blink-panel">
          <div className="blink-panel-head"><div><span className="blink-eyebrow">PUBLIC DISCOVERY</span><h1>Spotlight</h1></div><button className="blink-primary small" onClick={() => navigateTab("camera")}>＋ Create</button></div>
          <p className="blink-feature-note">Spotlight is browser-local in BLINK. Posts, likes and media stay on this device and are not written to the database.</p>
          <div className="blink-spotlight-feed">{spotlight.map((p) => <article className="blink-spotlight-card" key={p.id}>
            <div className="blink-spotlight-media">{p.media_path ? <button onClick={()=>{ if(p.media_path) window.open(p.media_path,"_blank","noopener,noreferrer") }}>▶ Open Snap</button> : null}</div>
            <div className="blink-spotlight-copy"><div className="blink-user-inline"><Avatar id={p.user_id} emoji={directory.find(x=>x.id===p.user_id)?.avatar_emoji} /><b>@{directory.find(x=>x.id===p.user_id)?.username || (p.user_id===me ? meUsername : "blink_user")} <RoleBadge role={directory.find(x=>x.id===p.user_id)?.role} /></b></div><span>{p.caption || "Spotlight post"}</span><button onClick={()=>toggleSpotlightLike(p.id)}>♡ Like</button></div>
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
      {tab === "map" && (() => {
        const lat = mapCenter.lat;
        const lon = mapCenter.lon;
        const bbox = [lon - 0.08, lat - 0.06, lon + 0.08, lat + 0.06].map((v) => v.toFixed(6)).join(",");
        const mapUrl = "https://www.openstreetmap.org/export/embed.html?bbox=" + encodeURIComponent(bbox) + "&layer=mapnik&marker=" + encodeURIComponent(lat.toFixed(6) + "," + lon.toFixed(6));
        return <div className="blink-panel">
          <div className="blink-panel-head"><div><span className="blink-eyebrow">LIVE MAP · NO LOCATION HISTORY</span><h1>Map</h1></div>
            <button className="blink-primary small" onClick={() => setGhostMode(!ghostMode)}>{ghostMode ? "Ghost Mode ON" : "Share temporarily"}</button>
          </div>
          <div className="blink-map blink-real-map">
            <iframe
              title="BLINK real map"
              src={mapUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="blink-map-iframe"
            />
            <div className="blink-map-label">{ghostMode ? "Ghost Mode — your location is not shared or stored" : "Location sharing is temporary and not stored as history"}</div>
          </div>
          <div className="blink-map-controls">
            <button onClick={() => {
              if (!navigator.geolocation) return notify("Location is not supported by this browser.");
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setMapCenter({ lat: position.coords.latitude, lon: position.coords.longitude });
                  notify("Map centered on your current location.");
                },
                () => notify("Location permission was not granted.")
              );
            }}>⌖ My location</button>
            <button onClick={() => setMapCenter({ lat: 20.5937, lon: 78.9629 })}>◎ Reset map</button>
            <button onClick={() => setGhostMode(true)}>👻 Ghost Mode</button>
            <button onClick={() => notify("No location history is stored.")}>✦ Privacy</button>
          </div>
          <small className="blink-feature-note">Real map data provided by OpenStreetMap. BLINK does not store your location. The map only requests the area currently being viewed.</small>
        </div>;
      })()}

      {tab === "admin" && adminAccessChecked && adminRole && <div className="blink-panel">
        <div className="blink-panel-head">
          <div><span className="blink-eyebrow">{adminRole === "owner" ? "OWNER CONTROL CENTER" : "ADMIN CONTROL CENTER"}</span><h1>{adminRole === "owner" ? "Owner Dashboard" : "Admin Center"}</h1></div>
          {adminRole === "owner" && <button className="blink-primary small" onClick={() => loadOwnerMetrics()} disabled={ownerDashboardBusy}>{ownerDashboardBusy ? "Refreshing…" : "Refresh"}</button>}
        </div>

        {adminRole === "owner" ? <>
          <p className="blink-feature-note">Owner access includes every Admin privilege plus owner-only visibility for platform totals, usage signals, misuse indicators, dashboards, performance checks and security status. Owner/Admin access never overrides user-content privacy: non-public chats, recipient-only Snaps and non-public Stories remain inaccessible unless the Owner/Admin is an authorized recipient.</p>

          <div className="blink-settings-section">
            <span className="blink-eyebrow">TOTAL USERS</span>
            <div className="blink-setting-readonly"><span>Registered BLINK users</span><b>{ownerMetrics.totalUsers}</b></div>
            <div className="blink-setting-readonly"><span>Active owners</span><b>{ownerMetrics.owners}</b></div>
            <div className="blink-setting-readonly"><span>Active admins</span><b>{ownerMetrics.admins}</b></div>
          </div>

          <div className="blink-settings-section">
            <span className="blink-eyebrow">USAGE</span>
            <div className="blink-setting-readonly"><span>Accepted friendships</span><b>{ownerMetrics.acceptedFriendships}</b></div>
            <div className="blink-setting-readonly"><span>Pending friend requests</span><b>{ownerMetrics.pendingFriendships}</b></div>
            <small>Current usage analytics are intentionally limited to non-content social metadata. Browser-local chats, Snaps, Stories and Memories are not uploaded for monitoring.</small>
          </div>

          <div className="blink-settings-section">
            <span className="blink-eyebrow">MISUSE / MODERATION SIGNALS</span>
            <div className="blink-setting-readonly"><span>Active blocks</span><b>{ownerMetrics.blocks}</b></div>
            <div className="blink-setting-readonly"><span>Enabled administrators</span><b>{ownerMetrics.enabledAdmins}</b></div>
            <small>Block totals are a signal for moderation review; they do not by themselves prove misuse.</small>
          </div>

          <div className="blink-settings-section">
            <span className="blink-eyebrow">PERFORMANCE</span>
            <div className="blink-setting-readonly"><span>Client content model</span><b>Browser-local</b></div>
            <div className="blink-setting-readonly"><span>Realtime delivery</span><b>Ephemeral Broadcast</b></div>
            <div className="blink-setting-readonly"><span>Server message database</span><b>Not used</b></div>
            <small>Detailed infrastructure latency and service-resource metrics belong in the Render/Supabase monitoring consoles rather than being fabricated in the client dashboard.</small>
          </div>

          <div className="blink-settings-section">
            <span className="blink-eyebrow">SECURITY & PRIVACY</span>
            <div className="blink-setting-readonly"><span>Admin authorization</span><b>RLS protected</b></div>
            <div className="blink-setting-readonly"><span>Private Realtime channels</span><b>Friend + block checks</b></div>
            <div className="blink-setting-readonly"><span>Chat visibility to Owner/Admin</span><b>Denied</b></div>
            <div className="blink-setting-readonly"><span>Private / Friends Story visibility to Owner/Admin</span><b>Denied unless recipient</b></div>
            <div className="blink-setting-readonly"><span>Private Snap visibility to Owner/Admin</span><b>Denied unless recipient</b></div>
            <div className="blink-setting-readonly"><span>Public Story visibility</span><b>Allowed for all authenticated users</b></div>
            <div className="blink-setting-readonly"><span>Ephemeral content storage</span><b>Browser + transient delivery only</b></div>
            <small>Owner/Admin privileges are for platform administration and non-content metadata. They do not create a backdoor into private chats, private Stories, friends-only Stories or recipient-only Snaps. A public Story is intentionally viewable by authenticated BLINK users.</small>
          </div>

          <div className="blink-settings-section blink-platform-controls">
            <div className="blink-admin-management-head">
              <div>
                <span className="blink-eyebrow">PLATFORM CONTROL DECK</span>
                <h2>BLINK Feature Switchboard</h2>
                <small>Turn major BLINK surfaces on or off for everyone. Privacy protections remain enforced and cannot be disabled here.</small>
              </div>
              <span className="blink-role-badge blink-role-owner">⚡ LIVE CONTROL</span>
            </div>
            <div className="blink-platform-grid">
              {[
                ["camera", "◉", "Camera", "Photos, video and Snaps"],
                ["chat", "◌", "Chat", "Browser-local conversations"],
                ["friends", "♙", "Friends", "Friend discovery and requests"],
                ["stories", "◫", "Stories", "Story publishing and viewing"],
                ["spotlight", "▷", "Spotlight", "Public Spotlight posts"],
                ["map", "⌖", "Map", "Temporary location sharing"],
                ["memories", "▣", "Memories", "Private browser Memories"],
                ["profile", "●", "Account", "Profile and account settings"],
                ["admin", "◆", "Admin", "Owner/Admin control center"]
              ].map(([key, icon, label, description]) => (
                <label className="blink-platform-control" key={key}>
                  <span className="blink-platform-control-icon">{icon}</span>
                  <span className="blink-platform-control-copy"><b>{label}</b><small>{description}</small></span>
                  <input type="checkbox" checked={platformSettings[key] !== false} onChange={(e) => updatePlatformSetting(key, e.target.checked)} disabled={platformSettingsBusy || key === "admin"} />
                  <span className="blink-platform-status">{platformSettings[key] !== false ? "ON" : "OFF"}</span>
                </label>
              ))}
            </div>
            <small>Admin access stays owner-controlled; private chats, recipient-only Snaps and non-public Stories remain inaccessible unless the viewer is an authorized recipient.</small>
          </div>

          <div className="blink-settings-section blink-admin-management">
            <div className="blink-admin-management-head">
              <div>
                <span className="blink-eyebrow">USER MANAGEMENT</span>
                <h2>Users</h2>
                <small>Manage BLINK accounts without accessing private chats, Snaps or Stories.</small>
              </div>
              <button className="blink-button secondary" onClick={() => loadAdminUsers()} disabled={adminUsersBusy}>{adminUsersBusy ? "Working…" : "Refresh users"}</button>
            </div>

            {adminRole === "owner" && <div className="blink-admin-add-user">
              <span className="blink-eyebrow">ADD USER</span>
              <div className="blink-admin-form-grid">
                <input className="blink-search" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Name" />
                <input className="blink-search" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="Email" />
                <input className="blink-search" value={newUserUsername} onChange={(e) => setNewUserUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="Username" />
                <input className="blink-search" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Temporary password (8+ chars)" />
              </div>
              <button className="blink-primary" onClick={createAdminUser} disabled={adminUsersBusy}>＋ Add user</button>
              <small>The account is created with a confirmed email. Give the user the temporary password securely.</small>
            </div>}

            <input className="blink-search" value={adminUserSearch} onChange={(e) => setAdminUserSearch(e.target.value)} placeholder="Search users by username or email…" />
            <div className="blink-admin-user-list">
              {adminUsers
                .filter((u) => {
                  const q = adminUserSearch.trim().toLowerCase();
                  return !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
                })
                .map((u) => {
                  const banned = adminUserIsBanned(u);
                  const isSelf = u.id === me;
                  return <div className="blink-admin-user-row" key={u.id}>
                    <div className="blink-user-inline">
                      <Avatar id={u.id} emoji={u.avatar_emoji} />
                      <div className="blink-admin-user-copy">
                        <b>{u.username ? "@" + u.username : u.email} <RoleBadge role={u.role ?? null} /></b>
                        <small>{u.email || "No email"} · joined {new Date(u.created_at).toLocaleDateString()}</small>
                        <small>{banned ? "🚫 BANNED" : "● Active"}{u.last_sign_in_at ? " · last sign-in " + new Date(u.last_sign_in_at).toLocaleDateString() : ""}</small>
                      </div>
                    </div>
                    <div className="blink-admin-user-actions">
                      <button className="blink-options-button" onClick={() => setAdminUserMenu(adminUserMenu === u.id ? null : u.id)} disabled={adminUsersBusy}>OPTIONS ▾</button>
                      {adminUserMenu === u.id && <div className="blink-admin-user-menu">
                        {u.role === "owner"
                          ? <div className="blink-admin-user-protected">🔒 Owner account — protected</div>
                          : <>
                              {banned
                                ? <button onClick={() => { setAdminUserMenu(null); adminUserAction("unban", u); }} disabled={isSelf}>✅ Unban user</button>
                                : <button onClick={() => { setAdminUserMenu(null); adminUserAction("ban", u); }} disabled={isSelf}>🚫 Ban user</button>}
                              {adminRole === "owner" && <>{!u.role && <button onClick={() => { setAdminUserMenu(null); adminUserAction("promote", u); }}>🛡️ Promote to Admin</button>}{u.role === "admin" && <button onClick={() => { setAdminUserMenu(null); adminUserAction("demote", u); }}>⬇️ Demote Admin</button>}</>}
                              <button className="danger" onClick={() => { setAdminUserMenu(null); adminUserAction("delete", u); }} disabled={isSelf}>🗑️ Remove user</button>
                            </>}
                      </div>}
                    </div>
                  </div>;
                })}
              {!adminUsers.length && <div className="blink-empty">{adminUsersBusy ? "Loading users…" : "No users found."}</div>}
            </div>
          </div>

          <div className="blink-settings-section">
            <span className="blink-eyebrow">OWNER PRIVILEGES</span>
            <div className="blink-setting-readonly"><span>Admin management</span><b>Full</b></div>
            <div className="blink-setting-readonly"><span>Admin permissions</span><b>Full</b></div>
            <div className="blink-setting-readonly"><span>Owner controls</span><b>Full</b></div>
          </div>
        </> : <>
          <p className="blink-feature-note">Your Admin access is limited to permissions explicitly granted by an Owner.</p>
          {adminPermissions.manage_users && <div className="blink-settings-section blink-admin-management">
            <div className="blink-admin-management-head">
              <div><span className="blink-eyebrow">USER MANAGEMENT</span><h2>Users</h2><small>You can moderate accounts, but only the Owner can promote or demote administrators.</small></div>
              <button className="blink-button secondary" onClick={() => loadAdminUsers()} disabled={adminUsersBusy}>{adminUsersBusy ? "Working…" : "Refresh users"}</button>
            </div>
            <input className="blink-search" value={adminUserSearch} onChange={(e) => setAdminUserSearch(e.target.value)} placeholder="Search users…" />
            <div className="blink-admin-user-list">
              {adminUsers.filter((u) => {
                const q = adminUserSearch.trim().toLowerCase();
                return !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
              }).map((u) => {
                const banned = adminUserIsBanned(u);
                return <div className="blink-admin-user-row" key={u.id}>
                  <div className="blink-user-inline"><Avatar id={u.id} emoji={u.avatar_emoji} /><div className="blink-admin-user-copy"><b>{u.username ? "@" + u.username : u.email} <RoleBadge role={u.role ?? null} /></b><small>{u.email}</small><small>{banned ? "🚫 BANNED" : "● Active"}</small></div></div>
                  <div className="blink-admin-user-actions">
                    {banned ? <button onClick={() => adminUserAction("unban", u)} disabled={adminUsersBusy}>Unban</button> : <button onClick={() => adminUserAction("ban", u)} disabled={adminUsersBusy}>Ban</button>}
                    {!u.role && <button onClick={() => adminUserAction("promote", u)} disabled>Promote</button>}
                    {u.role === "admin" && <button onClick={() => adminUserAction("demote", u)} disabled>Demote</button>}
                    <button className="danger" onClick={() => adminUserAction("delete", u)} disabled={adminUsersBusy}>Remove</button>
                  </div>
                </div>;
              })}
            </div>
          </div>}

          <div className="blink-settings-section">
            <span className="blink-eyebrow">GRANTED PERMISSIONS</span>
            {Object.keys(adminPermissions).filter((key) => adminPermissions[key]).length
              ? Object.keys(adminPermissions).filter((key) => adminPermissions[key]).map((key) => <div className="blink-setting-readonly" key={key}><span>{key.replace(/_/g, " ")}</span><b>Allowed</b></div>)
              : <div className="blink-empty">No additional Admin permissions have been granted.</div>}
          </div>
        </>}
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
              <div className="blink-avatar-picker">
                <div className="blink-avatar-picker-head">
                  <span>Avatar</span>
                  <small>Choose 1 of 20 avatars</small>
                </div>
                <div className="blink-avatar-gender-label">Male</div>
                <div className="blink-avatar-grid">
                  {AVATAR_OPTIONS.filter((avatar) => avatar.gender === "Male").map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      className={"blink-avatar-option " + (avatarEmoji === avatar.emoji ? "selected" : "")}
                      onClick={() => saveAvatar(avatar.emoji)}
                      aria-label={"Male avatar " + avatar.id}
                      title={"Male avatar"}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </div>
                <div className="blink-avatar-gender-label">Female</div>
                <div className="blink-avatar-grid">
                  {AVATAR_OPTIONS.filter((avatar) => avatar.gender === "Female").map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      className={"blink-avatar-option " + (avatarEmoji === avatar.emoji ? "selected" : "")}
                      onClick={() => saveAvatar(avatar.emoji)}
                      aria-label={"Female avatar " + avatar.id}
                      title={"Female avatar"}
                    >
                      {avatar.emoji}
                    </button>
                  ))}
                </div>
                <small className="blink-avatar-picker-note">Your avatar is saved to your BLINK profile and shown to other users across BLINK.</small>
              </div>
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
              <div className="blink-setting-readonly"><span>Local content expiry</span><b>Chat: {chatRetention === "seen" ? "after seen" : chatRetention} / Snap: {retentionLabel(snapRetention)} / Story: {retentionLabel(storyRetention)}</b></div>
              <small>Chats, Snaps and Memories are browser-local only. BLINK does not write their contents to the database.</small>
            </div>
          </div>

          <div className="blink-settings-list">
            <button onClick={() => notify("Your username is used for finding and connecting with other BLINK users.")}>◆ <span>Username search</span><b>@{meUsername || "—"}</b></button>
            <button onClick={() => notify("Chats, Snaps and Memories stay in this browser only; opened or expired items are removed locally.")}>◌ <span>Disappearing content</span><b>{chatRetention === "seen" ? "after seen" : chatRetention}</b></button>
            <button onClick={() => saveGhostMode(!ghostMode)}>👻 <span>Ghost Mode</span><b>{ghostMode ? "ON" : "OFF"}</b></button>
          </div>
          <p className="blink-account">{email}</p>
        </div>
      </div>}
    </section>

    <nav className="blink-bottom-nav" aria-label="Main navigation">{nav.map(([id, icon, label]) =>
      <button key={id} className={tab === id ? "active" : ""} onClick={() => navigateTab(id)}><span className="blink-icon">{icon}</span><small>{label}</small></button>
    )}</nav>
    {toast && <div className="blink-toast" role="status">{toast}</div>}
  </main>;
}
