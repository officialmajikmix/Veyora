import type { Metadata } from "next";
import { AuthGate } from "../../AuthGate";
import { MemberPlanWorkspace } from "../../MemberPlanWorkspace";

export const metadata: Metadata = {
  title: "My Research Plan | Veyora",
  description: "Organize your asset research questions in your private Veyora member workspace.",
  robots: { index: false, follow: false },
};

export default function MemberPlanningPage() {
  return <AuthGate><MemberPlanWorkspace /></AuthGate>;
}
