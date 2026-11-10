"use client";

import { useCallback, useEffect, useState } from "react";

type Verification = {
  paid?: boolean;
  status?: string;
  amountNgn?: number;
  invoiceReference?: string;
  error?: string;
};

export function PaymentResult({ reference }: { reference: string }) {
  const [result, setResult] = useState<Verification | null>(null);
  const [busy, setBusy] = useState(false);

  const verify = useCallback(async () => {
    if (!reference) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/checkout/verify?reference=${encodeURIComponent(reference)}`, { cache: "no-store" });
      const data = await response.json();
      setResult(response.ok ? data : { error: data.error ?? "We could not verify the payment." });
    } catch {
      setResult({ error: "Payment verification is temporarily unavailable. Please try again." });
    } finally {
      setBusy(false);
    }
  }, [reference]);

  useEffect(() => { void verify(); }, [verify]);

  const paid = result?.paid === true;
  return (
    <main className="payment-result-page">
      <a className="payment-result-brand" href="/">MAJIK MIX</a>
      <div className={`payment-result-card${paid ? " is-paid" : ""}`}>
        <span className="payment-result-eyebrow">{busy ? "VERIFYING PAYMENT" : paid ? "PAYMENT VERIFIED" : "PAYMENT STATUS"}</span>
        <h1>{busy ? "Checking your payment…" : paid ? "You’re all set." : "We’re checking."}</h1>
        <p>{busy ? "Please wait while Paystack confirms the transaction." : paid ? "Paystack confirmed this payment. Keep your Paystack receipt and invoice for your records; Majik Mix will match the payment to your project." : result?.error ?? "The payment is not yet confirmed. This page alone does not prove payment. Try again in a moment or check your Paystack receipt."}</p>
        {paid && result?.amountNgn != null && <dl><div><dt>Paid</dt><dd>₦{result.amountNgn.toLocaleString("en-NG")}</dd></div><div><dt>Invoice</dt><dd>{result.invoiceReference}</dd></div></dl>}
        {reference && <p className="payment-reference">Reference: {reference}</p>}
        {!paid && <button type="button" className="payment-result-retry" onClick={() => void verify()} disabled={busy}>{busy ? "Checking…" : "Check payment again"}</button>}
        <a className="payment-result-home" href="/">Return to Majik Mix</a>
      </div>
    </main>
  );
}
