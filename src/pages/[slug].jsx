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
import { FiClock, FiShare2 } from 'react-icons/fi';
import { getCategoryLabel } from '../utils/constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ceylonupdates.me';

function SocialIcon({ platform, className = 'h-3.5 w-3.5 md:h-4 md:w-4' }) {
  const base = { className, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true' };
  if (platform === 'facebook') {
    return (
      <svg {...base}>
        <path d="M13.5 9H16V6h-2.5C11.6 6 10 7.6 10 9.5V12H8v3h2v6h3v-6h2.4l.6-3H13v-2.2c0-.5.4-.8.5-.8Z" />
      </svg>
    );
  }
  if (platform === 'x') {
    return (
      <svg {...base}>
        <path d="M3 3h4.6l4.2 6L17 3h4l-7.2 8.2L21 21h-4.6l-4.8-6.8L6 21H2l7.6-8.7L3 3Zm4.2 2 9.4 14h1.2L8.4 5H7.2Z" />
      </svg>
    );
  }
  return (
    <svg {...base}>
      <path d="M20.5 3.5A11.7 11.7 0 0 0 12 0C5.4 0 0 5.4 0 12a12 12 0 0 0 1.6 6l-1 5.8 5.9-1.5A12 12 0 0 0 12 24c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.5ZM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.5.9.9-3.4-.2-.4A9.7 9.7 0 0 1 2.3 12C2.3 6.6 6.6 2.3 12 2.3S21.7 6.6 21.7 12 17.4 21.8 12 21.8Zm5.3-7.3c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.8.2-.2.3-.9.9-1 1.1-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.6-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.2-.2.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2.1-.4 0-.6l-.9-2.1c-.2-.5-.5-.4-.8-.4h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.8 5.1.8.4 1.5.6 2 .7.8.2 1.6.2 2.2.1.7-.1 1.7-.7 2-1.4.2-.6.2-1.2.2-1.3 0-.1-.2-.2-.5-.4Z" />
    </svg>
  );
}

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
  const [currentPageUrl, setCurrentPageUrl] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentNotice, setCommentNotice] = useState('');
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [commentForm, setCommentForm] = useState({
    name: '',
    content: '',
  });

  function flattenThreadedComments(items = [], depth = 0) {
    const out = [];
    for (const item of items) {
      if (!item) continue;
      out.push({ ...item, __depth: depth });
      if (Array.isArray(item.replies) && item.replies.length > 0) {
        out.push(...flattenThreadedComments(item.replies, depth + 1));
      }
    }
    return out;
  }

  const flatComments = flattenThreadedComments(comments);

  const visibleComments = commentsExpanded ? flatComments : flatComments.slice(0, 5);

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
      setCommentsExpanded(false);
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

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok) {
        setCommentNotice(data?.error || `Failed to submit comment (${res.status}).`);
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPageUrl(window.location.href);
    }
  }, []);

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

  const canonicalArticleUrl = `${SITE_URL}/${article.slug}`;
  const articleUrl = currentPageUrl || canonicalArticleUrl;
  const seoProps = buildSeoProps({
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    slug: article.slug,
    image: article.newsImage,
    canonicalUrl: article.canonicalUrl,
    ogTitle: article.ogTitle,
    ogDescription: article.ogDescription,
    type: 'article',
    article: {
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      author: article.author,
      tags: article.tags,
    },
  });

  const shareUrl = encodeURIComponent(articleUrl);
  const shareTitle = encodeURIComponent(article.title || 'CeylonUpdates');
  const facebookShareHref = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  const xShareHref = `https://x.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
  const whatsappShareHref = `https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`;

  return (
    <>
      <NextSeo {...seoProps} />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildArticleSchema(article, canonicalArticleUrl)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildBreadcrumbSchema([
                { name: 'Home', path: '/' },
                {
                  name: getCategoryLabel(article.category),
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
              {getCategoryLabel(article.category)}
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
              {getCategoryLabel(article.category)}
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
              <span className="inline-flex items-center gap-1.5">
                <FiClock size={13} /> {readTime} min read
              </span>
            </div>

            {/* Share buttons */}
            <div className="ml-0 flex items-center gap-2 sm:ml-auto">
              <a
                href={facebookShareHref}
                target="_blank"
                rel="noopener noreferrer"
                className="social-chip social-chip-facebook"
              >
                <SocialIcon platform="facebook" /> Share
              </a>
              <a
                href={xShareHref}
                target="_blank"
                rel="noopener noreferrer"
                className="social-chip social-chip-x"
              >
                <SocialIcon platform="x" /> Tweet
              </a>
              <a
                href={whatsappShareHref}
                target="_blank"
                rel="noopener noreferrer"
                className="social-chip social-chip-whatsapp"
              >
                <SocialIcon platform="whatsapp" /> WhatsApp
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
                  <span key={tag} className="tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share bottom */}
          <div className="mt-8 rounded-xl border border-stone-200 bg-stone-50 p-5 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-neutral-300">
              <FiShare2 size={14} /> Found this useful? Share it
            </p>
            <div className="flex justify-center gap-3">
              <a
                href={facebookShareHref}
                target="_blank"
                rel="noopener noreferrer"
                className="social-chip social-chip-facebook social-chip-lg"
              >
                <SocialIcon platform="facebook" className="h-4 w-4 md:h-[18px] md:w-[18px]" />{' '}
                Facebook
              </a>
              <a
                href={xShareHref}
                target="_blank"
                rel="noopener noreferrer"
                className="social-chip social-chip-x social-chip-lg"
              >
                <SocialIcon platform="x" className="h-4 w-4 md:h-[18px] md:w-[18px]" /> Twitter / X
              </a>
              <a
                href={whatsappShareHref}
                target="_blank"
                rel="noopener noreferrer"
                className="social-chip social-chip-whatsapp social-chip-lg"
              >
                <SocialIcon platform="whatsapp" className="h-4 w-4 md:h-[18px] md:w-[18px]" />{' '}
                WhatsApp
              </a>
            </div>
          </div>

          {/* Comments */}
          <section className="mt-8 rounded-xl border border-stone-200 p-5 dark:border-neutral-800">
            <h2 className="mb-4 text-lg font-bold text-stone-900 dark:text-neutral-100">
              Comments {flatComments.length > 0 ? `(${flatComments.length})` : ''}
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
            ) : flatComments.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-neutral-500">
                No comments yet. Be the first to comment.
              </p>
            ) : (
              <div className="space-y-5 border-t border-stone-200 pt-5 dark:border-neutral-800">
                {visibleComments.map((c, idx) => (
                  <div
                    key={`${c.$id || `comment-${idx}`}-${c.__depth || 0}`}
                    className={`group flex items-start gap-3 ${c.__depth ? 'ml-5 sm:ml-8' : ''}`}
                  >
                    {(() => {
                      const displayName =
                        c.name ||
                        c.commenterName ||
                        c.authorName ||
                        (c.email ? String(c.email).split('@')[0] : '') ||
                        'Anonymous';
                      const avatarInitial =
                        String(displayName).trim().charAt(0).toUpperCase() || 'A';

                      return (
                        <>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-orange-400 text-sm font-bold text-white">
                            {avatarInitial}
                          </div>
                          <div className="min-w-0 flex-1 border-b border-stone-100 pb-4 dark:border-neutral-800">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-sm font-semibold text-stone-900 dark:text-neutral-100">
                                {displayName}
                              </span>
                              {c.__depth > 0 && (
                                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                                  Reply
                                </span>
                              )}
                              <span className="text-xs text-stone-500 dark:text-neutral-500">
                                {c.createdAt
                                  ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })
                                  : ''}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-stone-800 dark:text-neutral-200">
                              {c.content ||
                                c.comment ||
                                c.commentText ||
                                c.message ||
                                c.body ||
                                'Comment submitted.'}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ))}

                {flatComments.length > 5 && !commentsExpanded && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setCommentsExpanded(true)}
                      className="btn-secondary text-sm"
                    >
                      Read more comments ({flatComments.length - 5} more)
                    </button>
                  </div>
                )}

                {flatComments.length > 5 && commentsExpanded && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setCommentsExpanded(false)}
                      className="btn-secondary text-sm"
                    >
                      Show less
                    </button>
                  </div>
                )}
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
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');

    const article = await getArticleBySlug(params.slug);
    if (!article) return { notFound: true, props: {} };

    const relatedRes = await getArticles({ category: article.category, limit: 4 });
    const relatedArticles = relatedRes.documents.filter((a) => a.$id !== article.$id).slice(0, 3);

    return { props: { article, relatedArticles } };
  } catch {
    return { notFound: true, props: {} };
  }
}
