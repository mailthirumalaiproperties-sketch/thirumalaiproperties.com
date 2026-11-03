import { SITE_URL } from '../routes.js';

// Builds the <head> metadata for any route. Used at build time (pre-rendering,
// see scripts/prerender.mjs) and in the browser when navigating between pages.

const absolute = (src) => (src ? (src.startsWith('http') ? src : `${SITE_URL}${src}`) : null);

function organizationSchema(org, logo) {
  if (!org?.name) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${SITE_URL}/#organization`,
    name: org.name,
    url: `${SITE_URL}/`,
    logo,
    image: logo,
    telephone: org.phone || undefined,
    email: org.email || undefined,
    address: org.streetAddress
      ? {
          '@type': 'PostalAddress',
          streetAddress: org.streetAddress,
          addressLocality: org.locality,
          postalCode: org.postalCode,
          addressRegion: org.region,
          addressCountry: org.country || 'IN',
        }
      : undefined,
    sameAs: [org.instagram, org.youtube, org.facebook].filter(Boolean),
  };
}

function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE_URL}${path}` })),
  };
}

/**
 * @param route  result of resolveRoute()
 * @param site   { settings, pages, categories, logo }
 * @param blog   route data: { post } for posts, { category } for categories
 */
export function buildHead(route, site, blog = {}) {
  const defaults = site.settings?.seo_defaults || {};
  const suffix = defaults.titleSuffix ?? ' | Thirumalai Properties';
  const defaultImage = site.defaultOgImage || null;
  const org = site.settings?.organization;
  const head = {
    title: 'Thirumalai Properties | Real Estate in Pondicherry & Puducherry',
    description: defaults.defaultDescription || '',
    canonical: null,
    robots: 'index, follow',
    ogType: 'website',
    image: defaultImage,
    jsonLd: [],
    article: null,
    googleVerification: defaults.googleVerification || '',
  };

  if (route.type === 'page' || route.type === 'blog-index') {
    const page = site.pages?.[route.key];
    if (page) {
      head.title = page.title || head.title;
      head.description = page.description || head.description;
      head.canonical = `${SITE_URL}${page.path}`;
      head.robots = page.noindex ? 'noindex, follow' : head.robots;
      head.image = page.ogImage || head.image;
    }
    if (route.key === 'home') {
      head.jsonLd.push(organizationSchema(org, absolute(site.logo)));
      head.jsonLd.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: org?.name || 'Thirumalai Properties', url: `${SITE_URL}/` });
    } else if (page) {
      head.jsonLd.push(breadcrumbs([['Home', '/'], [page.label, page.path]]));
    }
    if (route.type === 'blog-index') {
      head.jsonLd.push({ '@context': 'https://schema.org', '@type': 'Blog', name: page?.title || 'Blog', url: `${SITE_URL}/blog/`, publisher: { '@id': `${SITE_URL}/#organization` } });
    }
  } else if (route.type === 'blog-category' && blog.category) {
    const c = blog.category;
    head.title = c.seoTitle || `${c.name}${suffix}`;
    head.description = c.seoDescription || c.description || head.description;
    head.canonical = `${SITE_URL}/blog/category/${c.slug}/`;
    head.jsonLd.push(breadcrumbs([['Home', '/'], ['Blog', '/blog/'], [c.name, `/blog/category/${c.slug}/`]]));
  } else if (route.type === 'blog-post' && blog.post) {
    const p = blog.post;
    const url = `${SITE_URL}/blog/${p.slug}/`;
    head.title = p.seoTitle || `${p.title}${suffix}`;
    head.description = p.seoDescription || p.excerpt || head.description;
    head.canonical = p.canonicalUrl || url;
    head.robots = p.noindex ? 'noindex, follow' : head.robots;
    head.ogType = 'article';
    head.image = p.ogImage || p.cover?.src || head.image;
    head.article = { publishedTime: p.publishedAt, modifiedTime: p.updatedAt, section: p.categoryName };
    head.jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: head.description,
      image: absolute(head.image) || undefined,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
      author: { '@type': 'Person', name: p.authorName },
      publisher: { '@id': `${SITE_URL}/#organization`, '@type': 'Organization', name: org?.name || 'Thirumalai Properties', logo: absolute(site.logo) },
      mainEntityOfPage: url,
      keywords: p.tags?.length ? p.tags.join(', ') : undefined,
    });
    const crumbs = [['Home', '/'], ['Blog', '/blog/']];
    if (p.categorySlug) crumbs.push([p.categoryName, `/blog/category/${p.categorySlug}/`]);
    crumbs.push([p.title, `/blog/${p.slug}/`]);
    head.jsonLd.push(breadcrumbs(crumbs));
  } else {
    head.title = `Page not found${suffix}`;
    head.robots = 'noindex, follow';
  }

  head.image = absolute(head.image);
  head.jsonLd = head.jsonLd.filter(Boolean);
  return head;
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonForScript = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

/** Meta tags as [tag, attributes] pairs, shared by the HTML renderer and applyHead(). */
function metaEntries(head) {
  const m = [
    ['meta', { name: 'description', content: head.description }],
    ['meta', { name: 'robots', content: head.robots }],
    ['meta', { property: 'og:site_name', content: 'Thirumalai Properties' }],
    ['meta', { property: 'og:locale', content: 'en_IN' }],
    ['meta', { property: 'og:type', content: head.ogType }],
    ['meta', { property: 'og:title', content: head.title }],
    ['meta', { property: 'og:description', content: head.description }],
    ['meta', { name: 'twitter:card', content: head.image ? 'summary_large_image' : 'summary' }],
    ['meta', { name: 'twitter:title', content: head.title }],
    ['meta', { name: 'twitter:description', content: head.description }],
  ];
  if (head.canonical) {
    m.push(['link', { rel: 'canonical', href: head.canonical }]);
    m.push(['meta', { property: 'og:url', content: head.canonical }]);
  }
  if (head.image) {
    m.push(['meta', { property: 'og:image', content: head.image }]);
    m.push(['meta', { name: 'twitter:image', content: head.image }]);
  }
  if (head.article?.publishedTime) m.push(['meta', { property: 'article:published_time', content: head.article.publishedTime }]);
  if (head.article?.modifiedTime) m.push(['meta', { property: 'article:modified_time', content: head.article.modifiedTime }]);
  if (head.article?.section) m.push(['meta', { property: 'article:section', content: head.article.section }]);
  if (head.googleVerification) m.push(['meta', { name: 'google-site-verification', content: head.googleVerification }]);
  return m.filter(([, attrs]) => Object.values(attrs).every((v) => v !== undefined && v !== null && v !== ''));
}

/** HTML string for the pre-rendered <head>. Every tag carries data-head so the browser can replace it later. */
export function renderHead(head) {
  const tags = [`<title>${escapeHtml(head.title)}</title>`];
  for (const [tag, attrs] of metaEntries(head)) {
    const a = Object.entries(attrs).map(([k, v]) => `${k}="${escapeHtml(v)}"`).join(' ');
    tags.push(`<${tag} ${a} data-head>`);
  }
  for (const data of head.jsonLd) tags.push(`<script type="application/ld+json" data-head>${jsonForScript(data)}</script>`);
  return tags.join('\n    ');
}

/** Updates document <head> after client-side navigation. */
export function applyHead(head) {
  document.title = head.title;
  document.head.querySelectorAll('[data-head], meta[name="description"]').forEach((el) => el.remove());
  for (const [tag, attrs] of metaEntries(head)) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.setAttribute('data-head', '');
    document.head.appendChild(el);
  }
  for (const data of head.jsonLd) {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.textContent = JSON.stringify(data);
    el.setAttribute('data-head', '');
    document.head.appendChild(el);
  }
}
