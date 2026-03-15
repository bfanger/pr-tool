import { varlockVitePlugin } from "@varlock/vite-integration";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { configDefaults, defineConfig } from "vitest/config";
import { config } from "dotenv";

config({ quiet: true });

export default defineConfig({
  plugins: [
    varlockVitePlugin({ ssrInjectMode: "resolved-env" }),
    sveltekit(),
    tailwindcss(),
  ],
  css: { devSourcemap: true },
  test: {
    environment: "happy-dom",
    exclude: [...configDefaults.exclude, "package", "playwright"],
  },
  ...(process.env.PUBLIC_PROXY_DOMAIN
    ? {
        server: {
          proxy: {
            "/proxy": {
              target: process.env.PUBLIC_PROXY_DOMAIN,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/proxy/, ""),
            },
          },
        },
      }
    : {}),
});
