import type { ReactNode } from "react";
import { useFeatureFlags } from "../../context/FeatureFlagsContext";
import MarketplaceDisabledNotice from "./MarketplaceDisabledNotice";

export default function VendorRouteGuard({ children }: { children: ReactNode }) {
  const { vendor_marketplace_enabled, loading } = useFeatureFlags();

  if (loading) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#6b7280" }}>
        Loading marketplace settings...
      </div>
    );
  }

  if (!vendor_marketplace_enabled) {
    return <MarketplaceDisabledNotice />;
  }

  return <>{children}</>;
}
