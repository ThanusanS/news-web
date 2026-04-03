import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiSearch, FiMenu, FiX } from 'react-icons/fi';

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

export default function Navbar() {
  const { dark, toggle } = useTheme();
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
      className={`sticky top-0 z-50 border-b border-stone-200 dark:border-neutral-800 transition-all
        ${scrolled ? 'bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md shadow-sm' : 'bg-white dark:bg-neutral-950'}`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center h-12 md:h-14 gap-2.5">
        {/* Logo */}
        <Link href="/" className="font-head text-xl md:text-2xl font-black text-accent shrink-0">
          Ceylon<span className="text-stone-900 dark:text-neutral-100">Updates</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0 flex-1 overflow-hidden">
          {CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`nav-link ${router.pathname === c.href || router.asPath.startsWith(c.href) && c.href !== '/' ? 'active' : ''}`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Link href="/search" className="w-9 h-9 flex items-center justify-center rounded-full border border-stone-200 bg-white dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 hover:text-accent transition-colors">
            <FiSearch size={16} />
          </Link>
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-stone-200 bg-white dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 hover:text-accent transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
          <Link href="/admin" className="hidden sm:block px-3 py-1.5 bg-accent text-white rounded text-xs font-bold tracking-wide hover:opacity-90 transition-opacity">
            Admin
          </Link>
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-stone-200 bg-white dark:bg-neutral-800"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-950 border-t border-stone-200 dark:border-neutral-800 px-4 py-3 flex flex-col gap-1">
          {CATEGORIES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="py-2 px-3 text-sm font-medium text-stone-700 dark:text-neutral-300 hover:text-accent rounded hover:bg-stone-50 dark:hover:bg-neutral-900 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {c.label}
            </Link>
          ))}
          <Link href="/admin" className="mt-2 text-center py-2 bg-accent text-white rounded text-xs font-bold" onClick={() => setMobileOpen(false)}>
            ADMIN PANEL
          </Link>
        </div>
      )}
    </nav>
  );
}
