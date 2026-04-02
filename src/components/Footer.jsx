import Link from 'next/link';
import Newsletter from './Newsletter';

const CATEGORIES = [
  { label: '🇱🇰 Sri Lanka News', href: '/category/sri-lanka' },
  { label: '💻 Tech News', href: '/category/tech-news' },
  { label: '🤖 AI Tutorials', href: '/category/ai-tutorials' },
  { label: '🐍 Programming', href: '/category/programming' },
  { label: '🌍 World News', href: '/category/world' },
  { label: '💰 Business', href: '/category/business' },
];

const LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Write For Us', href: '/write-for-us' },
  { label: 'Advertise', href: '/advertise' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Sitemap', href: '/sitemap.xml' },
];

export default function Footer() {
  return (
    <footer className="bg-stone-100 dark:bg-neutral-900 border-t-2 border-accent mt-12">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-6">
        {/* Newsletter banner */}
        <div className="mb-12">
          <Newsletter />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-head text-2xl font-black text-accent block mb-3">
              Ceylon<span className="text-stone-900 dark:text-neutral-100">Updates</span>
            </Link>
            <p className="text-sm text-stone-500 dark:text-neutral-500 leading-relaxed mb-4">
              Sri Lanka's fastest-growing news and tech platform. Reliable news, AI tutorials
              and programming guides for 100K+ monthly readers across South Asia.
            </p>
            <div className="flex gap-2">
              {[
                { label: 'f', color: 'bg-[#1877F2]', href: '#' },
                { label: '✕', color: 'bg-black dark:bg-white dark:text-black', href: '#' },
                { label: '▶', color: 'bg-red-600', href: '#' },
                { label: '📱', color: 'bg-green-500', href: '#' },
              ].map((s) => (
                <a key={s.label} href={s.href} className={`w-8 h-8 ${s.color} text-white flex items-center justify-center rounded text-xs font-bold`}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-stone-900 dark:text-neutral-100 mb-4 uppercase">Categories</h3>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((c) => (
                <Link key={c.href} href={c.href} className="text-sm text-stone-500 dark:text-neutral-500 hover:text-accent transition-colors">
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-stone-900 dark:text-neutral-100 mb-4 uppercase">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-stone-500 dark:text-neutral-500 hover:text-accent transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Trust signals */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-stone-900 dark:text-neutral-100 mb-4 uppercase">Stats</h3>
            <div className="flex flex-col gap-3">
              {[
                { num: '100K+', label: 'Monthly Readers' },
                { num: '5/day', label: 'Articles Published' },
                { num: '247', label: 'Total Articles' },
                { num: '6,840', label: 'Newsletter Subscribers' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-head font-bold text-accent text-lg leading-none">{s.num}</div>
                  <div className="text-xs text-stone-500 dark:text-neutral-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 dark:border-neutral-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-400 dark:text-neutral-600">
            © 2026 CeylonUpdates.com · All rights reserved · Built with ❤️ in 🇱🇰 Sri Lanka
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-stone-400 hover:text-accent">Privacy</Link>
            <Link href="/terms" className="text-xs text-stone-400 hover:text-accent">Terms</Link>
            <Link href="/sitemap.xml" className="text-xs text-stone-400 hover:text-accent">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
