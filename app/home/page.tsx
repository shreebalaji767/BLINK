import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/blink/auth/SignOutButton";
export default async function HomePage(){const supabase=await createClient();const {data}=await supabase.auth.getClaims();if(!data?.claims)redirect("/login");const email=typeof data.claims.email==="string"?data.claims.email:"Authenticated user";return <main className="blink-home"><section className="blink-home-card"><p className="blink-logo">BLINK</p><h1>You are signed in.</h1><p className="blink-muted">{email}</p><div className="blink-spacer"/><SignOutButton/></section></main>;}
