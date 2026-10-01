import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BlinkApp from "@/components/blink/app/BlinkApp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "BLSSNVJ21 private BLINK space for camera, chat, stories, friends, memories, and more.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  const email = typeof data.claims.email === "string" ? data.claims.email : "BLINK user";
  return <BlinkApp email={email} />;
}
