import { PaymentResult } from "../../PaymentResult";

export const dynamic = "force-dynamic";

export default async function CheckoutCompletePage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const { reference = "" } = await searchParams;
  return <PaymentResult reference={reference} />;
}
