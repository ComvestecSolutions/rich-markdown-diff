# Development Guide - Rich Markdown Diff

This document is for developers who want to contribute to the extension or understand its internals.

## Technical Architecture

- `src/extension.ts`: Main entry point. Registers commands and the Custom Editor Provider.
- `src/markdownDiff.ts`: Core logic for Markdown parsing (using `markdown-it`) and diffing (using `htmldiff-js`).
- `images/`: Brand assets and screenshots.

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Compile the code:**
    ```bash
    npm run compile
    ```
4.  **Run/Debug:**
    - Open this project in VS Code.
    - Press `F5` to launch an "Extension Development Host" instance.

## Testing

- **Unit Tests**: `npm run test:unit` (Tests the diff logic in isolation).
- **Integration Tests**: `npm test` (Runs tests within a VS Code instance).
- **Visual Regression Tests (VRT)**: 
    - `npm run test:visual:docker`: Run VRT inside a Docker container (recommended for environment consistency).
    - `npm run test:visual:update`: Update baseline screenshots (run this inside Docker).
    - `npm run test:visual`: Run VRT locally (may have anti-aliasing differences compared to CI).

> [!IMPORTANT]
> To ensure consistency between local development and CI, always use the Docker-based commands for generating and verifying baseline screenshots.

## Quality Control

- **Linting**: `npm run lint` (Checks for style and common errors using ESLint 9).
- **Auto-fix**: `npx eslint src --fix`.

## License

This project is licensed under the MIT License.
