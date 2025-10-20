# MomSure Mobile Web App

MomSure is a mobile-first web application that helps caregivers track a baby's daily health routines such as breastfeeding, weight, urine, and stool logs. The app is built with React and Vite, styled with Tailwind CSS/DaisyUI, and communicates with the MomSure API for authentication and data storage.

## Features

- **Guided onboarding** with login/register carousel in the home view.
- **Multi-baby support**: fetches babies linked to the logged-in user and lets you switch quickly.
- **Breastfeeding tracker**: timer-based session logging in the Save page plus historical summaries.
- **Health tracking**: dedicated pages for weight, urine, stool, posture guidance, knowledge articles, and more.
- **Real-time metrics footer** showing visitor/online counts via REST polling and optional WebSocket updates.
- **SweetAlert2 dialogs** for streamlined data entry (login, register, add baby, log counts).

## Tech Stack

- **Frontend**: React 19, Vite 7, React Router 7, Tailwind CSS 4 + DaisyUI, Framer Motion, Recharts.
- **Data & Auth**: Axios, SweetAlert2, JWT handling via `jwt-decode`, cookies via `js-cookie`.
- **Tooling**: ESLint 9, Vite dev server with proxy, Vercel deployment (via `vercel.json`).

## Project Structure

```
src/
├─ assets/                # Static images and icons used by components/pages
├─ components/            # Reusable UI (LoginCarousel, Footer, BabyTable, etc.)
├─ context/               # AuthContext with login/logout & token management
├─ hooks/                 # Custom hooks (e.g., useRealtimeMetrics)
├─ layouts/               # Shared layout wrappers (MainLayout)
├─ pages/                 # Route-level views (Home, Save, BabyHealth, etc.)
├─ router/                # React Router configuration
├─ services/              # API clients (AuthService, BabyService, TokenService, ...)
└─ utils/                 # SweetAlert helpers, formatters
```

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20 LTS recommended)
- npm 9+ (or compatible package manager)

### Installation

```bash
git clone <repo-url>
cd mobile-app
npm install
```

### Environment Variables

Create a `.env` (or `.env.local`) at the project root. Common keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BASE_URL` | optional | Base URL for Axios. Leave empty on Vercel so requests go through rewrites. |
| `VITE_AUTH_API` | required | Path to the auth API (e.g. `/api/v1/auth`). |
| `VITE_BABY_API` | required | Path to the baby API (e.g. `/api/v1/baby`). |
| `VITE_METRICS_API_BASE` | optional | Metrics REST endpoint base (default `/api/v1/metrics`). |
| `VITE_WS_URL` | optional | WebSocket endpoint for live visitor metrics. |

The dev proxy in `vite.config.js` maps `/api` to `https://mom-sure-api.onrender.com`, so the defaults in `.env` typically look like:

```
VITE_BASE_URL=https://mom-sure-api.onrender.com
VITE_AUTH_API=/api/v1/auth
VITE_BABY_API=/api/v1/baby
```

### Run Locally

```bash
npm run dev
# open http://localhost:5173
```

### Build & Preview

```bash
npm run build
npm run preview
```

## Deployment (Vercel)

- `vercel.json` configures the SPA rewrites and `/api` proxy to the MomSure backend, preventing CORS issues when saving data.
- In the Vercel dashboard set the environment variables listed above. When deploying, leave `VITE_BASE_URL` blank to rely on the relative `/api` path and the Vercel rewrite.
- Build command: `npm run build`
- Output directory: `dist`
- After deployment, confirm that actions like saving a feeding session hit `/api/v1/...` on your Vercel domain without CORS errors.

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR and API proxy. |
| `npm run build` | Build production bundle into `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint on the codebase. |

## Contribution Guidelines

1. Create a feature/fix branch.
2. Ensure lint passes (`npm run lint`).
3. Test the affected flows (e.g., log data via SweetAlert forms, verify metrics footer updates).
4. Open a pull request with details on the changes.

## Troubleshooting

- **CORS errors on Vercel**: ensure the `vercel.json` file is deployed and the env vars do not hardcode an external base URL; relative `/api` requests will be rewritten automatically.
- **Baby list empty after adding**: LoginCarousel re-fetches the list via `BabyService.getAllByUserId`. Verify the backend returns the new baby and that the user has the correct permissions.
- **Real-time metrics missing**: check `VITE_WS_URL` and `VITE_METRICS_API_BASE`. The app falls back to REST polling if WebSocket setup fails.

---

Feel free to adapt this README as the project evolves. Happy coding!
