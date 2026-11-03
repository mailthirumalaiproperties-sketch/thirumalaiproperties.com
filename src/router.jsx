import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Small history-based router. Every page has a real URL (with a trailing slash,
// matching the pre-rendered /page/index.html files GitHub Pages serves).
const RouterContext = createContext({ path: '/', navigate: () => {} });

export function normalizePath(path) {
  const clean = (path || '/').split(/[?#]/)[0];
  return clean.endsWith('/') ? clean : `${clean}/`;
}

export function RouterProvider({ initialPath, children }) {
  const [path, setPath] = useState(() => normalizePath(initialPath ?? window.location.pathname));

  useEffect(() => {
    const onPop = () => {
      setPath(normalizePath(window.location.pathname));
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to) => {
    const target = normalizePath(to);
    if (target === normalizePath(window.location.pathname)) return;
    window.history.pushState(null, '', target);
    setPath(target);
    window.scrollTo(0, 0);
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);

/** Internal link: real href for search engines, client-side navigation for people. */
export function Link({ to, children, onClick, ...rest }) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
