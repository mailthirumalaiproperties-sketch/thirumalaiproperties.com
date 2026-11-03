// URL ↔ page mapping for the whole site. The tab names are the ones the
// existing components already use with setActiveTab().

export const SITE_URL = 'https://thirumalaiproperties.com';

export const PAGES = [
  { tab: 'Home', key: 'home', path: '/' },
  { tab: 'Properties', key: 'properties', path: '/properties/' },
  { tab: 'Documents', key: 'documents', path: '/documents/' },
  { tab: 'NRI Property', key: 'nri-property', path: '/nri-property/' },
  { tab: 'About Us', key: 'about-us', path: '/about-us/' },
  { tab: 'Contact', key: 'contact', path: '/contact/' },
  { tab: 'Blog', key: 'blog', path: '/blog/' },
];

export const pathForTab = (tab) => PAGES.find((p) => p.tab === tab)?.path ?? '/';

/**
 * Resolves a normalized path ("/blog/my-post/") to a route description:
 *   { type: 'page', tab, key } | { type: 'blog-index' } | { type: 'blog-category', slug }
 *   | { type: 'blog-post', slug } | { type: 'not-found' }
 */
export function resolveRoute(path) {
  const page = PAGES.find((p) => p.path === path);
  if (page) return page.key === 'blog' ? { type: 'blog-index', tab: 'Blog', key: 'blog' } : { type: 'page', tab: page.tab, key: page.key };

  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'blog') {
    if (parts.length === 3 && parts[1] === 'category') return { type: 'blog-category', tab: 'Blog', slug: parts[2] };
    if (parts.length === 2 && parts[1] !== 'category') return { type: 'blog-post', tab: 'Blog', slug: parts[1] };
  }
  return { type: 'not-found', tab: null };
}
