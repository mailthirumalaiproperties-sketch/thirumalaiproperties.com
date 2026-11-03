// Turns the client build (dist/) into one static HTML file per page so search
// engines and social apps see real content and per-page SEO tags.
// Runs after `vite build` and `vite build --ssr src/entry-server.jsx`.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE_URL = 'https://thirumalaiproperties.com';

const cmsPath = join(ROOT, '.cms', 'content.json');
if (!existsSync(cmsPath)) {
  console.error('Missing .cms/content.json. Run `npm run cms:fetch` first.');
  process.exit(1);
}
const cms = JSON.parse(readFileSync(cmsPath, 'utf8'));
const { render, resolveRoute, buildHead, renderHead, dataKeyFor } = await import(pathToFileURL(join(ROOT, 'dist-ssr', 'entry-server.js')).href);

const template = readFileSync(join(DIST, 'index.html'), 'utf8');
const logo = readdirSync(join(DIST, 'assets')).find((f) => /^logo22-.*\.png$/.test(f));

const site = {
  settings: cms.settings,
  pages: cms.pages,
  categories: cms.categories,
  logo: logo ? `/assets/${logo}` : null,
  defaultOgImage: cms.defaultOgImage || (logo ? `/assets/${logo}` : null),
};

const SUMMARY_FIELDS = ['slug', 'title', 'excerpt', 'cover', 'categorySlug', 'categoryName', 'authorName', 'publishedAt', 'updatedAt', 'readingMinutes'];
const summary = (post) => Object.fromEntries(SUMMARY_FIELDS.map((k) => [k, post[k]]));
const posts = cms.posts;
const summaries = posts.map(summary);

function relatedFor(post) {
  const others = summaries.filter((p) => p.slug !== post.slug);
  return [...others.filter((p) => p.categorySlug && p.categorySlug === post.categorySlug), ...others.filter((p) => p.categorySlug !== post.categorySlug)].slice(0, 3);
}

function write(file, contents) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

// --- Blog data used for client-side navigation --------------------------------
rmSync(join(DIST, 'blog-data'), { recursive: true, force: true });
const indexData = { posts: summaries };
write(join(DIST, 'blog-data', 'index.json'), JSON.stringify(indexData));
const postData = {};
for (const post of posts) {
  postData[post.slug] = { post, related: relatedFor(post) };
  write(join(DIST, 'blog-data', 'posts', `${post.slug}.json`), JSON.stringify(postData[post.slug]));
}

// --- Pages ------------------------------------------------------------------
const usedCategories = cms.categories.filter((c) => posts.some((p) => p.categorySlug === c.slug));
const paths = [
  ...Object.values(cms.pages).map((p) => p.path),
  ...usedCategories.map((c) => `/blog/category/${c.slug}/`),
  ...posts.map((p) => `/blog/${p.slug}/`),
];

const jsonForScript = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

function renderPage(path) {
  const route = resolveRoute(path);
  const routeKey = dataKeyFor(route);
  const routeData = routeKey === 'index' ? indexData : routeKey ? postData[route.slug] ?? { notFound: true } : null;
  const initial = { site, routeKey, routeData };
  const blog = route.type === 'blog-post' ? { post: routeData?.post } : { category: cms.categories.find((c) => c.slug === route.slug) };
  const head = renderHead(buildHead(route, site, blog));
  return template
    .replace(/<!--app-head:start-->[\s\S]*?<!--app-head:end-->/, head)
    .replace('<!--app-html-->', render(path, initial))
    .replace('<!--app-data-->', `<script>window.__INITIAL_DATA__=${jsonForScript(initial)}</script>`);
}

for (const path of paths) {
  write(join(DIST, path, 'index.html'), renderPage(path));
}
// GitHub Pages serves 404.html for unknown URLs; the app then shows its "not found" page.
write(join(DIST, '404.html'), renderPage('/404/'));

// --- sitemap.xml and robots.txt ---------------------------------------------
const today = new Date().toISOString().slice(0, 10);
const urls = [];
for (const p of Object.values(cms.pages)) if (!p.noindex) urls.push({ loc: p.path, lastmod: p.path === '/blog/' ? summaries[0]?.updatedAt : null });
for (const c of usedCategories) urls.push({ loc: `/blog/category/${c.slug}/` });
for (const p of posts) if (!p.noindex && !p.canonicalUrl) urls.push({ loc: `/blog/${p.slug}/`, lastmod: p.updatedAt });
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u.loc}</loc><lastmod>${(u.lastmod || today).slice(0, 10)}</lastmod></url>`).join('\n')}
</urlset>
`;
write(join(DIST, 'sitemap.xml'), sitemap);
write(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Pre-rendered ${paths.length} pages + 404.html; sitemap has ${urls.length} URLs.`);
