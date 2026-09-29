import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
  plugins: [react(), {
    name: "storefront-robots",
    generateBundle() {
      // The live backend sitemap includes products added after this frontend build.
      const api = env.VITE_API_BASE_URL?.replace(/\/$/, "");
      this.emitFile({ type: "asset", fileName: "robots.txt", source:
        `User-agent: *\nAllow: /\n${api && /^https:\/\//.test(api) ? `Sitemap: ${api}/sitemap.xml\n` : ""}` });
    },
  }],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
  };
});
