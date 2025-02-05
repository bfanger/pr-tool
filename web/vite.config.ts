import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  css: { devSourcemap: true },
  test: {
    environment: "happy-dom",
    exclude: [...configDefaults.exclude, "package", "playwright"],
  },
});
