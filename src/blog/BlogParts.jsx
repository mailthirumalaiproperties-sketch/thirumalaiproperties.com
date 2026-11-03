import { Link } from '../router.jsx';
import { useSite } from './data.jsx';

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

export function PostCard({ post, featured = false }) {
  const href = `/blog/${post.slug}/`;
  return (
    <article
      className={`group bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex ${
        featured ? 'flex-col lg:flex-row' : 'flex-col'
      }`}
    >
      {post.cover && (
        <Link to={href} tabIndex={-1} aria-hidden="true" className={`block bg-brand-cream overflow-hidden ${featured ? 'lg:w-1/2' : ''}`}>
          <img
            src={post.cover.src}
            alt={post.cover.alt}
            width={post.cover.width || undefined}
            height={post.cover.height || undefined}
            loading={featured ? 'eager' : 'lazy'}
            className={`w-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ${featured ? 'h-60 lg:h-full' : 'h-52'}`}
          />
        </Link>
      )}
      <div className={`flex flex-col flex-1 p-6 ${featured ? 'lg:p-10 lg:justify-center' : ''}`}>
        {post.categorySlug && (
          <Link to={`/blog/category/${post.categorySlug}/`} className="self-start text-xs font-bold uppercase tracking-[0.15em] text-brand-gold hover:text-brand-dark transition">
            {post.categoryName}
          </Link>
        )}
        <h3 className={`font-serif font-bold text-brand-dark mt-3 leading-snug ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          <Link to={href} className="hover:text-brand-gold transition">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="text-stone-600 mt-3 leading-relaxed flex-1">{post.excerpt}</p>}
        <p className="text-xs font-semibold text-stone-500 mt-5">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.readingMinutes} min read
        </p>
      </div>
    </article>
  );
}

export function PostGrid({ posts }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <PostCard key={p.slug} post={p} />
      ))}
    </div>
  );
}

export function CategoryChips({ posts, active }) {
  const site = useSite();
  const counts = {};
  for (const p of posts) if (p.categorySlug) counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
  const cats = site.categories.filter((c) => counts[c.slug]);
  if (!cats.length) return null;
  const chip = (isActive) =>
    `px-4 py-2 rounded-full border text-sm font-semibold transition ${
      isActive ? 'bg-brand-dark border-brand-dark text-white' : 'bg-white border-stone-200 text-stone-700 hover:border-brand-gold hover:text-brand-dark'
    }`;
  return (
    <nav aria-label="Blog topics" className="flex flex-wrap justify-center gap-3">
      <Link to="/blog/" className={chip(!active)}>
        All articles
      </Link>
      {cats.map((c) => (
        <Link key={c.slug} to={`/blog/category/${c.slug}/`} className={chip(active === c.slug)}>
          {c.name} <span className={active === c.slug ? 'text-white/60' : 'text-stone-400'}>({counts[c.slug]})</span>
        </Link>
      ))}
    </nav>
  );
}

export function BlogCta() {
  const org = useSite().settings?.organization || {};
  return (
    <aside className="my-12 rounded-2xl bg-brand-cream border border-brand-gold/30 p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-gold">Thirumalai Properties</p>
      <h2 className="font-serif text-2xl font-bold text-brand-dark mt-2">Need help with a property in Pondicherry?</h2>
      <p className="text-stone-700 mt-3 leading-relaxed">
        We help with buying and selling plots, villas and land, document writing and registration, and managing property for NRIs. Talk to our
        team before you commit.
      </p>
      <div className="flex flex-wrap gap-3 mt-6">
        <Link to="/properties/" className="bg-brand-yellow hover:bg-[#E5B002] text-brand-dark px-5 py-3 rounded-xl font-bold text-sm shadow-md transition">
          View Properties
        </Link>
        {org.whatsapp && (
          <a
            href={`https://wa.me/${org.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-stone-200 hover:border-brand-gold text-brand-dark px-5 py-3 rounded-xl font-bold text-sm transition"
          >
            WhatsApp Us
          </a>
        )}
        <Link to="/contact/" className="bg-white border border-stone-200 hover:border-brand-gold text-brand-dark px-5 py-3 rounded-xl font-bold text-sm transition">
          Contact Us
        </Link>
      </div>
    </aside>
  );
}

export function BlogHero({ eyebrow, title, intro, children }) {
  return (
    <section className="bg-brand-cream border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 text-center">
        {eyebrow}
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark mt-4 leading-tight">{title}</h1>
        {intro && <p className="max-w-2xl mx-auto text-lg text-stone-600 mt-5 leading-relaxed">{intro}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center" aria-busy="true">
      <div className="h-8 w-8 rounded-full border-4 border-brand-yellow border-t-transparent animate-spin" />
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="font-semibold text-stone-700">Couldn&apos;t load this page.</p>
      <p className="text-stone-500 mt-2">Check your connection and refresh the page.</p>
    </div>
  );
}

export function NotFound() {
  return (
    <section className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">404</p>
      <h1 className="font-serif text-4xl font-bold text-brand-dark mt-4">We couldn&apos;t find that page</h1>
      <p className="text-stone-600 mt-4">The page may have moved. Try our homepage, properties or blog.</p>
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <Link to="/" className="bg-brand-yellow hover:bg-[#E5B002] text-brand-dark px-5 py-3 rounded-xl font-bold text-sm shadow-md transition">
          Home
        </Link>
        <Link to="/properties/" className="bg-white border border-stone-200 hover:border-brand-gold text-brand-dark px-5 py-3 rounded-xl font-bold text-sm transition">
          Properties
        </Link>
        <Link to="/blog/" className="bg-white border border-stone-200 hover:border-brand-gold text-brand-dark px-5 py-3 rounded-xl font-bold text-sm transition">
          Blog
        </Link>
      </div>
    </section>
  );
}
