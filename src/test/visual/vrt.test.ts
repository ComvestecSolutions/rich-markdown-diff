import { test, expect } from "@playwright/test";
import type { MarkdownDiffProvider as ProviderType } from "../../markdownDiff";
const { MarkdownDiffProvider } = require("../../../out/markdownDiff");
import { generateVRTHtml } from "./vrtUtils";
import * as fs from "fs";
import * as path from "path";

const FIXTURES_DIR = path.join(__dirname, "../../../fixtures");

test.describe("Visual Regression Tests", () => {
  let provider: ProviderType;

  test.beforeAll(async () => {
    provider = new MarkdownDiffProvider();
    await provider.waitForReady();
  });

  test.beforeEach(async ({ page }) => {
    // Increase viewport height to capture more content for long documents
    await page.setViewportSize({ width: 1280, height: 2500 });
  });

  const cases = [
    { name: "comprehensive", v1: "comprehensive_v1.md", v2: "comprehensive_v2.md" },
  ];

  for (const c of cases) {
    test(`Visual Diff: ${c.name} - Split Light`, async ({ page }) => {
      const v1 = fs.readFileSync(path.join(FIXTURES_DIR, c.v1), "utf-8");
      const v2 = fs.readFileSync(path.join(FIXTURES_DIR, c.v2), "utf-8");
      
      const html = await generateVRTHtml(provider, v1, v2, { theme: "light", inline: false });
      await page.setContent(html, { waitUntil: "networkidle" });
      
      // Wait for Mermaid if present
      const mermaidCount = await page.locator(".mermaid").count();
      if (mermaidCount > 0) {
        try {
          // Wait for mermaid to initialize and draw SVG
          await page.waitForSelector(".mermaid svg", { timeout: 5000 });
        } catch (e) {
          console.warn("Mermaid SVG not found within timeout, might be a render issue or no diagram in this case.");
        }
      }

      // Wait for fonts/math
      const katexCount = await page.locator(".katex").count();
      if (katexCount > 0) {
        await page.waitForSelector(".katex", { state: "visible" });
      }

      await expect(page).toHaveScreenshot(`${c.name}-split-light.png`, { fullPage: true });
    });

    test(`Visual Diff: ${c.name} - Split Dark`, async ({ page }) => {
      const v1 = fs.readFileSync(path.join(FIXTURES_DIR, c.v1), "utf-8");
      const v2 = fs.readFileSync(path.join(FIXTURES_DIR, c.v2), "utf-8");
      
      const html = await generateVRTHtml(provider, v1, v2, { theme: "dark", inline: false });
      await page.setContent(html, { waitUntil: "networkidle" });
      
      const mermaidCount = await page.locator(".mermaid").count();
      if (mermaidCount > 0) {
        try {
          await page.waitForSelector(".mermaid svg", { timeout: 5000 });
        } catch (e) {}
      }

      await expect(page).toHaveScreenshot(`${c.name}-split-dark.png`, { fullPage: true });
    });

    test(`Visual Diff: ${c.name} - Inline Light`, async ({ page }) => {
      const v1 = fs.readFileSync(path.join(FIXTURES_DIR, c.v1), "utf-8");
      const v2 = fs.readFileSync(path.join(FIXTURES_DIR, c.v2), "utf-8");
      
      const html = await generateVRTHtml(provider, v1, v2, { theme: "light", inline: true });
      await page.setContent(html, { waitUntil: "networkidle" });
      
      const mermaidCount = await page.locator(".mermaid").count();
      if (mermaidCount > 0) {
        try {
          await page.waitForSelector(".mermaid svg", { timeout: 5000 });
        } catch (e) {}
      }

      await expect(page).toHaveScreenshot(`${c.name}-inline-light.png`, { fullPage: true });
    });
  }
});
