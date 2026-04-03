import Link from 'next/link';
import { FiEye, FiMail, FiTrendingUp } from 'react-icons/fi';
import AdSense from './AdSense';
import Newsletter from './Newsletter';

const POPULAR_TAGS = [
  '#ChatGPT',
  '#SriLanka',
  '#AI2026',
  '#Python',
  '#MERN',
  '#TechNews',
  '#MachineLearning',
  '#Colombo',
  '#React',
  '#GPT5',
  '#WebDev',
  '#Gemini',
  '#NextJS',
  '#Appwrite',
];

export default function Sidebar({ trendingArticles = [] }) {
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
                <span className="w-9 shrink-0 font-head text-3xl font-black leading-none text-stone-200 transition-colors group-hover:text-accent dark:text-neutral-700">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                    {a.category?.replace(/-/g, ' ')}
                  </div>
                  <h4 className="line-clamp-2 font-head text-sm font-bold leading-snug text-stone-900 transition-colors group-hover:text-accent dark:text-neutral-100">
                    {a.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-stone-400 dark:text-neutral-600">
                    <FiEye className="mr-1 inline-block" size={12} />
                    {Number(a.views || 0).toLocaleString('en-US')} views
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="hidden xl:block rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-3 border-b border-stone-200 pb-2 font-head text-base font-bold dark:border-neutral-800">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TAGS.map((tag) => (
            <Link key={tag} href={`/tag/${tag.replace('#', '')}`} className="tag-pill">
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter compact */}
      <div className="hidden xl:block rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-1 font-head text-base font-bold">
          <FiMail className="mr-2 inline-block" size={15} />
          Newsletter
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-stone-500 dark:text-neutral-500">
          Daily digest — top 5 stories every morning.
        </p>
        <Newsletter compact />
      </div>

      {/* Half page ad */}
      <AdSense type="halfPage" />
    </aside>
  );
}
