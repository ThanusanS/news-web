import Link from 'next/link';
import Newsletter from './Newsletter';

const CATEGORIES = [
  { label: 'Home', href: '/' },
  { label: 'Sri Lanka News 🇱🇰', href: '/category/sri-lanka' },
  { label: 'World News', href: '/category/world' },
  { label: 'Sports', href: '/category/sports' },
  { label: 'Tech News', href: '/category/tech-news' },
  { label: 'AI & Innovation', href: '/category/ai-tutorials' },
  { label: 'Jobs & Careers', href: '/category/jobs-careers' },
  { label: 'Education', href: '/category/education' },
];

const LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Write For Us', href: '/write-for-us' },
  { label: 'Advertise', href: '/advertise' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Sitemap', href: '/sitemap.xml' },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t-2 border-accent bg-stone-100 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-12">
        {/* Newsletter banner */}
        <div className="mb-12">
          <Newsletter />
        </div>

        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="mb-3 block font-head text-2xl font-black text-accent">
              Ceylon<span className="text-stone-900 dark:text-neutral-100">Updates</span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-stone-500 dark:text-neutral-500">
              Sri Lanka's fastest-growing news and tech platform. Reliable news, AI tutorials and
              programming guides for 100K+ monthly readers across South Asia.
            </p>
            <div className="flex gap-2">
              {[
                { label: 'f', color: 'bg-[#1877F2]', href: '#' },
                { label: 'X', color: 'bg-black dark:bg-white dark:text-black', href: '#' },
                { label: 'YT', color: 'bg-red-600', href: '#' },
                { label: 'WA', color: 'bg-green-500', href: '#' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className={`h-8 w-8 ${s.color} flex items-center justify-center rounded text-xs font-bold text-white`}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-neutral-100">
              Categories
            </h3>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="text-sm text-stone-500 transition-colors hover:text-accent dark:text-neutral-500"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-neutral-100">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-stone-500 transition-colors hover:text-accent dark:text-neutral-500"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Trust signals */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-stone-900 dark:text-neutral-100">
              Stats
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { num: '100K+', label: 'Monthly Readers' },
                { num: '5/day', label: 'Articles Published' },
                { num: '247', label: 'Total Articles' },
                { num: '6,840', label: 'Newsletter Subscribers' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-head text-lg font-bold leading-none text-accent">
                    {s.num}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-neutral-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-stone-200 pt-5 dark:border-neutral-800 sm:flex-row">
          <p className="text-xs text-stone-400 dark:text-neutral-600">
            © 2026 CeylonUpdates.com · All rights reserved · Built in Sri Lanka
          </p>
          <div className="flex gap-4">
            <Link href="/contact" className="text-xs text-stone-400 hover:text-accent">
              Contact
            </Link>
            <Link href="/privacy" className="text-xs text-stone-400 hover:text-accent">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-stone-400 hover:text-accent">
              Terms
            </Link>
            <Link href="/sitemap.xml" className="text-xs text-stone-400 hover:text-accent">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
