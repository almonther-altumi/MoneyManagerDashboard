# MoneyManagerDashboard

![Dashboard preview](./assets/preview.png)

A minimal, modern React + Vite single-page dashboard for tracking items and messages.

Badges
- ![Vite](https://img.shields.io/badge/bundler-vite-blue)
- ![React](https://img.shields.io/badge/framework-react-61DAFB)
- ![License](https://img.shields.io/badge/license-MIT-lightgrey)

Quick features
- Lightweight React + Vite app
- Single-page UI with add/edit/delete item flow
- Notification message with auto-clear (2500ms)
- Per-component CSS and simple component structure

Getting started
1. Clone
    git clone <repo-url>
2. Install
    npm install
3. Dev
    npm run dev
4. Build
    npm run build
5. Preview build
    npm run preview

Available scripts
- npm run dev — start Vite dev server
- npm run build — build for production
- npm run preview — preview production build
- npm run lint — run ESLint

Project layout
- src/
  - main.jsx — app entry
  - App.jsx — main state (items, message)
  - components/
     - Notification.jsx
     - Header.jsx
     - Form.jsx
     - Table.jsx
     - Footer.jsx
     - *.css — per-component styles

Architecture notes
- App holds central state and passes props down:
  - Form calls onAdd to push items into App
  - Table receives items via props
  - Notification reads message from App (cleared after 2500ms)
- Keep button types in Form as-is (three submit buttons exist: delete, edit, Add). Confirm UX before changing.

Contributing
- Make small focused commits (component + its .css)
- Preserve default exports and prop names unless updating call sites across src/
- Ask before changing global build config or notification timing

License
MIT
