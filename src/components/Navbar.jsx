import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FiSun, FiMoon, FiSearch, FiMenu, FiX } from 'react-icons/fi';

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

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b border-stone-200 transition-all dark:border-neutral-800 ${scrolled ? 'bg-white/95 shadow-sm backdrop-blur-md dark:bg-neutral-950/95' : 'bg-white dark:bg-neutral-950'}`}
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-2.5 px-4 md:h-14">
        {/* Logo */}
        <Link href="/" className="shrink-0 font-head text-xl font-black text-accent md:text-2xl">
          Ceylon<span className="text-stone-900 dark:text-neutral-100">Updates</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden flex-1 items-center gap-0 overflow-hidden md:flex">
          {CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`nav-link ${router.pathname === c.href || (router.asPath.startsWith(c.href) && c.href !== '/') ? 'active' : ''}`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition-colors hover:text-accent dark:bg-neutral-800 dark:text-neutral-300"
          >
            <FiSearch size={16} />
          </Link>
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition-colors hover:text-accent dark:bg-neutral-800 dark:text-neutral-300"
            aria-label="Toggle theme"
          >
            {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
          {user && (
            <Link
              href="/admin"
              className="hidden rounded bg-accent px-3 py-1.5 text-xs font-bold tracking-wide text-white transition-opacity hover:opacity-90 sm:block"
            >
              Admin
            </Link>
          )}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white dark:bg-neutral-800 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-stone-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
          {CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 hover:text-accent dark:text-neutral-300 dark:hover:bg-neutral-900"
              onClick={() => setMobileOpen(false)}
            >
              {c.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/admin"
              className="mt-2 rounded bg-accent py-2 text-center text-xs font-bold text-white"
              onClick={() => setMobileOpen(false)}
            >
              ADMIN PANEL
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
