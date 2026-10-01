import { existsSync } from "node:fs";
import { varlockVitePlugin } from "@varlock/vite-integration";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { config } from "dotenv";

config({ quiet: true });

const inDocker = existsSync("/.dockerenv");

export default defineConfig({
  plugins: [
    varlockVitePlugin({ ssrInjectMode: "resolved-env" }),
    sveltekit(),
    tailwindcss(),
  ],
  css: { devSourcemap: true },
  server: {
    ...(inDocker
      ? { host: true, watch: { usePolling: true, interval: 1000 } }
      : {}),
    ...(process.env.PUBLIC_PROXY_DOMAIN
      ? {
          proxy: {
            "/proxy": {
              target: process.env.PUBLIC_PROXY_DOMAIN,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/proxy/, ""),
            },
          },
        }
      : {}),
  },
});
