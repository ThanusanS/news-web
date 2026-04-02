import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { estimateReadTime } from '../lib/seo';

const CATEGORY_COLORS = {
  'sri-lanka':   'bg-red-100 text-red-800',
  'tech-news':   'bg-blue-100 text-blue-800',
  'ai-tutorials':'bg-indigo-100 text-indigo-800',
  'programming': 'bg-green-100 text-green-800',
  'world':       'bg-purple-100 text-purple-800',
  'business':    'bg-yellow-100 text-yellow-800',
};

export default function ArticleCard({ article, variant = 'default' }) {
  const readTime = estimateReadTime(article.content);
  const timeAgo = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : '';
  const catColor = CATEGORY_COLORS[article.category] || 'bg-stone-100 text-stone-700';

  if (variant === 'horizontal') {
    return (
      <Link href={`/${article.slug}`} className="flex gap-4 group cursor-pointer py-4 border-b border-stone-200 dark:border-neutral-800 last:border-0">
        {article.featuredImage && (
          <div className="relative w-28 h-20 shrink-0 rounded overflow-hidden">
            <Image src={article.featuredImage} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="112px" />
          </div>
        )}
        <div>
          <div className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${catColor} px-1.5 py-0.5 rounded inline-block`}>
            {article.category?.replace('-', ' ')}
          </div>
          <h3 className="font-head font-bold text-sm leading-snug text-stone-900 dark:text-neutral-100 group-hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-xs text-stone-500 dark:text-neutral-500 mt-1">{timeAgo} · {readTime} min read</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/${article.slug}`} className="article-card flex flex-col group">
      <div className="relative aspect-video overflow-hidden bg-stone-200 dark:bg-neutral-800">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-4xl">
            {article.category === 'sri-lanka' ? '🇱🇰' : article.category === 'ai-tutorials' ? '🤖' : article.category === 'tech-news' ? '💻' : '📰'}
          </div>
        )}
        <div className={`absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${catColor}`}>
          {article.category?.replace(/-/g, ' ')}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h2 className="card-title text-[1rem] mb-2 line-clamp-3 group-hover:text-accent transition-colors">
          {article.title}
        </h2>
        <p className="text-sm text-stone-500 dark:text-neutral-500 line-clamp-2 mb-4 flex-1">
          {article.excerpt || ''}
        </p>
        <div className="flex items-center justify-between text-xs text-stone-400 dark:text-neutral-600 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center text-white text-[10px] font-bold">
              {article.author ? article.author[0].toUpperCase() : 'A'}
            </div>
            <span>{article.author || 'Staff Writer'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{readTime} min</span>
            {article.views > 0 && <span>· 👁 {article.views?.toLocaleString()}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
