import { AuthGate } from "../AuthGate";
import Home from "../page";

export default function MemberPage() {
  return (
    <AuthGate>
      <Home memberMode />
    </AuthGate>
  );
}
