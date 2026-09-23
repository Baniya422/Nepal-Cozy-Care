import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export interface SiteBranding {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  admin_dashboard_title: string;
  footer_description: string;
}

export const defaultBranding: SiteBranding = {
  site_name: "Cozy Care",
  site_tagline: "Nepal Plant Studio",
  logo_url: "",
  admin_dashboard_title: "Cozy Care admin dashboard",
  footer_description: "A smart plant care & e-commerce platform that helps you track watering, get expert tips, and shop plants & accessories.",
};

const BrandingContext = createContext<{
  branding: SiteBranding;
  refreshBranding: () => Promise<void>;
}>({
  branding: defaultBranding,
  refreshBranding: async () => {},
});

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<SiteBranding>(() => {
    try {
      const cached = localStorage.getItem("cozycare_cache_branding");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          return { ...defaultBranding, ...parsed };
        }
      }
    } catch {
      // ignore
    }
    return defaultBranding;
  });

  const fetchBranding = async () => {
    try {
      const res = await fetch(`${API}/api/site-branding`);
      if (res.ok) {
        const json = await res.json();
        const payload = json?.data?.payload;
        if (payload && typeof payload === "object") {
          const merged: SiteBranding = {
            site_name: payload.site_name || defaultBranding.site_name,
            site_tagline: payload.site_tagline || defaultBranding.site_tagline,
            logo_url: payload.logo_url || "",
            admin_dashboard_title: payload.admin_dashboard_title || defaultBranding.admin_dashboard_title,
            footer_description: payload.footer_description || defaultBranding.footer_description,
          };
          setBranding(merged);
          localStorage.setItem("cozycare_cache_branding", JSON.stringify(merged));
        }
      }
    } catch {
      // fallback quietly
    }
  };

  useEffect(() => {
    fetchBranding();
    const handleUpdated = () => {
      fetchBranding();
    };
    window.addEventListener("cozycare:branding-updated", handleUpdated);
    window.addEventListener("cozycare:content-updated", handleUpdated);
    return () => {
      window.removeEventListener("cozycare:branding-updated", handleUpdated);
      window.removeEventListener("cozycare:content-updated", handleUpdated);
    };
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useSiteBranding() {
  return useContext(BrandingContext);
}
