import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Build config untuk env STAGING — pakai wrangler.staging.jsonc
// (worker mulai-plus-web-staging + route staging.karir.mulaiplus.id)
export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    cloudflare({
      configPath: "wrangler.staging.jsonc",
      viteEnvironment: { name: "ssr" },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
