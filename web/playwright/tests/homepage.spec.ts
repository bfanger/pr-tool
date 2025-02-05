import { test, expect } from "@playwright/test";

test("homepage", async ({ page }) => {
  const response = await page.goto("http://localhost:5173/", {
    waitUntil: "networkidle",
  });
  expect(response?.status()).toBe(200);

  await page.getByRole("link", { name: "Continue with web" }).click();
  await expect(
    page.getByRole("heading", { name: "Add an account" }),
  ).toBeVisible();
  await expect(page.locator(".layout")).toHaveScreenshot();
});
