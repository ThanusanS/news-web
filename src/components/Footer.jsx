import Link from 'next/link';
import Newsletter from './Newsletter';
import { SOCIAL_LINKS } from '../utils/constants';

function SocialIcon({ platform }) {
  const base = {
    className: 'h-[14px] w-[14px] md:h-[18px] md:w-[18px]',
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': 'true',
  };
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
  if (platform === 'youtube') {
    return (
      <svg {...base}>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 16 24 12 24 12s0-4-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
      </svg>
    );
  }
  return (
    <svg {...base}>
      <path d="M20.5 3.5A11.7 11.7 0 0 0 12 0C5.4 0 0 5.4 0 12a12 12 0 0 0 1.6 6l-1 5.8 5.9-1.5A12 12 0 0 0 12 24c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.5ZM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.5.9.9-3.4-.2-.4A9.7 9.7 0 0 1 2.3 12C2.3 6.6 6.6 2.3 12 2.3S21.7 6.6 21.7 12 17.4 21.8 12 21.8Zm5.3-7.3c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.8.2-.2.3-.9.9-1 1.1-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.6-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.2-.2.3-.4.5-.6.1-.2.2-.3.3-.5.1-.2.1-.4 0-.6l-.9-2.1c-.2-.5-.5-.4-.8-.4h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.8 5.1.8.4 1.5.6 2 .7.8.2 1.6.2 2.2.1.7-.1 1.7-.7 2-1.4.2-.6.2-1.2.2-1.3 0-.1-.2-.2-.5-.4Z" />
    </svg>
  );
}

const CATEGORIES = [
  { label: 'Home', href: '/' },
  { label: 'Sri Lanka News', href: '/category/sri-lanka' },
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

        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10 lg:gap-14">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-3 block font-head text-2xl font-black text-accent">
              Ceylon<span className="text-stone-900 dark:text-neutral-100">Updates</span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-stone-500 dark:text-neutral-500">
              Sri Lanka's fastest-growing news and tech platform. Reliable news, AI & Innovation,
              and programming guides for readers across South Asia.
            </p>
            <div className="flex gap-2">
              {[
                {
                  key: 'facebook',
                  color: 'social-orb-facebook',
                  href: SOCIAL_LINKS.facebook,
                },
                {
                  key: 'x',
                  color: 'social-orb-x',
                  href: SOCIAL_LINKS.twitter,
                },
                {
                  key: 'youtube',
                  color: 'social-orb-youtube',
                  href: SOCIAL_LINKS.youtube,
                },
                {
                  key: 'whatsapp',
                  color: 'social-orb-whatsapp',
                  href: SOCIAL_LINKS.whatsapp,
                },
              ].map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`social-orb ${s.color}`}
                >
                  <SocialIcon platform={s.key} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="md:justify-self-start">
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
          <div className="md:justify-self-start">
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
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-stone-200 pt-5 dark:border-neutral-800 md:grid-cols-3 md:gap-10 lg:gap-14">
          <p className="text-center text-xs text-stone-400 dark:text-neutral-600 md:col-span-2 md:text-left">
            © 2026 CeylonUpdates.me · All rights reserved.
          </p>
          <div className="flex justify-center gap-4 md:justify-self-start">
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
