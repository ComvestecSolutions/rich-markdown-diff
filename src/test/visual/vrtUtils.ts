import * as fs from "fs";
import * as path from "path";
import type { MarkdownDiffProvider as ProviderType } from "../../markdownDiff";
const { MarkdownDiffProvider } = require("../../../out/markdownDiff");

export async function generateVRTHtml(
  provider: ProviderType,
  oldMarkdown: string,
  newMarkdown: string,
  options: { inline?: boolean; theme?: "light" | "dark" } = {}
): Promise<string> {
  const diffHtml = provider.computeDiff(oldMarkdown, newMarkdown);
  
  const mediaDir = path.join(__dirname, "../../../media");
  const katexCss = fs.readFileSync(path.join(mediaDir, "katex/katex.min.css"), "utf8");
  const hljsCss = options.theme === "dark" 
    ? fs.readFileSync(path.join(mediaDir, "highlight/github-dark.min.css"), "utf8")
    : fs.readFileSync(path.join(mediaDir, "highlight/github.min.css"), "utf8");
  
  const translations = {
    "Markdown Diff": "Markdown Diff",
    "Original": "Original",
    "Modified": "Modified",
  };

  // Standard VS Code Theme Variables (Mocks)
  const themeVars = options.theme === "dark" ? `
    --vscode-editor-background: #1e1e1e;
    --vscode-editor-foreground: #d4d4d4;
    --vscode-panel-border: #333333;
    --vscode-textBlockQuote-background: #252526;
    --vscode-textBlockQuote-border: #454545;
    --vscode-button-secondaryBackground: #3a3d41;
    --vscode-button-secondaryForeground: #ffffff;
    --vscode-button-secondaryHoverBackground: #45494e;
    --vscode-scrollbarSlider-background: rgba(121, 121, 121, 0.4);
    --vscode-descriptionForeground: #8b949e;
    --vscode-editor-inactiveSelectionBackground: #3a3d41;
    --vscode-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  ` : `
    --vscode-editor-background: #ffffff;
    --vscode-editor-foreground: #333333;
    --vscode-panel-border: #eeeeee;
    --vscode-textBlockQuote-background: #f3f3f3;
    --vscode-textBlockQuote-border: #cccccc;
    --vscode-button-secondaryBackground: #eeeeee;
    --vscode-button-secondaryForeground: #333333;
    --vscode-button-secondaryHoverBackground: #e5e5e5;
    --vscode-scrollbarSlider-background: rgba(100, 100, 100, 0.4);
    --vscode-descriptionForeground: #707070;
    --vscode-editor-inactiveSelectionBackground: #e5e5e5;
    --vscode-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  `;

  let html = provider.getWebviewContent(
    diffHtml,
    "data:text/css;base64," + Buffer.from(katexCss).toString("base64"),
    "", // Mermaid handle separately
    "data:text/css;base64," + Buffer.from(hljsCss).toString("base64"),
    "data:text/css;base64," + Buffer.from(hljsCss).toString("base64"),
    "Original",
    "Modified",
    "*",
    translations
  );

  // Inject Theme Variables
  html = html.replace(":root {", `:root { ${themeVars}`);

  // Inject Layout Overrides for Full Page VRT
  const layoutOverrides = `
    <style>
    /* Full Page VRT Fix: Force all containers to expand to content height */
    html, body {
        height: auto !important;
        min-height: 100% !important;
        overflow: visible !important;
    }
    body {
        display: block !important;
    }
    .header {
        display: flex !important;
        height: 30px !important;
        width: 100% !important;
    }
    .container {
        display: flex !important;
        flex-direction: row !important;
        height: auto !important;
        min-height: auto !important;
        overflow: visible !important;
        width: 100% !important;
    }
    .pane {
        height: auto !important;
        min-height: auto !important;
        overflow: visible !important;
        flex: 1 !important;
        border-right: 1px solid var(--vscode-panel-border) !important;
    }
    body.inline-mode .container {
        flex-direction: column !important;
    }
    body.inline-mode .pane {
        border-right: none !important;
    }
    /* Hide toolbar for VRT to reduce noise */
    .toolbar {
        display: none !important;
    }
    </style>
  `;

  // Insert overrides at the end of <head>
  html = html.replace("</head>", `${layoutOverrides}</head>`);

  // Remove CSP for testing environment
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, "");

  // Inject Mermaid script locally
  const mermaidJs = fs.readFileSync(path.join(mediaDir, "mermaid/mermaid.min.js"), "utf8");
  html = html.replace(/<script[^>]*src="[^"]*mermaid.min.js"[^>]*><\/script>/, 
    `<script>${mermaidJs}</script>`);

  // Force inline mode if requested
  if (options.inline) {
    html = html.replace("<body", '<body class="inline-mode"');
  }

  return html;
}
