import { useEffect } from 'react';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import AdSense from '../components/AdSense';
import { getArticleBySlug, getArticles, incrementViews } from '../lib/appwrite';
import { buildSeoProps, buildArticleSchema, buildBreadcrumbSchema, estimateReadTime } from '../lib/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ceylonupdates.com';

function readAttr(attrs, key, fallback = '') {
  const direct = attrs.match(new RegExp(`${key}="([^"]*)"`, 'i'))?.[1];
  if (direct != null) return direct;
  return fallback;
}

function buildEditorImageStyleFromAttrs(attrs) {
  const align = readAttr(attrs, 'data-align', 'center') || 'center';
  const crop = readAttr(attrs, 'data-crop', 'none') || 'none';
  const size = readAttr(attrs, 'data-size', 'full') || 'full';
  const shape = readAttr(attrs, 'data-shape', 'rounded') || 'rounded';
  const frame = readAttr(attrs, 'data-frame', 'none') || 'none';

  const clipTop = Number(readAttr(attrs, 'data-clip-top', '0') || 0);
  const clipRight = Number(readAttr(attrs, 'data-clip-right', '0') || 0);
  const clipBottom = Number(readAttr(attrs, 'data-clip-bottom', '0') || 0);
  const clipLeft = Number(readAttr(attrs, 'data-clip-left', '0') || 0);

  const styleParts = ['max-width:100%'];

  if (size === 'half') styleParts.push('width:min(48%,420px)');
  if (size === 'third') styleParts.push('width:min(33%,320px)');
  if (size === 'twoThird') styleParts.push('width:min(66%,620px)');
  if (size === 'full') styleParts.push('width:100%');

  if (align === 'left') styleParts.push('float:left;margin:0.25rem 1rem 0.75rem 0');
  if (align === 'right') styleParts.push('float:right;margin:0.25rem 0 0.75rem 1rem');
  if (align === 'center') styleParts.push('display:block;margin:1rem auto;clear:both');

  if (crop === 'none') styleParts.push('aspect-ratio:auto;object-fit:contain;height:auto');
  if (crop === 'landscape') styleParts.push('aspect-ratio:16/9;object-fit:cover;height:clamp(180px,28vw,420px)');
  if (crop === 'square') styleParts.push('aspect-ratio:1/1;object-fit:cover;height:min(60vw,420px)');

  if (shape === 'rounded') styleParts.push('border-radius:0.5rem');
  if (shape === 'square') styleParts.push('border-radius:0');

  if (frame === 'border') styleParts.push('border:1px solid rgba(120,120,120,0.35)');
  if (frame === 'shadow') styleParts.push('box-shadow:0 12px 20px -14px rgba(0,0,0,0.55)');
  if (clipTop || clipRight || clipBottom || clipLeft) {
    styleParts.push(`clip-path:inset(${clipTop}% ${clipRight}% ${clipBottom}% ${clipLeft}%)`);
  }

  return styleParts.join(';');
}

function normalizeEditorImageHtml(html = '') {
  if (!html || typeof html !== 'string') return html;

  return html.replace(/<img\b([^>]*?)>/gi, (full, attrs) => {
    if (!/editor-image/i.test(attrs)) return full;

    const rebuiltStyle = buildEditorImageStyleFromAttrs(attrs);
    if (/\sstyle="[^"]*"/i.test(attrs)) {
      return `<img${attrs.replace(/\sstyle="[^"]*"/i, ` style="${rebuiltStyle}"`)}>`;
    }
    return `<img${attrs} style="${rebuiltStyle}">`;
  });
}

export default function ArticlePage({ article, relatedArticles }) {
  const readTime = estimateReadTime(article?.content || '');
  const renderedContent = normalizeEditorImageHtml(
    article?.content || '<p>Article content coming soon.</p>'
  );

  // Increment view count on load
  useEffect(() => {
    if (article?.$id) {
      incrementViews(article.$id, article.views || 0).catch(() => {});
    }
  }, [article?.$id]);

  if (!article) {
    return (
      <Layout title="Article Not Found | CeylonUpdates">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="font-head text-4xl font-black mb-4">404 — Article Not Found</h1>
          <p className="text-stone-500 mb-6">This article may have been removed or the URL is incorrect.</p>
          <Link href="/" className="btn-primary">← Back to Home</Link>
        </div>
      </Layout>
    );
  }

  const articleUrl = `${SITE_URL}/${article.slug}`;
  const seoProps = buildSeoProps({
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    slug: article.slug,
    image: article.newsImage,
    type: 'article',
    article: { publishedAt: article.publishedAt, updatedAt: article.updatedAt, author: article.author, tags: article.tags },
  });

  const shareUrl = encodeURIComponent(articleUrl);
  const shareTitle = encodeURIComponent(article.title);

  return (
    <>
      <NextSeo {...seoProps} />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleSchema(article, articleUrl)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildBreadcrumbSchema([
                { name: 'Home', path: '/' },
                { name: article.category?.replace(/-/g, ' '), path: `/category/${article.category}` },
                { name: article.title, path: `/${article.slug}` },
              ])
            ),
          }}
        />
      </Head>

      <Layout>
        <article className="max-w-4xl mx-auto px-4 py-8" itemScope itemType="https://schema.org/NewsArticle">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-stone-500 dark:text-neutral-500 mb-5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-accent">Home</Link>
            <span>›</span>
            <Link href={`/category/${article.category}`} className="hover:text-accent capitalize">
              {article.category?.replace(/-/g, ' ')}
            </Link>
            <span>›</span>
            <span className="text-stone-700 dark:text-neutral-300 truncate max-w-xs">{article.title}</span>
          </nav>

          {/* Category */}
          <div className="mb-3">
            <Link href={`/category/${article.category}`} className="inline-block bg-accent text-white text-[10px] font-black tracking-widest px-2 py-1 rounded uppercase">
              {article.category?.replace(/-/g, ' ')}
            </Link>
          </div>

          {/* Title */}
          <h1 className="font-head text-3xl md:text-4xl font-black leading-tight text-stone-900 dark:text-neutral-50 mb-4" itemProp="headline">
            {article.title}
          </h1>

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-stone-200 dark:border-neutral-800 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-accent flex items-center justify-center text-white text-sm font-bold" itemProp="author">
                {article.author?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900 dark:text-neutral-100" itemProp="author">{article.author || 'Staff Writer'}</p>
                <p className="text-xs text-stone-400 dark:text-neutral-600">
                  <time itemProp="datePublished" dateTime={article.publishedAt}>
                    {article.publishedAt ? format(new Date(article.publishedAt), 'MMMM d, yyyy') : 'Recently'}
                  </time>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-neutral-600 ml-auto">
              <span>⏱ {readTime} min read</span>
              {article.views > 0 && <span>👁 {article.views.toLocaleString()} views</span>}
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2 ml-0 sm:ml-auto">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#1877F2] text-white rounded text-xs font-bold hover:opacity-90">
                f Share
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-black text-white rounded text-xs font-bold hover:opacity-90">
                ✕ Tweet
              </a>
              <a href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#25D366] text-white rounded text-xs font-bold hover:opacity-90">
                📱 WhatsApp
              </a>
            </div>
          </div>

          {/* Featured image */}
          {article.newsImage && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-stone-200 dark:bg-neutral-800">
              <img
                src={article.newsImage}
                alt={article.title}
                className="h-full w-full object-cover"
                loading="eager"
                itemProp="image"
              />
            </div>
          )}

          {/* Top ad */}
          <div className="flex justify-center mb-8">
            <AdSense type="leaderboard" />
          </div>

          {/* Article body */}
          <div
            className="article-prose"
            itemProp="articleBody"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />

          {/* Mid-article ad */}
          <div className="my-8 flex justify-center">
            <AdSense type="inArticle" />
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-200 dark:border-neutral-800">
              <p className="text-xs font-bold tracking-widest text-stone-400 dark:text-neutral-600 uppercase mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link key={tag} href={`/tag/${tag}`} className="tag-pill">#{tag}</Link>
                ))}
              </div>
            </div>
          )}

          {/* Share bottom */}
          <div className="mt-8 p-5 bg-stone-50 dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-neutral-800 text-center">
            <p className="text-sm font-semibold text-stone-700 dark:text-neutral-300 mb-3">Found this useful? Share it 👇</p>
            <div className="flex justify-center gap-3">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-[#1877F2] text-white rounded text-sm font-bold hover:opacity-90">Facebook</a>
              <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-black text-white rounded text-sm font-bold hover:opacity-90">Twitter / X</a>
              <a href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] text-white rounded text-sm font-bold hover:opacity-90">WhatsApp</a>
            </div>
          </div>
        </article>

        {/* Related articles */}
        {relatedArticles?.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 pb-12">
            <div className="border-t-2 border-stone-200 dark:border-neutral-800 pt-8">
              <h2 className="section-title mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedArticles.map((a) => (
                  <ArticleCard key={a.$id} article={a} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer ad */}
        <div className="flex justify-center pb-8">
          <AdSense type="leaderboard" />
        </div>
      </Layout>
    </>
  );
}

export async function getStaticPaths() {
  try {
    const res = await getArticles({ limit: 100 });
    const blocked = new Set(['', '/', 'admin', 'api']);
    return {
      paths: res.documents
        .map((a) => String(a.slug || '').trim())
        .filter((slug) => slug && !blocked.has(slug.toLowerCase()))
        .map((slug) => ({ params: { slug } })),
      fallback: 'blocking',
    };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const article = await getArticleBySlug(params.slug);
    if (!article) return { notFound: true };

    const relatedRes = await getArticles({ category: article.category, limit: 4 });
    const relatedArticles = relatedRes.documents.filter((a) => a.$id !== article.$id).slice(0, 3);

    return {
      props: { article, relatedArticles },
      revalidate: 600,
    };
  } catch {
    return { notFound: true };
  }
}
