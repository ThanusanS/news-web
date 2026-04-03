import { useEffect, useState } from 'react';
import { NextSeo } from 'next-seo';
import Head from 'next/head';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import AdSense from '../components/AdSense';
import { getArticleBySlug, getArticles, incrementViews } from '../lib/appwrite';
import {
  buildSeoProps,
  buildArticleSchema,
  buildBreadcrumbSchema,
  estimateReadTime,
} from '../lib/seo';

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
  if (crop === 'landscape')
    styleParts.push('aspect-ratio:16/9;object-fit:cover;height:clamp(180px,28vw,420px)');
  if (crop === 'square')
    styleParts.push('aspect-ratio:1/1;object-fit:cover;height:min(60vw,420px)');

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

function appendInlineStyle(attrs, styleSnippet) {
  if (/\sstyle="[^"]*"/i.test(attrs)) {
    return attrs.replace(/\sstyle="([^"]*)"/i, (_, existing) => {
      const merged = `${existing};${styleSnippet}`.replace(/;;+/g, ';');
      return ` style="${merged}"`;
    });
  }
  return `${attrs} style="${styleSnippet}"`;
}

function normalizeEditorTableHtml(html = '') {
  if (!html || typeof html !== 'string') return html;

  const tableStyle = 'border-collapse:collapse;border:2px solid currentColor;width:100%';
  const thStyle = 'border:1px solid currentColor';
  const tdStyle = 'border:1px solid currentColor';

  return html
    .replace(/<table\b([^>]*)>/gi, (_, attrs) => `<table${appendInlineStyle(attrs, tableStyle)}>`)
    .replace(/<th\b([^>]*)>/gi, (_, attrs) => `<th${appendInlineStyle(attrs, thStyle)}>`)
    .replace(/<td\b([^>]*)>/gi, (_, attrs) => `<td${appendInlineStyle(attrs, tdStyle)}>`);
}

export default function ArticlePage({ article, relatedArticles }) {
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentNotice, setCommentNotice] = useState('');
  const [commentForm, setCommentForm] = useState({
    name: '',
    content: '',
  });

  const readTime = estimateReadTime(article?.content || '');
  const renderedContent = normalizeEditorTableHtml(
    normalizeEditorImageHtml(article?.content || '<p>Article content coming soon.</p>')
  );

  async function loadComments() {
    if (!article?.$id) return;
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/comments?articleId=${encodeURIComponent(article.$id)}`);
      const data = await res.json();
      setComments(Array.isArray(data?.documents) ? data.documents : []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!article?.$id || commentSubmitting) return;

    setCommentSubmitting(true);
    setCommentNotice('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.$id,
          name: commentForm.name,
          content: commentForm.content,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCommentNotice(data?.error || 'Failed to submit comment.');
        return;
      }

      setCommentForm({ name: '', content: '' });
      setCommentNotice(data?.message || 'Comment submitted for moderation.');
    } catch {
      setCommentNotice('Failed to submit comment. Please try again.');
    } finally {
      setCommentSubmitting(false);
    }
  }

  // Increment view count on load
  useEffect(() => {
    if (article?.$id) {
      incrementViews(article.$id, article.views || 0).catch(() => {});
    }
  }, [article?.$id]);

  useEffect(() => {
    loadComments();
  }, [article?.$id]);

  if (!article) {
    return (
      <Layout title="Article Not Found | CeylonUpdates">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="mb-4 font-head text-4xl font-black">404 — Article Not Found</h1>
          <p className="mb-6 text-stone-500">
            This article may have been removed or the URL is incorrect.
          </p>
          <Link href="/" className="btn-primary">
            ← Back to Home
          </Link>
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
    article: {
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      author: article.author,
      tags: article.tags,
    },
  });

  const shareUrl = encodeURIComponent(articleUrl);
  const shareTitle = encodeURIComponent(article.title);

  return (
    <>
      <NextSeo {...seoProps} />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildArticleSchema(article, articleUrl)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildBreadcrumbSchema([
                { name: 'Home', path: '/' },
                {
                  name: article.category?.replace(/-/g, ' '),
                  path: `/category/${article.category}`,
                },
                { name: article.title, path: `/${article.slug}` },
              ])
            ),
          }}
        />
      </Head>

      <Layout>
        <article
          className="mx-auto max-w-4xl px-4 py-8"
          itemScope
          itemType="https://schema.org/NewsArticle"
        >
          {/* Breadcrumb */}
          <nav
            className="mb-5 flex items-center gap-1 text-xs text-stone-500 dark:text-neutral-500"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <span>›</span>
            <Link href={`/category/${article.category}`} className="capitalize hover:text-accent">
              {article.category?.replace(/-/g, ' ')}
            </Link>
            <span>›</span>
            <span className="max-w-xs truncate text-stone-700 dark:text-neutral-300">
              {article.title}
            </span>
          </nav>

          {/* Category */}
          <div className="mb-3">
            <Link
              href={`/category/${article.category}`}
              className="inline-block rounded bg-accent px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white"
            >
              {article.category?.replace(/-/g, ' ')}
            </Link>
          </div>

          {/* Title */}
          <h1
            className="mb-4 font-head text-3xl font-black leading-tight text-stone-900 dark:text-neutral-50 md:text-4xl"
            itemProp="headline"
          >
            {article.title}
          </h1>

          {/* Meta bar */}
          <div className="mb-6 flex flex-wrap items-center gap-4 border-y border-stone-200 py-4 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-navy to-accent text-sm font-bold text-white"
                itemProp="author"
              >
                {article.author?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p
                  className="text-sm font-semibold text-stone-900 dark:text-neutral-100"
                  itemProp="author"
                >
                  {article.author || 'Staff Writer'}
                </p>
                <p className="text-xs text-stone-400 dark:text-neutral-600">
                  <time itemProp="datePublished" dateTime={article.publishedAt}>
                    {article.publishedAt
                      ? format(new Date(article.publishedAt), 'MMMM d, yyyy')
                      : 'Recently'}
                  </time>
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs text-stone-400 dark:text-neutral-600">
              <span>⏱ {readTime} min read</span>
            </div>

            {/* Share buttons */}
            <div className="ml-0 flex items-center gap-2 sm:ml-auto">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-[#1877F2] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
              >
                f Share
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-black px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
              >
                ✕ Tweet
              </a>
              <a
                href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
              >
                📱 WhatsApp
              </a>
            </div>
          </div>

          {/* Featured image */}
          {article.newsImage && (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-xl bg-stone-200 dark:bg-neutral-800">
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
          <div className="mb-8 flex justify-center">
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
            <div className="mt-8 border-t border-stone-200 pt-6 dark:border-neutral-800">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-neutral-600">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Link key={tag} href={`/tag/${tag}`} className="tag-pill">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Share bottom */}
          <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-5 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 text-sm font-semibold text-stone-700 dark:text-neutral-300">
              Found this useful? Share it 👇
            </p>
            <div className="flex justify-center gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-[#1877F2] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
              >
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-black px-4 py-2 text-sm font-bold text-white hover:opacity-90"
              >
                Twitter / X
              </a>
              <a
                href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-[#25D366] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Comments */}
          <section className="mt-8 rounded-xl border border-stone-200 p-5 dark:border-neutral-800">
            <h2 className="mb-4 text-lg font-bold text-stone-900 dark:text-neutral-100">
              Comments
            </h2>

            <form onSubmit={submitComment} className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={commentForm.name}
                onChange={(e) => setCommentForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                className="form-input md:col-span-2"
                required
              />
              <textarea
                value={commentForm.content}
                onChange={(e) => setCommentForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write your comment..."
                className="form-input resize-y md:col-span-2"
                rows={4}
                required
              />
              <div className="flex items-center justify-end gap-3 md:col-span-2">
                <button type="submit" className="btn-primary" disabled={commentSubmitting}>
                  {commentSubmitting ? 'Submitting...' : 'Post Comment'}
                </button>
              </div>
              {commentNotice && (
                <p className="text-sm text-stone-600 dark:text-neutral-400 md:col-span-2">
                  {commentNotice}
                </p>
              )}
            </form>

            {commentsLoading ? (
              <p className="text-sm text-stone-500 dark:text-neutral-500">Loading comments...</p>
            ) : comments.length === 0 ? null : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div
                    key={c.$id}
                    className="rounded-lg border border-stone-200 p-3 dark:border-neutral-800"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-stone-900 dark:text-neutral-100">
                        {c.name}
                      </span>
                      <span className="text-xs text-stone-500 dark:text-neutral-500">
                        {c.createdAt
                          ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-stone-700 dark:text-neutral-300">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </article>

        {/* Related articles */}
        {relatedArticles?.length > 0 && (
          <section className="mx-auto max-w-4xl px-4 pb-12">
            <div className="border-t-2 border-stone-200 pt-8 dark:border-neutral-800">
              <h2 className="section-title mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

export async function getServerSideProps({ params, res }) {
  try {
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    const article = await getArticleBySlug(params.slug);
    if (!article) return { notFound: true, props: {} };

    const relatedRes = await getArticles({ category: article.category, limit: 4 });
    const relatedArticles = relatedRes.documents.filter((a) => a.$id !== article.$id).slice(0, 3);

    return { props: { article, relatedArticles } };
  } catch {
    return { notFound: true, props: {} };
  }
}
