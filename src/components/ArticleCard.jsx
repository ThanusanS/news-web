import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { FiEye, FiFileText } from 'react-icons/fi';
import { estimateReadTime } from '../lib/seo';

const CATEGORY_COLORS = {
  'sri-lanka': 'bg-red-100 text-red-800',
  'tech-news': 'bg-blue-100 text-blue-800',
  'ai-tutorials': 'bg-indigo-100 text-indigo-800',
  programming: 'bg-green-100 text-green-800',
  world: 'bg-purple-100 text-purple-800',
  business: 'bg-yellow-100 text-yellow-800',
};

export default function ArticleCard({ article, variant = 'default' }) {
  const readTime = estimateReadTime(article.content);
  const [timeAgo, setTimeAgo] = useState('');
  const viewsLabel = Number(article.views || 0).toLocaleString('en-US');

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
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="112px"
            />
          </div>
        )}
        <div>
          <div
            className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${catColor} inline-block rounded px-1.5 py-0.5`}
          >
            {article.category?.replace('-', ' ')}
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
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-stone-400">
            <FiFileText size={44} />
          </div>
        )}
        <div
          className={`absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${catColor}`}
        >
          {article.category?.replace(/-/g, ' ')}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="card-title mb-2 line-clamp-3 text-[1rem] transition-colors group-hover:text-accent">
          {article.title}
        </h2>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-stone-500 dark:text-neutral-500">
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
            {article.views > 0 && (
              <span>
                · <FiEye className="mr-1 inline-block" size={12} />
                {viewsLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
