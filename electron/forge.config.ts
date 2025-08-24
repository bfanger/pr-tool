import type { ForgeConfig } from "@electron-forge/shared-types";
import { VitePlugin } from "@electron-forge/plugin-vite";

const config: ForgeConfig = {
  packagerConfig: {
    icon: "icon.icns",
  },
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "src/main.ts",
          config: "vite.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.config.ts",
          target: "preload",
        },
      ],
      renderer: [],
    }),
  ],
};

export default config;
