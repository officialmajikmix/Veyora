import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MIN_AMOUNT_NGN = 5_000;
const MAX_AMOUNT_NGN = 1_000_000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const invoicePattern = /^[A-Za-z0-9][A-Za-z0-9._/-]{2,39}$/;

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== request.nextUrl.origin) {
        return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Online checkout is not active yet. Please request an invoice from Majik Mix." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter your invoice details and try again." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Enter your invoice details and try again." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const invoiceReference = typeof input.invoiceReference === "string" ? input.invoiceReference.trim() : "";
  const amountNgn = Number(input.amountNgn);
  if (!emailPattern.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!invoicePattern.test(invoiceReference)) {
    return NextResponse.json({ error: "Enter the invoice reference shown on your Majik Mix invoice." }, { status: 400 });
  }
  if (!Number.isSafeInteger(amountNgn) || amountNgn < MIN_AMOUNT_NGN || amountNgn > MAX_AMOUNT_NGN) {
    return NextResponse.json({ error: "Enter the exact NGN amount on your invoice (₦5,000–₦1,000,000)." }, { status: 400 });
  }

  const reference = `MM${Date.now()}${randomUUID().replaceAll("-", "")}`;
  const callbackUrl = new URL("/checkout/complete", request.nextUrl.origin).toString();
  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: String(amountNgn * 100),
        currency: "NGN",
        reference,
        callback_url: callbackUrl,
        channels: ["card", "bank", "bank_transfer", "ussd"],
        metadata: { invoice_reference: invoiceReference, custom_fields: [{ display_name: "Majik Mix invoice", variable_name: "invoice_reference", value: invoiceReference }] },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    const result = await response.json();
    const checkoutUrl = result?.data?.authorization_url;
    if (!response.ok || result?.status !== true || typeof checkoutUrl !== "string") {
      return NextResponse.json({ error: "Paystack could not start checkout. Check your invoice details or contact Majik Mix." }, { status: 502 });
    }
    const parsedUrl = new URL(checkoutUrl);
    if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "checkout.paystack.com") {
      return NextResponse.json({ error: "Paystack returned an unexpected checkout link." }, { status: 502 });
    }
    return NextResponse.json({ authorizationUrl: parsedUrl.toString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not reach Paystack. Please try again shortly." }, { status: 502 });
  }
}
