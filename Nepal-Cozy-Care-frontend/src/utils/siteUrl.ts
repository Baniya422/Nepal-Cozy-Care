export const SITE_NAME = "Nepal Cozy Care";
export const siteOrigin = () => (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, "");
export const absoluteSiteUrl = (path: string) => new URL(path, `${siteOrigin()}/`).href;
