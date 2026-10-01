import type { Metadata } from "next";
import LoginForm from "@/components/blink/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to BLINK and connect through private chat, snaps, stories, and friends.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <main className="blink-shell" aria-labelledby="blink-login-title">
      <section className="blink-card">
        <p className="blink-logo" aria-label="BLINK">BLINK</p>
        <h1 id="blink-login-title" className="blink-sr-only">Sign in to BLINK</h1>
        <p className="blink-muted">Sign in or create your account.</p>
        <LoginForm />
      </section>
    </main>
  );
}
