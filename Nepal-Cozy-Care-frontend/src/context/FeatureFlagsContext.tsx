import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export interface FeatureFlags {
  vendor_marketplace_enabled: boolean;
  esewa_enabled: boolean;
  free_delivery_threshold: number;
  free_delivery_radius_km: number;
  standard_delivery_fee: number;
  dispatch_configured: boolean;
  dispatch_address: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const defaultFlags: FeatureFlags = {
  vendor_marketplace_enabled: false,
  esewa_enabled: false,
  free_delivery_threshold: 2000,
  free_delivery_radius_km: 10,
  standard_delivery_fee: 100,
  dispatch_configured: false,
  dispatch_address: null,
  loading: true,
  refresh: async () => {},
};

const FeatureFlagsContext = createContext<FeatureFlags>(defaultFlags);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Omit<FeatureFlags, "loading" | "refresh">>({
    vendor_marketplace_enabled: false,
    esewa_enabled: false,
    free_delivery_threshold: 2000,
    free_delivery_radius_km: 10,
    standard_delivery_fee: 100,
    dispatch_configured: false,
    dispatch_address: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      const res = await fetch(`${API}/api/features`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setFlags({
            vendor_marketplace_enabled: Boolean(json.data.vendor_marketplace_enabled),
            esewa_enabled: Boolean(json.data.esewa_enabled),
            free_delivery_threshold: Number(json.data.free_delivery_threshold ?? 2000),
            free_delivery_radius_km: Number(json.data.free_delivery_radius_km ?? 10),
            standard_delivery_fee: Number(json.data.standard_delivery_fee ?? 100),
            dispatch_configured: Boolean(json.data.dispatch_configured),
            dispatch_address: json.data.dispatch_address ?? null,
          });
        }
      }
    } catch {
      // Keep safe defaults if offline or network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFlags();
  }, []);

  return (
    <FeatureFlagsContext.Provider
      value={{
        ...flags,
        loading,
        refresh: fetchFlags,
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlags {
  return useContext(FeatureFlagsContext);
}
