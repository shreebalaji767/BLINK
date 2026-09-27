import { withSupabase } from "npm:@supabase/server@^1";

const fixedReplies: Record<string, string[]> = {
  computer: ["I’m BLINK Computer. Deterministic rules only — no AI.", "Beep. Message received.", "Computer status: online.", "Try: hello, status, help, or bye."],
  arcade: ["🎮 Arcade ready. Type PLAY.", "High score mode: waiting.", "Game system online. Fixed computer rules only."],
  helper: ["🛰️ BLINK Helper online.", "I answer a small fixed command set.", "Try HELP or STATUS."],
};

function replyFor(botKey: string, body: string) {
  const text = body.trim().toLowerCase();
  if (["hello", "hi", "hey"].includes(text)) return "Hello. Computer online.";
  if (text === "status") return "STATUS: online • deterministic rules • no AI.";
  if (text === "help") return "COMMANDS: hello • status • help • bye";
  if (text === "bye") return "Bye. Computer will remain here.";
  if (botKey === "arcade" && text === "play") return "🎮 PLAY accepted. Round 1 started.";
  const list = fixedReplies[botKey] ?? fixedReplies.computer;
  return list[Math.floor(Date.now() / 1000) % list.length];
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405 });
    const { conversationId, messageId } = await req.json();
    const userId = ctx.userClaims?.sub;
    if (!userId || !conversationId || !messageId) return Response.json({ error: "invalid_request" }, { status: 400 });

    const { data: member } = await ctx.supabase.from("conversation_members").select("conversation_id").eq("conversation_id", conversationId).eq("user_id", userId).maybeSingle();
    if (!member) return Response.json({ error: "not_a_member" }, { status: 403 });

    const { data: bot } = await ctx.supabase.from("conversation_bots").select("bot_id,bot_profiles(bot_key,enabled)").eq("conversation_id", conversationId).maybeSingle();
    const profile = Array.isArray((bot as any)?.bot_profiles) ? (bot as any).bot_profiles[0] : (bot as any)?.bot_profiles;
    if (!bot || !profile?.enabled) return Response.json({ error: "bot_not_available" }, { status: 404 });

    const { data: incoming } = await ctx.supabase.from("messages").select("body,sender_id").eq("id", messageId).eq("conversation_id", conversationId).maybeSingle();
    if (!incoming || incoming.sender_id !== userId) return Response.json({ error: "message_not_owned" }, { status: 403 });

    const { error } = await ctx.supabaseAdmin.from("messages").insert({
      conversation_id: conversationId,
      sender_id: null,
      sender_bot_id: bot.bot_id,
      body: replyFor(profile.bot_key, incoming.body ?? ""),
      message_type: "text",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }),
};