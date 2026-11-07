"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [updated, setUpdated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [linkReady, setLinkReady] = useState(false);
  const verificationStarted = useRef(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const supabase = useMemo(() => configured
    ? createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
    : null, [configured]);

  useEffect(() => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;
    async function verifyRecoveryLink() {
      if (!supabase) {
        setMessage("Password recovery is not available right now. Please try again later.");
        setVerifying(false);
        return;
      }

      try {
        const url = new URL(window.location.href);
        const { data: current, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        let session = current.session;

        const code = url.searchParams.get("code");
        if (!session && code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          session = data.session;
        }

        if (!session) {
          setMessage("This reset link is invalid or has expired. Request a new password reset link and try again.");
          return;
        }
        setLinkReady(true);
        window.history.replaceState({}, document.title, url.pathname);
      } catch (error) {
        const detail = error instanceof Error ? error.message : "";
        setMessage(detail || "This reset link could not be verified. Request a new link and try again.");
      } finally {
        setVerifying(false);
      }
    }

    void verifyRecoveryLink();
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (password !== confirmPassword) {
      setMessage("Those passwords do not match. Please check them and try again.");
      return;
    }
    if (!supabase) {
      setMessage("Password recovery is not available right now. Please try again later.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message || "The password could not be updated. Request a new reset link and try again.");
        return;
      }
      setUpdated(true);
      setMessage("Your password has been updated. You can now sign in with it.");
    } catch {
      setMessage("The password could not be updated. Request a new reset link and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <a className="brand" href="/" aria-label="Veyora home"><span className="brand-mark">V</span><span>VEYORA<span className="brand-period">.</span></span></a>
      <section className="auth-card">
        <span className="eyebrow">MEMBER ACCESS</span>
        <h1>{verifying ? "Verifying your reset link." : "Choose a new password."}</h1>
        <p>{verifying ? "Please wait while we verify your secure link." : "Use at least 8 characters for your Veyora account."}</p>
        {!verifying && linkReady && !updated && <form onSubmit={submit}>
          <label htmlFor="new-password">New password</label>
          <div style={{ position: "relative" }}>
            <input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required disabled={busy} value={password} onChange={(event) => setPassword(event.target.value)} style={{ paddingRight: "70px" }} />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)} disabled={busy} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: 0, color: "inherit", cursor: "pointer", padding: "8px", font: "inherit" }}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          <label htmlFor="confirm-password">Confirm new password</label>
          <input id="confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required disabled={busy} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          <button className="button button-dark auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : "Update password"}</button>
        </form>}
        {!verifying && updated && <a className="button button-dark auth-submit" href="/auth">Go to sign in</a>}
        {!verifying && !linkReady && <a className="auth-link" href="/auth">Request another reset link</a>}
        {message && <p className="auth-message" role="status">{message}</p>}
        {!updated && <a className="auth-home" href="/auth">← Back to sign in</a>}
      </section>
    </main>
  );
}
