# Thirumalai Properties website

Source for **https://thirumalaiproperties.com**: React 19 + Vite + Tailwind CSS, pre-rendered to static HTML and hosted on GitHub Pages.

Blog articles and SEO settings are managed by the client in the admin panel at **https://blog.thirumalaiproperties.com** (repository [`mailthirumalaiproperties-sketch/Blog.thirumalaiproperties`](https://github.com/mailthirumalaiproperties-sketch/Blog.thirumalaiproperties)). This site pulls that content at build time. The admin, the CMS API and **all keys and tokens** are documented in that repository's README.

> **This repository is public.** Never commit passwords, tokens or secret values. This repo needs no secrets at all (see [Configuration](#configuration-keys-and-settings)).

## How it fits together

```
Admin panel (blog.thirumalaiproperties.com)
      │  saves articles, images, page SEO
      ▼
CMS API (Cloudflare Worker + D1 database)
      │  on publish: starts this repo's "Build and deploy website" workflow
      ▼
GitHub Actions (.github/workflows/deploy.yml)
      1. scripts/fetch-cms.mjs  – downloads published content + images/PDFs (.cms/, public/blog-media/)
                                   and sanitizes article HTML (only YouTube embeds allowed)
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
| `/blog-media/<file>` | Article images and PDF downloads (copied from the CMS at build time) |

Page titles, descriptions, social images and Google structured data come from the CMS (`src/seo/head.js`). The live site never calls the CMS API from the browser: everything is in the static files.

## Local development

```bash
npm install
npm run dev          # http://localhost:5173 – pages work, blog shows no articles

# Full production-like build (default SEO, empty blog):
npm run build

# Build with real CMS content (read-only; the public endpoint needs no login):
CMS_API_URL=https://thirumalai-cms-api.thirumalai-cms-api.workers.dev npm run build
# PowerShell: $env:CMS_API_URL="https://thirumalai-cms-api.thirumalai-cms-api.workers.dev"; npm run build
```

`npm run build` always runs `scripts/fetch-cms.mjs` first. Without `CMS_API_URL` it uses built-in default SEO (`FALLBACK` in that script) and no articles. `npm run lint` checks the code.

## Deployment

The "Build and deploy website" workflow (`.github/workflows/deploy.yml`) builds and publishes the site. It runs:

| Trigger | When |
|---|---|
| Push to `main` | Code changes |
| `workflow_dispatch` | Started by the CMS (using its `GITHUB_TOKEN`) whenever something visible changes: publishing, editing, unpublishing or deleting a live article, category changes, page SEO, site settings, and the admin's "Update website now" button. Also by hand from the Actions tab → **Run workflow**. |
| Schedule | Every night at 03:00 IST (`30 21 * * *` UTC), a safety net if the token ever stops working |

A run takes about 2 minutes. If the CMS API can't be reached, the build **fails** and the live site stays on its previous version.

Repository settings this relies on:

- **Settings → Pages:** Source **GitHub Actions**; custom domain `thirumalaiproperties.com`; **Enforce HTTPS** on. (Until 2026-11-03 the source was "Deploy from a branch: gh-pages"; see [Rollback](#rollback).)
- **Settings → Secrets and variables → Actions → Variables:** `CMS_API_URL`.
- **Settings → Environments → github-pages:** created by GitHub, with custom deployment-branch rules. If a deploy is ever refused with an environment protection error, make sure `main` is allowed there.

## Configuration, keys and settings

| Name | Where | Purpose |
|---|---|---|
| `CMS_API_URL` | Actions **variable** (not a secret) | Where the build downloads published content. Currently `https://thirumalai-cms-api.thirumalai-cms-api.workers.dev`. **If it's missing, the build succeeds with an empty blog and default SEO**, which would remove all articles from the live site. Keep it set. |
| EmailJS service ID, template ID, public key | Hard-coded in `src/components/Contact.jsx` | The contact form sends email through EmailJS. These are public browser keys by design (they're visible in the live site's JavaScript). To change the EmailJS account or template, edit that file. If the EmailJS plan offers a domain allow-list, restrict it to thirumalaiproperties.com. `.env.example` is left over from an older setup and is not used. |
| `CNAME` (`public/CNAME`) | Repository | Contains `thirumalaiproperties.com`. Harmless with Actions deploys (the custom domain is set in Pages settings). |

That's all: this repository has **no secrets**. The token that lets the CMS start this workflow (`GITHUB_TOKEN`, a fine-grained token with "Actions: Read and write" on this repo only) is stored in Cloudflare, not here. How to create, rotate or revoke it is in the [CMS README](https://github.com/mailthirumalaiproperties-sketch/Blog.thirumalaiproperties#github_token-worker-secret).

## Domain, DNS and HTTPS

The domain is registered and its DNS is hosted at **Hostinger** (nameservers `ns1.dns-parking.com`, `ns2.dns-parking.com`). Records:

| Name | Type | Value | Serves |
|---|---|---|---|
| `@` | A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` | thirumalaiproperties.com (GitHub Pages) |
| `www` | CNAME | `mailthirumalaiproperties-sketch.github.io` | Redirects to thirumalaiproperties.com |
| `blog` | CNAME | `mailthirumalaiproperties-sketch.github.io` | Admin panel (Blog repo's Pages) |
| `_github-pages-challenge-mailthirumalaiproperties-sketch` | TXT | (verification code from GitHub) | Proves the GitHub account owns the domain. Don't delete it. |

- HTTPS certificates come from Let's Encrypt through GitHub Pages and **renew automatically**, as long as DNS points straight at GitHub.
- **Don't put the domain behind Cloudflare's proxy** (orange cloud) or change nameservers without a plan. In 2026 that blocked GitHub's certificate renewal and the site's certificate expired. Full history and diagnosis: [`THIRUMALAI_DOMAIN_SSL_AUDIT.md`](THIRUMALAI_DOMAIN_SSL_AUDIT.md).
- After changing a Pages custom domain, **redeploy** (run the workflow). Otherwise GitHub's CDN may keep showing a cached "Site not found" page.

## Rollback

| Situation | What to do |
|---|---|
| A code change broke the site | `git revert` the commit on `main` and push. Or re-run an earlier successful "Build and deploy website" run from the Actions tab: it uses that run's code with current CMS content. |
| The new build system itself is the problem | **Settings → Pages → Source → Deploy from a branch → `gh-pages` / `(root)` → Save.** The `gh-pages` branch still holds the last site from before the CMS (commit `a68ee84`, no blog). Keep that branch; don't delete it. Switch back to **GitHub Actions** afterwards. |
| Bad article content | Fix or unpublish it in the admin; the site rebuilds automatically. |

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Live blog suddenly empty | `CMS_API_URL` variable was removed or emptied. Restore it, then **Run workflow**. |
| Build fails with "CMS fetch failed" | The CMS API is down or the URL is wrong. Check `<CMS_API_URL>/api/health`. The live site keeps its previous version meanwhile. |
| Published article not on the site | Look at the Actions tab. No new run means the CMS's `GITHUB_TOKEN` is missing or revoked (the admin dashboard shows "Not connected"). The nightly build will still pick it up. |
| "Site not found" or certificate warning | DNS no longer points directly at GitHub (check the table above), or the custom domain was changed without a redeploy. |
| Contact form not sending | EmailJS quota or keys (`src/components/Contact.jsx`); check the EmailJS dashboard. |

## Code map

```
src/App.jsx              Chooses the page for the current URL
src/router.jsx           Tiny history router (Link, navigate)
src/routes.js            URL ↔ page table
src/blog/                Blog pages, cards, data loading
src/seo/head.js          <title>, meta, Open Graph, JSON-LD for every route
src/entry-client.jsx     Browser entry (hydrates pre-rendered HTML)
src/entry-server.jsx     Build-time renderer used by scripts/prerender.mjs
src/components/          Site sections (Navbar, Hero, Properties, Contact, Footer, …)
scripts/fetch-cms.mjs    Downloads + sanitizes CMS content before the build
scripts/prerender.mjs    Writes one HTML file per page, sitemap.xml, robots.txt, 404.html
```
