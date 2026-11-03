import { Link, useRouter } from '../router.jsx';
import { BlogCta, BlogHero, CategoryChips, ErrorState, formatDate, LoadingState, NotFound, PostCard, PostGrid } from './BlogParts.jsx';
import { useRouteData, useSite } from './data.jsx';

const eyebrow = <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Thirumalai Properties Blog</p>;

export function BlogIndex({ route }) {
  const site = useSite();
  const { data, loading, error } = useRouteData(route);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  const [featured, ...rest] = data.posts;
  return (
    <>
      <BlogHero eyebrow={eyebrow} title="Property Guides for Pondicherry" intro={site.pages?.blog?.description}>
        <CategoryChips posts={data.posts} />
      </BlogHero>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {featured ? (
          <>
            <h2 className="sr-only">Latest article</h2>
            <PostCard post={featured} featured />
          </>
        ) : (
          <p className="text-center text-stone-500">New articles are on their way. Check back soon.</p>
        )}
        {rest.length > 0 && (
          <>
            <h2 className="font-serif text-2xl font-bold text-brand-dark mt-16 mb-8">More Articles</h2>
            <PostGrid posts={rest} />
          </>
        )}
      </section>
    </>
  );
}

export function BlogCategory({ route }) {
  const site = useSite();
  const { data, loading, error } = useRouteData(route);
  const category = site.categories.find((c) => c.slug === route.slug);
  if (!category) return <NotFound />;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  const posts = data.posts.filter((p) => p.categorySlug === category.slug);
  return (
    <>
      <BlogHero eyebrow={eyebrow} title={category.name} intro={category.description}>
        <CategoryChips posts={data.posts} active={category.slug} />
      </BlogHero>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {posts.length ? <PostGrid posts={posts} /> : <p className="text-center text-stone-500">No articles in this topic yet.</p>}
      </section>
    </>
  );
}

export function BlogPost({ route }) {
  const { navigate } = useRouter();
  const { data, loading, error } = useRouteData(route);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (data.notFound || !data.post) return <NotFound />;
  const { post, related } = data;

  // Links inside the article to other pages of this site open without a full reload.
  const onContentClick = (e) => {
    const a = e.target.closest('a');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const url = new URL(a.href, window.location.href);
    if (url.origin === window.location.origin && !url.hash) {
      e.preventDefault();
      navigate(url.pathname);
    }
  };

  return (
    <>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <nav aria-label="Breadcrumb" className="text-sm font-semibold text-stone-500">
          <Link to="/blog/" className="hover:text-brand-gold">
            Blog
          </Link>
          {post.categorySlug && (
            <>
              <span className="mx-2">/</span>
              <Link to={`/blog/category/${post.categorySlug}/`} className="hover:text-brand-gold">
                {post.categoryName}
              </Link>
            </>
          )}
        </nav>
        <header className="mt-6">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-brand-dark leading-tight">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-stone-600 mt-5 leading-relaxed">{post.excerpt}</p>}
          <p className="text-sm font-semibold text-stone-500 mt-5">
            By {post.authorName} · <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.readingMinutes} min read
          </p>
        </header>
        {post.cover && (
          <img
            src={post.cover.src}
            alt={post.cover.alt}
            width={post.cover.width || undefined}
            height={post.cover.height || undefined}
            className="w-full h-auto max-h-[28rem] object-cover rounded-2xl mt-8 bg-brand-cream"
          />
        )}
        {/* contentHtml is sanitized at build time by scripts/fetch-cms.mjs */}
        <div className="prose prose-lg prose-brand max-w-none mt-10" onClick={onContentClick} dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        {post.tags?.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-10" aria-label="Tags">
            {post.tags.map((t) => (
              <li key={t} className="px-3 py-1 rounded-full bg-stone-100 text-xs font-semibold text-stone-600">
                {t}
              </li>
            ))}
          </ul>
        )}
        <BlogCta />
      </article>
      {related?.length > 0 && (
        <section className="bg-brand-cream border-t border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h2 className="font-serif text-2xl font-bold text-brand-dark mb-8">Keep Reading</h2>
            <PostGrid posts={related} />
          </div>
        </section>
      )}
    </>
  );
}
