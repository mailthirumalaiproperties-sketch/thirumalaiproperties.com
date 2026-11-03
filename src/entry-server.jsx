import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import { DataProvider } from './blog/data.jsx'
import { RouterProvider } from './router.jsx'

export { resolveRoute } from './routes.js'
export { buildHead, renderHead } from './seo/head.js'
export { dataKeyFor } from './blog/data.jsx'

/** Renders one page to HTML at build time (see scripts/prerender.mjs). */
export function render(path, initial) {
  return renderToString(
    <StrictMode>
      <RouterProvider initialPath={path}>
        <DataProvider initial={initial}>
          <App />
        </DataProvider>
      </RouterProvider>
    </StrictMode>
  )
}
