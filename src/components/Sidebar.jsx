import Link from 'next/link';
import { FiCompass, FiTrendingUp } from 'react-icons/fi';
import AdSense from './AdSense';
import { getCategoryLabel } from '../utils/constants';

export default function Sidebar({ trendingArticles = [] }) {
  const topicLinks = [
    { label: 'Sri Lanka', href: '/category/sri-lanka' },
    { label: 'World', href: '/category/world' },
    { label: 'Tech', href: '/category/tech-news' },
    { label: 'AI & Innovation', href: '/category/ai-tutorials' },
    { label: 'Jobs & Careers', href: '/category/jobs-careers' },
    { label: 'Education', href: '/category/education' },
    { label: 'Sports', href: '/category/sports' },
  ];

  return (
    <aside className="space-y-5">
      {/* Top ad */}
      <AdSense type="rectangle" />

      {/* Trending */}
      {trendingArticles.length > 0 && (
        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-3 border-b border-stone-200 pb-2 font-head text-base font-bold dark:border-neutral-800">
            <FiTrendingUp className="mr-2 inline-block" size={16} />
            Trending Now
          </h3>
          <div className="space-y-0">
            {trendingArticles.slice(0, 5).map((a, i) => (
              <Link
                key={a.$id}
                href={`/${a.slug}`}
                className="group flex gap-3 border-b border-stone-100 py-3 last:border-0 dark:border-neutral-800"
              >
                <span className="w-9 shrink-0 font-head text-3xl font-black leading-none text-stone-400 transition-colors group-hover:text-accent dark:text-neutral-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                    {getCategoryLabel(a.category)}
                  </div>
                  <h4 className="line-clamp-2 font-head text-sm font-bold leading-snug text-stone-900 transition-colors group-hover:text-accent dark:text-neutral-100">
                    {a.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Explore topics */}
      <div className="hidden rounded-2xl border border-stone-200/80 bg-gradient-to-br from-white via-stone-50 to-rose-50/40 p-4 shadow-sm ring-1 ring-stone-100/80 dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 dark:ring-neutral-800 xl:block">
        <div className="mb-3">
          <h3 className="font-head text-lg font-bold text-stone-900 dark:text-neutral-100">
            <FiCompass className="mr-2 inline-block text-accent" size={16} />
            Explore Topics
          </h3>
          <p className="mt-1 text-xs text-stone-500 dark:text-neutral-400">
            Jump into your favorite beats
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {topicLinks.map((topic) => (
            <Link
              key={topic.href}
              href={topic.href}
              className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white/80 px-2.5 py-2.5 text-center text-xs font-semibold tracking-wide text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-[0_10px_18px_-14px_rgba(225,29,72,0.65)] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              <span className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-rose-50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:via-neutral-800" />
              {topic.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Half page ad */}
      <AdSense type="halfPage" />
    </aside>
  );
}
