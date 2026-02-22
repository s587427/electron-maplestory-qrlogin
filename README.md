![yeti](/src/assets/readme-yeti.png)

# MapleStory QR Login (Gama Play Login)

A desktop app for MapleStory (Gama Play) QR Code login, built with Electron.

## Features

- **QR Code login**: Scan a QR code to sign in to your game account
- **Account list**: Manage logged-in accounts and get OTP codes

## Requirements

- **Node.js 24** (development is tested on this version)
- npm or yarn

## Install & Run

```bash
# Install dependencies
npm install

# Development (Electron + Vite HMR)
npm start

# Package the app
npm run package

# Create installers (.exe, .deb, .zip, etc. by platform)
npm run make
```

## Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm start`       | Run in development mode    |
| `npm run package` | Package into an executable |
| `npm run make`    | Build installers           |
| `npm run lint`    | Run ESLint                 |

## Project Structure

```
src/
├── main.ts           # Electron main process
├── preload.ts        # Preload script (exposes API to renderer)
├── ipcMains.ts       # IPC handlers (QR, sign-out, OTP, open external URL, etc.)
├── frontend/         # React frontend
│   ├── App.tsx       # Root component, routes
│   ├── pages/        # Pages: qrcode-login, account-list, author-info
│   ├── components/   # ToolBar, etc.
│   └── styles/
└── backend/          # Backend services (QR, login, OTP, etc.)
```

## Reference

- [pungin/Beanfun](https://github.com/pungin/Beanfun)
