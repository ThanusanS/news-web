import Link from 'next/link';
import AdSense from './AdSense';
import Newsletter from './Newsletter';

const POPULAR_TAGS = [
  '#ChatGPT', '#SriLanka', '#AI2026', '#Python', '#MERN',
  '#TechNews', '#MachineLearning', '#Colombo', '#React',
  '#GPT5', '#WebDev', '#Gemini', '#NextJS', '#Appwrite',
];

export default function Sidebar({ trendingArticles = [] }) {
  return (
    <aside className="space-y-5">
      {/* Top ad */}
      <AdSense type="rectangle" />

      {/* Trending */}
      {trendingArticles.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
          <h3 className="font-head font-bold text-base mb-3 pb-2 border-b border-stone-200 dark:border-neutral-800">
            🔥 Trending Now
          </h3>
          <div className="space-y-0">
            {trendingArticles.slice(0, 5).map((a, i) => (
              <Link key={a.$id} href={`/${a.slug}`} className="flex gap-3 py-3 border-b border-stone-100 dark:border-neutral-800 last:border-0 group">
                <span className="font-head text-3xl font-black text-stone-200 dark:text-neutral-700 leading-none w-9 shrink-0 group-hover:text-accent transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-accent uppercase mb-0.5">
                    {a.category?.replace(/-/g, ' ')}
                  </div>
                  <h4 className="text-sm font-bold font-head leading-snug text-stone-900 dark:text-neutral-100 group-hover:text-accent transition-colors line-clamp-2">
                    {a.title}
                  </h4>
                  <p className="text-xs text-stone-400 dark:text-neutral-600 mt-0.5">
                    👁 {a.views?.toLocaleString()} views
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
        <h3 className="font-head font-bold text-base mb-3 pb-2 border-b border-stone-200 dark:border-neutral-800">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_TAGS.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag.replace('#', '')}`}
              className="tag-pill"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter compact */}
      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
        <h3 className="font-head font-bold text-base mb-1">📬 Newsletter</h3>
        <p className="text-xs text-stone-500 dark:text-neutral-500 mb-3 leading-relaxed">
          Daily digest — top 5 stories every morning.
        </p>
        <Newsletter compact />
      </div>

      {/* Half page ad */}
      <AdSense type="halfPage" />
    </aside>
  );
}
