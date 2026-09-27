import { withSupabase } from "npm:@supabase/server@^1";

const encoder = new TextEncoder();

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default {
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    if (req.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405 });
    const supplied = req.headers.get("x-blink-cleanup-token") ?? "";
    const { data: config } = await ctx.supabaseAdmin.schema("blink_private").from("cleanup_auth").select("token_hash").eq("id", true).maybeSingle();
    if (!config || (await sha256(supplied)) !== config.token_hash) return Response.json({ error: "unauthorized" }, { status: 401 });

    const { error } = await ctx.supabaseAdmin.rpc("cleanup_expired_rows", {}, { schema: "blink_private" });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }),
};