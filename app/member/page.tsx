import { AuthGate } from "../AuthGate";
import VeyoraPage from "../page";

export default function MemberPage() {
  return (
    <AuthGate>
      <a className="member-planning-entry" href="/member/planning">
        <span><strong>Member research plan</strong><br />Save and track your due-diligence questions.</span>
        <span aria-hidden="true">↗</span>
      </a>
      <VeyoraPage memberMode />
    </AuthGate>
  );
}
