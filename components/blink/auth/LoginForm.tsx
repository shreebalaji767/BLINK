"use client";

import { FormEvent, useState } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { BlinkInput } from "@/components/blink/forms/BlinkInput";
import { BlinkPasswordInput } from "@/components/blink/forms/BlinkPasswordInput";
import { BlinkSecurityAlert } from "@/components/blink/security/BlinkSecurityAlert";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return window.location.origin;
}

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid details.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const siteUrl = getSiteUrl();

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${siteUrl}/auth/callback?next=/home`
            }
          });

    setBusy(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "signup") {
      setMessage("Account created. Check your email if confirmation is enabled.");
      return;
    }

    window.location.assign("/home");
  }

  async function google() {
    setError("");
    setMessage("");
    setBusy(true);

    const supabase = createClient();
    const siteUrl = getSiteUrl();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=/home`
      }
    });

    if (error) {
      setBusy(false);
      setError(error.message);
    }
  }

  return (
    <div className="blink-form">
      <button
        className="blink-button secondary"
        type="button"
        disabled={busy}
        onClick={google}
      >
        Continue with Google
      </button>

      <div className="blink-divider">
        <span>OR</span>
      </div>

      {error && <BlinkSecurityAlert message={error} />}

      {message && (
        <div className="blink-success" role="status">
          {message}
        </div>
      )}

      <form className="blink-form" onSubmit={submit}>
        <BlinkInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <BlinkPasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        <button className="blink-button" disabled={busy} type="submit">
          {busy ? "Working…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        className="blink-button secondary"
        type="button"
        disabled={busy}
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
          setMessage("");
        }}
      >
        {mode === "login"
          ? "Create a new account"
          : "I already have an account"}
      </button>
    </div>
  );
}
