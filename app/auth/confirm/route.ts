import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
const allowed=new Set(["signup","invite","recovery","email_change","email"]);
export async function GET(request:Request){const url=new URL(request.url);const tokenHash=url.searchParams.get("token_hash");const type=url.searchParams.get("type");if(!tokenHash||!type||!allowed.has(type))return NextResponse.redirect(new URL("/login?error=invalid_confirmation",url.origin));const supabase=await createClient();const {error}=await supabase.auth.verifyOtp({token_hash:tokenHash,type:type as "signup"|"invite"|"recovery"|"email_change"|"email"});if(error)return NextResponse.redirect(new URL("/login?error=confirmation_failed",url.origin));return NextResponse.redirect(new URL("/home",url.origin));}
