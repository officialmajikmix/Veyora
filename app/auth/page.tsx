"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "signup") setMode("signup");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!configured) {
      setMessage("Account access is being connected. Please check back soon.");
      return;
    }
    setBusy(true);
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth/callback" } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm your account, then sign in here.");
      return;
    }
    window.location.assign("/member");
  }

  return (
    <main className="auth-page">
      <a className="brand" href="/" aria-label="Veyora home"><span className="brand-mark">V</span><span>VEYORA<span className="brand-period">.</span></span></a>
      <section className="auth-card">
        <span className="eyebrow">MEMBER ACCESS</span>
        <h1>{mode === "signin" ? "Welcome back." : "A considered start."}</h1>
        <p>{mode === "signin" ? "Sign in to continue to Veyora." : "Create an account to explore Veyora."}</p>
        <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => { setMode("signin"); setMessage(""); }}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => { setMode("signup"); setMessage(""); }}>Sign up</button>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="email" required disabled={!configured || busy} value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} required disabled={!configured || busy} value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="button button-dark auth-submit" type="submit" disabled={busy || !configured}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        {!configured && <p className="auth-note">Secure account access is not available yet. The sign-in service will be connected before Veyora accepts email or password details.</p>}
        {message && <p className="auth-message" role="status">{message}</p>}
        <a className="auth-home" href="/">← Back to home</a>
      </section>
    </main>
  );
}
