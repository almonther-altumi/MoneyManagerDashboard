# Copilot instructions — anyBro (booksSaver)

Short guidance for AI coding agents working on this repository.

1) Quick context
- Minimal React + Vite single-page app. See [README.md](README.md) and [vite.config.js](vite.config.js).
- App entry: [src/main.jsx](src/main.jsx) mounts `App` ([src/App.jsx](src/App.jsx)). No backend API is present in the repo.

2) High-level architecture & data flows
- `App` (src/App.jsx) holds the main state: `items` (array) and `message` (string).
- Children: `Notification`, `Header`, `Form`, `Table`, `Footer` (all in `src/components`).
- Data flow: `Form` calls the `onAdd` prop to push a new item into `App`'s `items`; `Table` receives `items` as a prop. `Notification` reads `message` from `App` (set with a timeout in `App`).

3) Build / dev / lint workflows (actual commands)
- Start dev server: `npm run dev` (runs `vite`).
- Build production: `npm run build`.
- Preview built output: `npm run preview`.
- Lint project: `npm run lint` (runs `eslint .`).

4) Project conventions and patterns (discoverable)
- File types: React components use `.jsx` files under `src/`.
- Per-component CSS: component styles live alongside components in `src/components` (e.g., `src/components/Form.jsx` and `src/components/form.css`).
- Default exports: components are exported as default and imported by filename (see `App.jsx`).
- Props/callbacks: callbacks use names like `onAdd` (see `src/components/Form.jsx`). Prefer preserving prop names when refactoring.

5) Notable implementation details / gotchas
- UI behavior: `App.jsx` sets `message` and clears it with `setTimeout` (2500ms) — keep this timing in mind when altering Notification behavior.
- Form semantics: `src/components/Form.jsx` currently contains three `<button type="submit">` elements (labels: delete, edit, Add). These all trigger the form submit handler. Do not change button types or labels without confirming intended UX with the repo owner.
- Naming inconsistency: Some component filenames are lowercase (e.g., `header.jsx`, `form.css`) while JSX component names are PascalCase; follow existing filename style for new files and mirror surrounding patterns.

6) Where to look for examples
- Component layout and state lifting: [src/App.jsx](src/App.jsx)
- Form input handling: [src/components/Form.jsx](src/components/Form.jsx)
- Dev scripts and dependencies: [package.json](package.json)

7) Safe-change rules for AI agents (actionable constraints)
- Avoid changing global build config (`vite.config.js`) unless requested.
- Preserve component exports/import signatures unless updating all call sites.
- For UI or semantics changes (forms, buttons, message timeouts) ask the user before altering behavior.

8) Pull request & commit guidance
- Make small, focused commits that change only related files (component + its .css).
- When refactoring props, update all imports/usages across `src/` in the same PR.

If anything here is unclear or you want extra examples (tests, CI, or preferred code-style rules), tell me which area to expand.
