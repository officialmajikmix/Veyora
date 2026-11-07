import { AdminGate } from "../../AdminGate";
import { AdminAssetIntake } from "../../AdminAssetIntake";

export const metadata = {
  title: "Private Asset Intake | Veyora",
  description: "Internal candidate asset evidence review.",
  robots: { index: false, follow: false },
};

export default function AdminIntakePage() {
  return (
    <AdminGate>
      <AdminAssetIntake />
    </AdminGate>
  );
}
