import { AuthGate } from "../AuthGate";
import VeyoraPage from "../page";

export default function MemberPage() {
  return (
    <AuthGate><VeyoraPage memberMode /></AuthGate>
  );
}
