# Aaron DuChateau — portfolio

Next.js static portfolio (App Router + Tailwind). Content lives in `src/data/content.ts`; imagery uses Unsplash URLs in that file.

## Requirements

Use **Node.js 18.17+** or **20+**. With [nvm](https://github.com/nvm-sh/nvm):

```bash
cd aaron_portfolio_2026
nvm install
nvm use
npm install
```

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Static export for GitHub Pages

- `npm run build` writes `out/index.html` and assets under `out/` (no Node server needed to host).

Preview locally:

```bash
npm run build
npm run preview:static
```

## Deploy on GitHub Pages

Publish the contents of `out/` to your Pages branch (e.g. for [aaronduchateau.github.io](https://aaronduchateau.github.io/)).

## Deploy on Vercel

Import the repo in [Vercel](https://vercel.com/new) with default Next.js settings, or:

```bash
cd aaron_portfolio_2026
npx vercel
```

## Project structure

- `src/app/page.tsx` — page layout
- `src/data/content.ts` — copy and image URLs
- `src/components/*` — sections
