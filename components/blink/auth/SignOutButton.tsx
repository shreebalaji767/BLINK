"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
export default function SignOutButton(){const router=useRouter();async function signOut(){const supabase=createClient();await supabase.auth.signOut();router.replace("/login");router.refresh();}return <button className="blink-button secondary" onClick={signOut}>Sign out</button>;}
