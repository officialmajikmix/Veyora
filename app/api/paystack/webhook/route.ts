import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function safeEqualHex(expected: string, actual: string) {
  if (!/^[a-f0-9]{128}$/i.test(actual) || !/^[a-f0-9]{128}$/i.test(expected)) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(actual, "hex"));
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
  const signature = request.headers.get("paystack-signature");
  let verified = false;

  if (webhookSecret && signature) {
    const values = new Map(signature.split(",").map((part) => {
      const index = part.indexOf("=");
      return index < 0 ? ["", ""] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
    }));
    const timestamp = values.get("t") ?? "";
    const timestampNumber = Number(timestamp);
    const signatures = signature.split(",").filter((part) => part.trim().startsWith("v1="));
    const isFresh = Number.isSafeInteger(timestampNumber) && Math.abs(Date.now() / 1000 - timestampNumber) <= 300;
    if (isFresh) {
      const expected = createHmac("sha512", webhookSecret).update(`${timestamp}.${rawBody}`).digest("hex");
      verified = signatures.some((part) => {
        const value = part.trim().slice(3);
        const colon = value.indexOf(":");
        return colon > -1 && safeEqualHex(expected, value.slice(colon + 1));
      });
    }
  } else {
    const legacySecret = process.env.PAYSTACK_SECRET_KEY;
    const legacySignature = request.headers.get("x-paystack-signature") ?? "";
    if (legacySecret && legacySignature) {
      const expected = createHmac("sha512", legacySecret).update(rawBody).digest("hex");
      verified = safeEqualHex(expected, legacySignature);
    }
  }

  if (!verified) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });

  let event: { event?: unknown; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid event body." }, { status: 400 });
  }

  // Payment confirmation and reconciliation are performed against Paystack's
  // verified transaction record; this endpoint never fulfils an order itself.
  if (event.event === "charge.success") {
    const data = event.data;
    if (!data || data.currency !== "NGN" || data.status !== "success" ||
      typeof data.reference !== "string" || !data.reference.startsWith("MM")) {
      return NextResponse.json({ error: "Unexpected payment event." }, { status: 400 });
    }
  }
  return NextResponse.json({ received: true });
}
