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
  const [tokenHash, setTokenHash] = useState("");
  const verificationStarted = useRef(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const supabase = useMemo(() => configured
    ? createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
    : null, [configured]);

  useEffect(() => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;

    async function prepareRecovery() {
      if (!supabase) {
        setMessage("Password recovery is not available right now. Please try again later.");
        setVerifying(false);
        return;
      }
      try {
        const url = new URL(window.location.href);
        const hash = url.searchParams.get("token_hash");
        if (hash && url.searchParams.get("type") === "recovery") {
          setTokenHash(hash);
          setVerifying(false);
          window.history.replaceState({}, document.title, url.pathname);
          return;
        }

        let session = null;
        const { data: current, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        session = current.session;
        const code = url.searchParams.get("code");
        if (!session && code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          session = data.session;
        }

        if (session) {
          setLinkReady(true);
          window.history.replaceState({}, document.title, url.pathname);
        } else {
          setMessage("This reset link is invalid or has expired. Request a new password reset link and try again.");
        }
      } catch (error) {
        const detail = error instanceof Error ? error.message : "";
        setMessage(detail || "This reset link could not be verified. Request a new link and try again.");
      } finally {
        setVerifying(false);
      }
    }

    void prepareRecovery();
  }, [supabase]);

  async function verifyRecoveryLink() {
    if (!supabase || !tokenHash) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
      if (error) {
        setMessage(error.message || "This reset link is invalid or has expired. Request a new link and try again.");
        return;
      }
      setTokenHash("");
      setLinkReady(true);
      setMessage("");
    } catch {
      setMessage("This reset link could not be verified. Request a new link and try again.");
    } finally {
      setBusy(false);
    }
  }

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
        <h1>{verifying ? "Verifying your reset link." : tokenHash ? "Confirm your reset link." : "Choose a new password."}</h1>
        <p>{verifying ? "Please wait while we verify your secure link." : tokenHash ? "Click below to verify your link and continue to password setup." : "Use at least 8 characters for your Veyora account."}</p>
        {!verifying && tokenHash && <button className="button button-dark auth-submit" type="button" onClick={verifyRecoveryLink} disabled={busy}>{busy ? "Please wait…" : "Continue to password setup"}</button>}
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
        {!verifying && !tokenHash && !linkReady && <a className="auth-link" href="/auth">Request another reset link</a>}
        {message && <p className="auth-message" role="status">{message}</p>}
        {!updated && <a className="auth-home" href="/auth">← Back to sign in</a>}
      </section>
    </main>
  );
}
