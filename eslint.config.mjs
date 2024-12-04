import tripleConfig from "eslint-config-triple/svelte";

export default [
  ...tripleConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.eslint.json",
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": 0,
      "@typescript-eslint/no-unnecessary-condition": 0,
      "@typescript-eslint/no-unnecessary-type-assertion": 0,
      "@typescript-eslint/no-unsafe-argument": 0,
      "@typescript-eslint/no-unsafe-assignment": 0,
      "@typescript-eslint/no-unsafe-call": 0,
      "@typescript-eslint/no-unsafe-member-access": 0,
      "@typescript-eslint/no-unsafe-return": 0,
      "@typescript-eslint/prefer-promise-reject-errors": 0,
    },
  },
  {
    ignores: ["web/.svelte-kit", "web/build", "electron/out", "electron/build"],
  },
];
