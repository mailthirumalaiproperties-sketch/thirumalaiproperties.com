import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DataProvider } from './blog/data.jsx'
import { RouterProvider } from './router.jsx'

// Pre-rendered pages (production) embed their data and HTML; `npm run dev`
// pages don't, so they fall back to a plain client render with empty CMS data.
const initial = window.__INITIAL_DATA__ ?? {
  site: { settings: {}, pages: {}, categories: [] },
  routeKey: null,
  routeData: null,
}

const app = (
  <StrictMode>
    <RouterProvider>
      <DataProvider initial={initial}>
        <App />
      </DataProvider>
    </RouterProvider>
  </StrictMode>
)

const container = document.getElementById('root')
if (window.__INITIAL_DATA__ && container.hasChildNodes()) hydrateRoot(container, app)
else createRoot(container).render(app)
