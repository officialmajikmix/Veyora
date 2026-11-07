"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";

type AuthMode = "signin" | "signup" | "recovery";

function readableAuthError(error: unknown) {
  const clean = (value: unknown) => {
    if (typeof value !== "string") return "";
    const message = value.trim();
    return message === "{}" || message === "[object Object]" ? "" : message;
  };
  const fallback = "The account service could not complete that request. Check your connection and try again.";
  if (typeof error === "string") return clean(error) || fallback;
  if (error instanceof Error) return clean(error.message) || fallback;
  if (error && typeof error === "object") {
    const details = error as Record<string, unknown>;
    for (const key of ["message", "msg", "error_description", "error"]) {
      const message = clean(details[key]);
      if (message) return message;
    }
    if (details.name === "AuthRetryableFetchError" || details.status === 0) {
      return "Veyora could not reach the account service. Check your connection and try again.";
    }
  }
  return fallback;
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "signup") setMode("signup");
    if (new URLSearchParams(window.location.search).get("error") === "confirmation") {
      setMessage("That link could not be verified. Request a new email and try again.");
    }
  }, []);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
    setPassword("");
    setShowPassword(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!configured) {
      setMessage("Account access is being connected. Please check back soon.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
      if (mode === "recovery") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/auth/reset-password",
        });
        if (error) {
          setMessage(readableAuthError(error));
          return;
        }
        setMessage("If an account uses that email, a password reset link is on its way. Check your inbox.");
        return;
      }

      const { data, error } = mode === "signup"
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth/callback" } })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(readableAuthError(error));
        return;
      }
      if (mode === "signup" && !data.session) {
        setMessage("Check your email to confirm your account, then sign in here.");
        return;
      }
      window.location.assign("/member");
    } catch (error) {
      setMessage(readableAuthError(error));
    } finally {
      setBusy(false);
    }
  }

  const heading = mode === "signin" ? "Welcome back." : mode === "signup" ? "A considered start." : "Reset your password.";
  const intro = mode === "signin" ? "Sign in to continue to Veyora." : mode === "signup" ? "Create an account to explore Veyora." : "Enter your account email and we’ll send a secure reset link.";

  return (
    <main className="auth-page">
      <a className="brand" href="/" aria-label="Veyora home"><span className="brand-mark">V</span><span>VEYORA<span className="brand-period">.</span></span></a>
      <section className="auth-card">
        <span className="eyebrow">MEMBER ACCESS</span>
        <h1>{heading}</h1>
        <p>{intro}</p>
        {mode !== "recovery" && <div className="auth-tabs" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => changeMode("signin")}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => changeMode("signup")}>Sign up</button>
        </div>}
        <form onSubmit={submit}>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" autoComplete="email" required disabled={!configured || busy} value={email} onChange={(event) => setEmail(event.target.value)} />
          {mode !== "recovery" && <>
            <label htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} required disabled={!configured || busy} value={password} onChange={(event) => setPassword(event.target.value)} style={{ paddingRight: "70px" }} />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)} disabled={busy} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: 0, color: "inherit", cursor: "pointer", padding: "8px", font: "inherit" }}>{showPassword ? "Hide" : "Show"}</button>
            </div>
          </>}
          <button className="button button-dark auth-submit" type="submit" disabled={busy || !configured}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}</button>
        </form>
        {mode === "signin" && <button type="button" className="auth-link" onClick={() => changeMode("recovery")}>Forgot password?</button>}
        {mode === "recovery" && <button type="button" className="auth-link" onClick={() => changeMode("signin")}>Back to sign in</button>}
        {!configured && <p className="auth-note">Secure account access is not available yet. The sign-in service will be connected before Veyora accepts email or password details.</p>}
        {message && <p className="auth-message" role="status">{message}</p>}
        <a className="auth-home" href="/">← Back to home</a>
      </section>
    </main>
  );
}
