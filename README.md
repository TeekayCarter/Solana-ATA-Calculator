# Solana ATA Calculator

A client-side web tool that computes the Associated Token Address (ATA) for any Solana wallet and token mint. Supports SPL Token and Token-2022 programs, plus off-curve (PDA) owners. All calculations happen in the browser — no keys or addresses are ever sent to a server.

## Tech stack

- React 19 + Vite 7
- Tailwind CSS v4 + shadcn/ui (Radix primitives)
- `@solana/web3.js` + `@solana/spl-token` for deterministic ATA derivation
- wouter for routing, TanStack Query for state plumbing

## Local development

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:5173 by default.

To build and preview the production bundle locally:

```bash
npm run build
npm run preview
```

## Deploying to Vercel

This folder is self-contained and ready to deploy. Two options:

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Accept the defaults. Vercel will detect Vite from `vercel.json` and serve the built `dist/` directory.

### Option B — Git + Vercel dashboard

1. Push this folder to a new Git repo (GitHub / GitLab / Bitbucket).
2. In the Vercel dashboard, click **Add New → Project** and import the repo.
3. Leave all settings as detected — `vercel.json` already specifies framework, build command, output directory, and SPA rewrites.
4. Click **Deploy**.

Subsequent pushes to the default branch auto-deploy. Pushes to other branches create preview deployments.

## Project structure

```
.
├── public/                 Static assets (favicon, hero image, OG image)
├── src/
│   ├── components/ui/      shadcn/ui primitives
│   ├── hooks/              Reusable React hooks
│   ├── lib/utils.ts        cn() helper
│   ├── pages/              Page components (404)
│   ├── App.tsx             Calculator UI + routing
│   ├── main.tsx            React entry
│   ├── polyfills.ts        Buffer/global polyfill for @solana/web3.js
│   └── index.css           Tailwind + theme tokens
├── index.html              Vite entry HTML
├── vite.config.ts          Vite config (Buffer alias, Solana deps optimized)
├── vercel.json             Vercel framework + SPA rewrites
└── tsconfig.json           TypeScript config
```

## Notes

- `src/polyfills.ts` MUST stay as the first import in `src/main.tsx` — `@solana/spl-token` references `Buffer` at module evaluation time.
- The app is dark-mode-only. The `dark` class on `<html>` in `index.html` activates the shadcn dark tokens defined in `src/index.css`.
- Routing uses wouter at `/` only; everything else falls through to a 404 page. The Vercel rewrite to `/index.html` ensures direct-link refreshes work.
