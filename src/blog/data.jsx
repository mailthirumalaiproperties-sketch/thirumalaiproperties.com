import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';

// Site-wide CMS data (settings, page SEO, categories) plus per-route blog data.
// Pre-rendered pages embed their data in window.__INITIAL_DATA__; when visitors
// navigate inside the site, blog data is fetched from /blog-data/*.json.
const DataContext = createContext(null);

export function dataKeyFor(route) {
  if (route.type === 'blog-post') return `post:${route.slug}`;
  if (route.type === 'blog-index' || route.type === 'blog-category') return 'index';
  return null;
}

const urlFor = (key) => (key === 'index' ? '/blog-data/index.json' : `/blog-data/posts/${encodeURIComponent(key.slice(5))}.json`);

export function DataProvider({ initial, children }) {
  const cache = useRef(null);
  if (!cache.current) {
    cache.current = new Map();
    if (initial.routeKey) cache.current.set(initial.routeKey, initial.routeData);
  }
  return <DataContext.Provider value={{ site: initial.site, cache: cache.current }}>{children}</DataContext.Provider>;
}

export const useSite = () => useContext(DataContext).site;

/** Returns { data, loading, error } for blog routes; data is null for other routes. */
export function useRouteData(route) {
  const { cache } = useContext(DataContext);
  const key = dataKeyFor(route);
  const [, rerender] = useReducer((n) => n + 1, 0);
  const [failedKey, setFailedKey] = useState(null);
  const data = key ? cache.get(key) ?? null : null;

  useEffect(() => {
    if (!key || cache.has(key)) return undefined;
    let cancelled = false;
    fetch(urlFor(key))
      .then((res) => {
        if (res.status === 404) return { notFound: true };
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        cache.set(key, json);
        if (!cancelled) rerender();
      })
      .catch(() => !cancelled && setFailedKey(key));
    return () => {
      cancelled = true;
    };
  }, [key, cache]);

  const error = Boolean(key) && failedKey === key && !data;
  return { data, loading: Boolean(key) && !data && !error, error };
}
