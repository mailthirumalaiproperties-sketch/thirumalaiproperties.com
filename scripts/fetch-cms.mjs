// Downloads published blog content, page SEO and settings from the CMS API
// (blog.thirumalaiproperties.com admin → Cloudflare Worker) before the build.
//
//   CMS_API_URL=https://<worker>.workers.dev node scripts/fetch-cms.mjs
//
// Writes .cms/content.json and public/blog-media/*. Without CMS_API_URL the site
// builds with default page SEO and an empty blog.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sanitizeHtml from 'sanitize-html';

const ROOT = join(import.meta.dirname, '..');
const API = (process.env.CMS_API_URL || '').replace(/\/$/, '');
const MEDIA_DIR = join(ROOT, 'public', 'blog-media');
const EXT = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'application/pdf': 'pdf' };
const WORDS_PER_MINUTE = 200;

// Mirrors the CMS defaults (worker/migrations/0002_defaults.sql) for builds without the CMS.
const FALLBACK = {
  settings: {
    organization: {
      name: 'Thirumalai Properties', phone: '+91 95144 76555', whatsapp: '919514476555', email: 'mail.thirumalaiproperties@gmail.com',
      streetAddress: 'No. 17, Sakthi Nagar Main Road, Saram', locality: 'Puducherry', postalCode: '605013', region: 'Puducherry', country: 'IN',
      instagram: 'https://www.instagram.com/thirumalai_properties', youtube: 'https://www.youtube.com/@ThirumalaiProperties',
    },
    seo_defaults: { titleSuffix: ' | Thirumalai Properties', defaultDescription: 'Trusted real estate agency in Pondicherry (Puducherry): plots, land and villas for sale, document registration and NRI property management.' },
  },
  pages: {
    home: { label: 'Home', path: '/', title: 'Thirumalai Properties | Real Estate in Pondicherry & Puducherry', description: 'Thirumalai Properties - Trusted real estate agency in Pondicherry (Puducherry). Find premium plots, lands, and villas for sale with expert registration & NRI services.' },
    properties: { label: 'Properties', path: '/properties/', title: 'Plots, Land & Villas for Sale in Pondicherry', description: 'Browse residential plots, agricultural land, villas and commercial buildings for sale in Pondicherry and Puducherry with Thirumalai Properties.' },
    documents: { label: 'Documents', path: '/documents/', title: 'Property Document Writing & Registration in Pondicherry', description: 'Sale deed drafting, document writing, registration support and patta transfer services in Pondicherry from Thirumalai Properties.' },
    'nri-property': { label: 'NRI Property', path: '/nri-property/', title: 'NRI Property Management in Pondicherry', description: 'Property management for NRIs in Pondicherry: rent collection, maintenance, tax payments, document work and on-the-ground support.' },
    'about-us': { label: 'About Us', path: '/about-us/', title: 'About Thirumalai Properties', description: 'Learn about Thirumalai Properties, a trusted real estate and documentation partner in Pondicherry.' },
    contact: { label: 'Contact', path: '/contact/', title: 'Contact Thirumalai Properties', description: 'Call, WhatsApp or email Thirumalai Properties in Saram, Puducherry for property buying, selling, documentation and NRI services.' },
    blog: { label: 'Blog', path: '/blog/', title: 'Real Estate Blog: Pondicherry Property Guides', description: 'Practical guides on buying land and homes, registering documents, NRI property ownership and the Puducherry real estate market.' },
  },
  categories: [],
  posts: [],
  media: [],
};

/**
 * Rebuilds a YouTube player (from the CMS editor's Video button) with fixed, safe
 * attributes. Returns null for anything that isn't a YouTube embed.
 */
function youtubeEmbedSrc(src) {
  let url;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  if (!['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)) return null;
  const id = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})$/)?.[1];
  if (!id) return null;
  const start = Number.parseInt(url.searchParams.get('start'), 10);
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0${start > 0 ? `&start=${start}` : ''}`;
}

const SANITIZE = {
  allowedTags: ['p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'img', 'hr', 'code', 'pre', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'iframe'],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'width', 'height', 'title', 'loading', 'decoding'],
    iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'loading', 'referrerpolicy'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
  },
  allowedClasses: { div: ['video-embed'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'], iframe: ['https'] },
  allowedIframeHostnames: ['www.youtube-nocookie.com'],
  allowProtocolRelative: false,
  transformTags: {
    h1: 'h2',
    a: (tagName, attribs) => {
      const a = { ...attribs };
      if (a.target === '_blank') a.rel = 'noopener noreferrer';
      else delete a.target;
      return { tagName, attribs: a };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy', decoding: 'async' } }),
    div: (tagName, attribs) => ({ tagName, attribs: 'data-youtube-video' in attribs ? { class: 'video-embed' } : {} }),
    iframe: (tagName, attribs) => {
      const src = youtubeEmbedSrc(attribs.src);
      if (!src) return { tagName, attribs: {} }; // removed by exclusiveFilter
      return {
        tagName,
        attribs: {
          src,
          title: 'YouTube video',
          width: '640',
          height: '360',
          loading: 'lazy',
          allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowfullscreen: 'true',
          referrerpolicy: 'strict-origin-when-cross-origin',
        },
      };
    },
  },
  exclusiveFilter: (frame) => frame.tag === 'iframe' && !frame.attribs.src,
};

const fileSlug = (name) =>
  name
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.json();
}

async function main() {
  let raw;
  if (!API) {
    console.warn('CMS_API_URL is not set: building with default page SEO and no blog posts.');
    raw = FALLBACK;
  } else {
    raw = await getJson(`${API}/api/public/content`);
    console.log(`Fetched ${raw.posts.length} published posts, ${raw.media.length} images/documents from ${API}`);
  }

  // Download images and PDFs referenced by published content.
  rmSync(MEDIA_DIR, { recursive: true, force: true });
  mkdirSync(MEDIA_DIR, { recursive: true });
  const media = {};
  for (const m of raw.media) {
    const ext = EXT[m.mime];
    if (!ext) continue;
    const res = await fetch(`${API}/api/public/media/${m.id}`);
    if (!res.ok) throw new Error(`File ${m.id} returned ${res.status}`);
    // PDFs keep a readable name, e.g. doc_ab12-sample-sale-deed.pdf
    const slug = ext === 'pdf' && m.filename ? fileSlug(m.filename) : '';
    const file = `${m.id}${slug ? `-${slug}` : ''}.${ext}`;
    writeFileSync(join(MEDIA_DIR, file), Buffer.from(await res.arrayBuffer()));
    media[m.id] = { src: `/blog-media/${file}`, width: m.width, height: m.height, alt: m.alt || '', isImage: m.mime.startsWith('image/') };
  }
  const imageMedia = (id) => (id && media[id]?.isImage ? media[id] : null);

  const categories = raw.categories;
  const categoryName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const posts = raw.posts.map((p) => {
    // Point images (src) and PDF links (href) at the copies inside this site.
    const html = sanitizeHtml(p.contentHtml, SANITIZE)
      .replace(/\b(src|href)="[^"]*\/api\/public\/media\/([A-Za-z0-9_-]+)[^"]*"/g, (match, attr, id) => (media[id] ? `${attr}="${media[id].src}"` : match))
      .replace(/<div class="video-embed">\s*<\/div>/g, ''); // a rejected (non-YouTube) embed leaves an empty box
    const words = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).split(/\s+/).filter(Boolean).length;
    const coverMedia = imageMedia(p.coverMediaId);
    const cover = coverMedia ? { src: coverMedia.src, width: coverMedia.width, height: coverMedia.height, alt: p.coverAlt || coverMedia.alt } : null;
    return {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      contentHtml: html,
      cover,
      ogImage: imageMedia(p.ogMediaId)?.src ?? null,
      categorySlug: p.categorySlug || null,
      categoryName: p.categorySlug ? categoryName[p.categorySlug] : null,
      tags: p.tags || [],
      authorName: p.authorName || 'Thirumalai Properties',
      publishedAt: p.publishedAt,
      updatedAt: p.updatedAt,
      readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      canonicalUrl: p.canonicalUrl,
      noindex: p.noindex,
    };
  });

  const pages = Object.fromEntries(
    Object.entries(raw.pages).map(([key, p]) => [key, { ...p, ogImage: imageMedia(p.ogMediaId)?.src ?? null }])
  );
  const defaultOgImage = imageMedia(raw.settings.seo_defaults?.defaultOgMediaId)?.src ?? null;

  mkdirSync(join(ROOT, '.cms'), { recursive: true });
  writeFileSync(
    join(ROOT, '.cms', 'content.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), settings: raw.settings, pages, categories, posts, defaultOgImage }, null, 2)
  );
  console.log(`Wrote .cms/content.json (${posts.length} posts) and ${Object.keys(media).length} files to public/blog-media/`);
}

main().catch((err) => {
  console.error(`CMS fetch failed: ${err.message}`);
  process.exit(1);
});
