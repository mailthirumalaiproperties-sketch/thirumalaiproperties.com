import React, { useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Services from './components/Services'
import Process from './components/Process'
import Footer from './components/Footer'
import Properties from './components/Properties'
import Documents from './components/Documents'
import NRI from './components/NRI'
import AboutUs from './components/AboutUs'
import Contact from './components/Contact'
import { BlogCategory, BlogIndex, BlogPost } from './blog/BlogPages'
import { NotFound } from './blog/BlogParts'
import { useRouteData, useSite } from './blog/data'
import { useRouter } from './router'
import { pathForTab, resolveRoute } from './routes'
import { applyHead, buildHead } from './seo/head'
import './App.css'

function App() {
  const { path, navigate } = useRouter();
  const route = resolveRoute(path);
  const site = useSite();
  const routeData = useRouteData(route);

  // Existing components switch "tabs"; each tab now has its own URL.
  const activeTab = route.tab;
  const setActiveTab = (tab) => navigate(pathForTab(tab));

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Keep <title> and meta tags in sync when navigating without a page reload.
  // The first render already has the right tags from pre-rendering.
  const firstHead = useRef(true);
  useEffect(() => {
    if (routeData.loading) return;
    if (firstHead.current) {
      firstHead.current = false;
      if (document.head.querySelector('[data-head]')) return;
    }
    const blog = route.type === 'blog-post' ? { post: routeData.data?.post } : { category: site.categories.find((c) => c.slug === route.slug) };
    applyHead(buildHead(route, site, blog));
  }, [path, routeData.loading]); // eslint-disable-line react-hooks/exhaustive-deps

  let page;
  switch (route.type) {
    case 'blog-index':
      page = <BlogIndex route={route} />;
      break;
    case 'blog-category':
      page = <BlogCategory route={route} />;
      break;
    case 'blog-post':
      page = <BlogPost route={route} />;
      break;
    case 'not-found':
      page = <NotFound />;
      break;
    default:
      page =
        activeTab === 'Properties' ? (
          <Properties setActiveTab={setActiveTab} />
        ) : activeTab === 'Documents' ? (
          <Documents setActiveTab={setActiveTab} />
        ) : activeTab === 'NRI Property' ? (
          <NRI setActiveTab={setActiveTab} />
        ) : activeTab === 'About Us' ? (
          <AboutUs />
        ) : activeTab === 'Contact' ? (
          <Contact />
        ) : (
          <>
            <Hero setActiveTab={setActiveTab} />
            <Services setActiveTab={setActiveTab} />
            <Features />
            <Process />
          </>
        );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header and navigation bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content area */}
      <main>{page}</main>

      {/* Footer area */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  )
}

export default App
