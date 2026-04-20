/*
 * MIT License
 *
 * Copyright (c) 2026 Rich Markdown Diff Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { MarkdownDiffProvider } from "../../markdownDiff";
import { generateVRTHtml } from "./vrtUtils";

test.describe("Visual Regression Tests", () => {
  let provider: MarkdownDiffProvider;

  test.beforeAll(async () => {
    provider = new MarkdownDiffProvider();
    await provider.waitForReady();
  });

  const cases = [
    { name: "comprehensive_v1", theme: "light", inline: false, suffix: "split-light" },
    { name: "comprehensive_v1", theme: "dark", inline: true, suffix: "inline-dark" },
    { name: "marp_v1", theme: "dark", inline: false, suffix: "split-dark" },
    { name: "marp_v1", theme: "light", inline: true, suffix: "inline-light" },
    { name: "marp_v3", theme: "light", inline: false, suffix: "split-light" },
    { name: "marp_v3", theme: "dark", inline: true, suffix: "inline-dark" }
  ];

  for (const c of cases) {
    test(`Visual Diff: ${c.name} - ${c.suffix}`, async ({ page }) => {
      const filePath = path.join(__dirname, "../../../fixtures", `${c.name}.md`);
      const md = fs.readFileSync(filePath, "utf-8");
      
      const html = await generateVRTHtml(provider, md, md, {
        theme: c.theme as any,
        inline: c.inline,
      });

      await page.setContent(html);

      // wait for some time to make sure that the page is rendered
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot(`${c.name}-${c.suffix}.png`, {
        maxDiffPixelRatio: 0.1,
        fullPage: true,
      });
    });
  }
});
