# Aaron DuChateau — portfolio

Personal portfolio site for [Aaron DuChateau](https://aaronduchateau.github.io/).

More documentation for this repository is coming soon.

## Intent

This project is built as a **unique portfolio experience**: a fast, responsive, client-side design system with ongoing revisions aimed at something that feels personal and intentional—not a stock template. Details and deeper write-ups will follow.

## Copyright and license

**This is not open source.**

© Aaron DuChateau. All rights reserved.

The site, source, design system, copy, and media in this repository are copyrighted. You may not use, copy, modify, redistribute, or reuse any of it without the **express written consent** of Aaron DuChateau.

See [`LICENSE`](LICENSE) for the full terms. The code may live in a public repository for hosting and visibility; that does **not** mean the work is free to take or adapt.

## Local development

Use **Node.js 18.17+** or **20+** (see `.nvmrc`). With [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install
nvm use
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Static export (GitHub Pages shape):

```bash
npm run build
npm run preview:static
```

`npm run build` writes a static site under `out/`. Deploy is via GitHub Actions to [aaronduchateau.github.io](https://aaronduchateau.github.io/).

## Status

This is a **work in progress** and should currently be considered **beta**. Expect changes, rough edges, and revisions as the experience continues to evolve.
