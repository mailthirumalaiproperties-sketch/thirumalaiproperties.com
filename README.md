# Thirumalai Properties website

Source for **https://thirumalaiproperties.com**: React 19 + Vite + Tailwind CSS, hosted on GitHub Pages.

Blog articles and SEO settings are managed by the client in the admin panel at **https://blog.thirumalaiproperties.com** (repository `mailthirumalaiproperties-sketch/Blog.thirumalaiproperties`). This site pulls that content at build time.

## How it fits together

```
Admin panel (blog.thirumalaiproperties.com)
      │  saves articles, images, page SEO
      ▼
CMS API (Cloudflare Worker + D1 database)
      │  on publish: starts this repo's "Build and deploy website" workflow
      ▼
GitHub Actions (.github/workflows/deploy.yml)
      1. scripts/fetch-cms.mjs  – downloads published content + images (.cms/, public/blog-media/)
      2. vite build             – client bundle (dist/)
      3. vite build --ssr       – server bundle used only at build time (dist-ssr/)
      4. scripts/prerender.mjs  – one static HTML file per page with SEO tags,
                                   blog JSON for in-site navigation, sitemap.xml, robots.txt, 404.html
      ▼
GitHub Pages (thirumalaiproperties.com)
```

Every page has its own URL and pre-rendered HTML:

| URL | Page |
|---|---|
| `/` | Home |
| `/properties/`, `/documents/`, `/nri-property/`, `/about-us/`, `/contact/` | Main pages |
| `/blog/` | Blog home |
| `/blog/category/<slug>/` | Blog topic |
| `/blog/<slug>/` | Article |

Page titles, descriptions, social images and Google structured data come from the CMS (`src/seo/head.js`).

## Local development

```bash
npm install
npm run dev          # http://localhost:5173 – pages work, blog shows no articles

# Full production-like build (default SEO, empty blog):
npm run build

# Build with real CMS content:
CMS_API_URL=https://<cms-worker>.workers.dev npm run build      # PowerShell: $env:CMS_API_URL="…"; npm run build
```

`npm run build` always runs `scripts/fetch-cms.mjs` first. Without `CMS_API_URL` it uses built-in default SEO and no articles.

## Deployment

Pushing to `main` deploys automatically. Settings (repository → Settings):

- **Pages → Source:** GitHub Actions. Custom domain `thirumalaiproperties.com`, Enforce HTTPS on.
- **Secrets and variables → Actions → Variables:** `CMS_API_URL` = the CMS Worker URL.

Rollback: re-run an earlier successful "Build and deploy website" run, or temporarily switch **Pages → Source** back to "Deploy from a branch: gh-pages" (the last pre-CMS build is still on that branch).

## Code map

```
src/App.jsx              Chooses the page for the current URL
src/router.jsx           Tiny history router (Link, navigate)
src/routes.js            URL ↔ page table
src/blog/                Blog pages, cards, data loading
src/seo/head.js          <title>, meta, Open Graph, JSON-LD for every route
src/entry-client.jsx     Browser entry (hydrates pre-rendered HTML)
src/entry-server.jsx     Build-time renderer used by scripts/prerender.mjs
src/components/          Existing site sections (Navbar, Hero, Properties, …)
```
