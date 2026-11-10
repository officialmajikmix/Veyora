"use client";

import { useState, type FormEvent } from "react";

export function CheckoutForm({ enabled }: { enabled: boolean }) {
  const [email, setEmail] = useState("");
  const [invoiceReference, setInvoiceReference] = useState("");
  const [amountNgn, setAmountNgn] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, invoiceReference, amountNgn: Number(amountNgn) }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.authorizationUrl !== "string") {
        setMessage(result.error ?? "Checkout could not start. Please contact Majik Mix.");
        return;
      }
      const destination = new URL(result.authorizationUrl);
      if (destination.protocol !== "https:" || destination.hostname !== "checkout.paystack.com") {
        setMessage("Checkout returned an invalid payment link. Please contact Majik Mix.");
        return;
      }
      window.location.assign(destination.toString());
    } catch {
      setMessage("We could not reach checkout. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="music-checkout">
      <div className="music-checkout-intro">
        <span className="quote-status-dot" /> {enabled ? "PAYSTACK CHECKOUT" : "CHECKOUT SETUP IN PROGRESS"}
        <p>Use the invoice reference and exact NGN amount provided by Majik Mix. Quotes and bespoke work are paid only against a written invoice.</p>
      </div>
      <form onSubmit={submit}>
        <label>Email for your payment receipt<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
        <label>Invoice reference<input required minLength={3} maxLength={40} pattern="[A-Za-z0-9][A-Za-z0-9._/\-]{2,39}" value={invoiceReference} onChange={(event) => setInvoiceReference(event.target.value)} placeholder="e.g. MM-INV-1042" /></label>
        <label>Invoice amount (NGN)<span className="music-amount-field"><span>₦</span><input type="number" inputMode="numeric" min="5000" max="1000000" step="1" required value={amountNgn} onChange={(event) => setAmountNgn(event.target.value)} placeholder="50000" /></span></label>
        <button className="music-checkout-submit" type="submit" disabled={!enabled || busy}>{busy ? "Opening secure checkout…" : enabled ? "Continue to secure checkout ↗" : "Checkout unavailable"}</button>
        <p className="music-checkout-privacy">Your email, invoice reference, and amount go to Paystack to process payment. Majik Mix never receives or stores your card or bank login details.</p>
        <p className="music-checkout-message" aria-live="polite">{message}</p>
      </form>
    </div>
  );
}
