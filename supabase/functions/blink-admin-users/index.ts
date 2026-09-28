import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "jsr:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function getServiceKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.default) return parsed.default;
    } catch {}
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Authentication required." }, 401);

    const token = authHeader.replace("Bearer ", "");
    const serviceKey = getServiceKey();
    if (!serviceKey) return json({ error: "Server authorization is not configured." }, 500);

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceKey);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) return json({ error: "Invalid session." }, 401);

    const actorId = authData.user.id;
    const { data: actor, error: actorError } = await supabase
      .from("blink_admins")
      .select("role, permissions, enabled")
      .eq("user_id", actorId)
      .maybeSingle();

    if (actorError || !actor?.enabled || !["owner", "admin"].includes(actor.role)) {
      return json({ error: "Administrator access required." }, 403);
    }

    const isOwner = actor.role === "owner";
    const permissions = (actor.permissions ?? {}) as Record<string, boolean>;
    const canManageUsers = isOwner || permissions.manage_users === true;
    const canManageRoles = isOwner;

    const body = req.method === "GET" ? {} : await req.json().catch(() => ({}));
    const action = String(body.action ?? "list");

    if (!canManageUsers) return json({ error: "User-management permission required." }, 403);

    if (action === "list") {
      const users: any[] = [];
      let page = 1;
      const perPage = 1000;
      while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
        if (error) throw error;
        users.push(...(data.users ?? []));
        if (!data.users || data.users.length < perPage) break;
        page += 1;
      }

      const ids = users.map((u) => u.id);
      const [{ data: profiles }, { data: admins }] = await Promise.all([
        ids.length ? supabase.from("profiles").select("id, username, avatar_emoji, created_at").in("id", ids) : Promise.resolve({ data: [] }),
        ids.length ? supabase.from("blink_admins").select("user_id, role, permissions, enabled").in("user_id", ids) : Promise.resolve({ data: [] }),
      ]);
      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      const adminMap = new Map((admins ?? []).map((a: any) => [a.user_id, a]));

      return json({
        users: users.map((u) => {
          const p = profileMap.get(u.id);
          const a = adminMap.get(u.id);
          return {
            id: u.id,
            email: u.email ?? "",
            username: p?.username ?? "",
            avatar_emoji: p?.avatar_emoji ?? null,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at ?? null,
            banned_until: u.banned_until ?? null,
            role: a?.enabled ? a.role : null,
            admin_enabled: a?.enabled ?? false,
            permissions: a?.permissions ?? {},
          };
        }),
      });
    }

    const targetId = String(body.user_id ?? "");
    if (!targetId) return json({ error: "User ID is required." }, 400);
    if (targetId === actorId && ["delete", "ban", "demote"].includes(action)) {
      return json({ error: "You cannot perform this action on your own owner account." }, 400);
    }

    const { data: targetAdmin } = await supabase
      .from("blink_admins")
      .select("role, enabled")
      .eq("user_id", targetId)
      .maybeSingle();

    if (targetAdmin?.role === "owner") {
      return json({ error: "Owner accounts cannot be managed by this dashboard." }, 403);
    }

    if (["promote", "demote"].includes(action) && !canManageRoles) {
      return json({ error: "Only an Owner can promote or demote administrators." }, 403);
    }

    if (action === "ban") {
      const { error } = await supabase.auth.admin.updateUserById(targetId, { ban_duration: "876000h" });
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "unban") {
      const { error } = await supabase.auth.admin.updateUserById(targetId, { ban_duration: "none" });
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "delete") {
      const { error } = await supabase.auth.admin.deleteUser(targetId);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "promote") {
      const permissions = {
        manage_users: true,
        moderate_users: true,
        manage_admins: false,
        view_metrics: true,
      };
      const { error } = await supabase.from("blink_admins").upsert({
        user_id: targetId,
        role: "admin",
        permissions,
        enabled: true,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "demote") {
      const { error } = await supabase.from("blink_admins").delete().eq("user_id", targetId).eq("role", "admin");
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "create") {
      if (!isOwner) return json({ error: "Only an Owner can add users." }, 403);
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      const username = String(body.username ?? "").trim().toLowerCase();
      const name = String(body.name ?? "").trim();
      if (!/^\\S+@\\S+\\.\\S+$/.test(email)) return json({ error: "Enter a valid email." }, 400);
      if (password.length < 8) return json({ error: "Password must be at least 8 characters." }, 400);
      if (!/^[a-z0-9_]{3,24}$/.test(username)) return json({ error: "Username must be 3–24 characters: lowercase letters, numbers or underscore." }, 400);

      const { data: created, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, full_name: name },
      });
      if (error || !created.user) throw error ?? new Error("Could not create user.");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: created.user.id,
        username,
      });
      if (profileError) {
        await supabase.auth.admin.deleteUser(created.user.id);
        throw profileError;
      }
      return json({ ok: true, user_id: created.user.id });
    }

    return json({ error: "Unknown admin action." }, 400);
  } catch (error) {
    console.error("blink-admin-users error", error);
    return json({ error: error instanceof Error ? error.message : "Admin action failed." }, 500);
  }
});
