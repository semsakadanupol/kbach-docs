# Kbach docs

The official Kbach documentation: a Next.js app
styled with Kbach itself (set up the way the docs tell readers to:
`@kbach/react/postcss` in `postcss.config.mjs`, the markers in
`src/app/globals.css`, the theme in `kbach.config.js`).

Live at **https://kbach.vercel.app**: every push to `main` publishes it. Kbach itself
is [semsakadanupol/kbach](https://github.com/semsakadanupol/kbach); this site
uses its packages from npm.

```bash
npm install
npm run dev       # http://localhost:3000, live as you edit
npm run build     # the whole site as plain files, in out/
npm run start     # out/ at http://localhost:3000, as a static host serves it
npm run test:e2e  # build, then every end-to-end check
```

Page text is in `content/`. [AGENTS.md](AGENTS.md)
says where everything else is, and what to edit to change it.
