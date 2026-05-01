import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { FiFileText } from 'react-icons/fi';
import { estimateReadTime } from '../lib/seo';
import { getCategoryLabel } from '../utils/constants';

const CATEGORY_COLORS = {
  'sri-lanka': 'bg-red-100 text-red-900 dark:bg-red-600/50 dark:text-red-50',
  'tech-news': 'bg-blue-100 text-blue-900 dark:bg-blue-600/50 dark:text-blue-50',
  sports: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-600/50 dark:text-emerald-50',
  'ai-tutorials': 'bg-indigo-100 text-indigo-900 dark:bg-indigo-600/50 dark:text-indigo-50',
  'jobs-careers': 'bg-orange-100 text-orange-900 dark:bg-orange-600/50 dark:text-orange-50',
  education: 'bg-sky-100 text-sky-900 dark:bg-sky-600/50 dark:text-sky-50',
  programming: 'bg-green-100 text-green-900 dark:bg-green-600/50 dark:text-green-50',
  world: 'bg-purple-100 text-purple-900 dark:bg-purple-600/50 dark:text-purple-50',
  business: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-600/50 dark:text-yellow-50',
};

export default function ArticleCard({ article, variant = 'default' }) {
  const readTime = estimateReadTime(article.content);
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!article.publishedAt) return;
    setTimeAgo(formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true }));
  }, [article.publishedAt]);

  const catColor = CATEGORY_COLORS[article.category] || 'bg-stone-100 text-stone-700';

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/${article.slug}`}
        className="group flex cursor-pointer gap-4 border-b border-stone-200 py-4 last:border-0 dark:border-neutral-800"
      >
        {article.featuredImage && (
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div>
          <div
            className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${catColor} inline-block rounded px-1.5 py-0.5 ring-1 ring-black/5 backdrop-blur-sm dark:ring-white/10`}
          >
            {getCategoryLabel(article.category)}
          </div>
          <h3 className="line-clamp-2 font-head text-sm font-bold leading-snug text-stone-900 transition-colors group-hover:text-accent dark:text-neutral-100">
            {article.title}
          </h3>
          <p className="mt-1 text-xs text-stone-500 dark:text-neutral-500">
            {timeAgo} · {readTime} min read
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/${article.slug}`} className="article-card group flex flex-col">
      <div className="relative aspect-video overflow-hidden bg-stone-200 dark:bg-neutral-800">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-stone-400">
            <FiFileText size={44} />
          </div>
        )}
        <div
          className={`absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${catColor} ring-1 ring-black/5 backdrop-blur-sm dark:ring-white/10`}
        >
          {getCategoryLabel(article.category)}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3.5 md:p-4">
        <h2 className="card-title mb-2 line-clamp-3 text-[1rem] transition-colors group-hover:text-accent">
          {article.title}
        </h2>
        <p className="mb-3 line-clamp-2 flex-1 text-sm text-stone-500 dark:text-neutral-500">
          {article.excerpt || ''}
        </p>
        <div className="mt-auto flex items-center justify-between text-xs text-stone-400 dark:text-neutral-600">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent to-orange-400 text-[10px] font-bold text-white">
              {article.author ? article.author[0].toUpperCase() : 'A'}
            </div>
            <span>{article.author || 'Staff Writer'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{readTime} min</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
