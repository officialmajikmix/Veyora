import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference") ?? "";
  if (!/^MM\d{13}[a-f0-9]{32}$/.test(reference)) {
    return NextResponse.json({ error: "The payment reference is invalid." }, { status: 400 });
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Payment verification is not configured yet." }, { status: 503 });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    const result = await response.json();
    if (!response.ok || result?.status !== true || !result?.data) {
      return NextResponse.json({ error: "We could not verify this payment yet. Check your Paystack receipt or contact Majik Mix." }, { status: 502 });
    }

    const data = result.data;
    const invoiceReference = data.metadata?.invoice_reference;
    const paid = data.status === "success" && data.currency === "NGN" && data.reference === reference &&
      Number.isSafeInteger(data.amount) && data.amount >= 500_000 && data.amount <= 100_000_000 &&
      typeof invoiceReference === "string";

    return NextResponse.json({
      paid,
      status: paid ? "success" : data.status,
      amountNgn: paid ? data.amount / 100 : undefined,
      invoiceReference: paid ? invoiceReference : undefined,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Payment verification is temporarily unavailable." }, { status: 502 });
  }
}
