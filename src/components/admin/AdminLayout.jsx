import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiFileText,
  FiPlusCircle,
  FiImage,
  FiTag,
  FiMessageSquare,
  FiMail,
  FiBarChart2,
  FiSearch,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiEye,
  FiMenu,
  FiX,
  FiChevronRight,
  FiBell,
} from 'react-icons/fi';
import { ADMIN_NAV } from '../../utils/constants';

const ICON_MAP = {
  FiHome,
  FiFileText,
  FiPlusCircle,
  FiImage,
  FiTag,
  FiMessageSquare,
  FiMail,
  FiBarChart2,
  FiSearch,
  FiUsers,
  FiSettings,
};

export default function AdminLayout({ children, title = 'Dashboard', description }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleMenuToggle() {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileOpen((o) => !o);
      return;
    }
    setCollapsed((c) => !c);
  }

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [user, loading]);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-stone-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const sidebarWidth = collapsed ? 'lg:w-16' : 'lg:w-60';

  return (
    <div className="flex min-h-screen bg-stone-100 dark:bg-neutral-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setMobileOpen(false);
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 z-50 flex h-screen w-60 shrink-0 flex-col border-r border-stone-200 bg-white transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:z-auto ${sidebarWidth} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}
      >
        {/* Logo */}
        <div
          className={`flex h-14 items-center border-b border-stone-200 dark:border-neutral-800 ${collapsed ? 'justify-center px-2' : 'gap-2 px-4'}`}
        >
          {!collapsed && (
            <Link href="/" className="font-head text-lg font-black">
              <span className="text-accent">Ceylon</span>
              <span className="text-stone-900 dark:text-neutral-100">CMS</span>
            </Link>
          )}
          {collapsed && <span className="text-xl font-black text-accent">C</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {ADMIN_NAV.map((item) => {
            const Icon = ICON_MAP[item.icon] || FiHome;
            const isActive =
              router.pathname === item.href || router.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg transition-all duration-150 ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'} ${
                  isActive
                    ? 'bg-accent/10 text-accent dark:bg-accent/20'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                } `}
              >
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                {!collapsed && isActive && <FiChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {!collapsed && (
          <div className="border-t border-stone-200 p-4 dark:border-neutral-800">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-orange-400 text-xs font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-stone-800 dark:text-neutral-200">
                  {user?.name || 'Admin'}
                </p>
                <p className="truncate text-[10px] text-stone-400 dark:text-neutral-600">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                target="_blank"
                className="flex flex-1 items-center justify-center gap-1 rounded border border-stone-200 py-1.5 text-xs text-stone-500 transition-all hover:border-accent hover:text-accent dark:border-neutral-700"
              >
                <FiEye size={12} /> View Site
              </Link>
              <button
                onClick={logout}
                className="flex flex-1 items-center justify-center gap-1 rounded border border-stone-200 py-1.5 text-xs text-stone-500 transition-all hover:border-red-300 hover:text-red-500 dark:border-neutral-700"
              >
                <FiLogOut size={12} /> Logout
              </button>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="border-t border-stone-200 p-2 dark:border-neutral-800">
            <button
              onClick={logout}
              className="flex w-full justify-center py-2 text-stone-400 transition-colors hover:text-red-500"
              title="Logout"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-stone-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900">
          <button
            onClick={handleMenuToggle}
            className="rounded-lg p-2 text-stone-400 transition-all hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>

          <div className="hidden items-center gap-1 text-xs text-stone-400 dark:text-neutral-600 sm:flex">
            <Link href="/admin/dashboard" className="hover:text-accent">
              Admin
            </Link>
            <FiChevronRight size={12} />
            <span className="font-medium text-stone-700 dark:text-neutral-300">{title}</span>
          </div>

          <div className="min-w-0 flex-1 sm:hidden">
            <p className="truncate text-sm font-semibold text-stone-800 dark:text-neutral-200">
              {title}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative hidden rounded-lg p-2 text-stone-400 transition-all hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 sm:inline-flex">
              <FiBell size={17} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" />
            </button>
            <Link
              href="/admin/new-post"
              className="hidden items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90 sm:flex"
            >
              <FiPlusCircle size={13} /> New Post
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-auto overflow-y-auto p-2 sm:p-6">
          {description && (
            <p className="mb-6 text-sm text-stone-500 dark:text-neutral-500">{description}</p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
