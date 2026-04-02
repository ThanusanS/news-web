import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiFileText, FiPlusCircle, FiImage, FiTag,
  FiMessageSquare, FiMail, FiBarChart2, FiSearch,
  FiUsers, FiSettings, FiLogOut, FiEye, FiMenu, FiX,
  FiChevronRight, FiBell,
} from 'react-icons/fi';
import { ADMIN_NAV } from '../../utils/constants';

const ICON_MAP = {
  FiHome, FiFileText, FiPlusCircle, FiImage, FiTag,
  FiMessageSquare, FiMail, FiBarChart2, FiSearch,
  FiUsers, FiSettings,
};

export default function AdminLayout({ children, title = 'Dashboard', description }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [user, loading]);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const sidebarWidth = collapsed ? 'w-16' : 'w-60';

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-neutral-950 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 z-50 lg:z-auto h-screen flex flex-col
          bg-white dark:bg-neutral-900
          border-r border-stone-200 dark:border-neutral-800
          transition-all duration-300 shrink-0
          ${sidebarWidth}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`h-14 flex items-center border-b border-stone-200 dark:border-neutral-800 ${collapsed ? 'justify-center px-2' : 'px-4 gap-2'}`}>
          {!collapsed && (
            <Link href="/" className="font-head font-black text-lg">
              <span className="text-accent">Ceylon</span>
              <span className="text-stone-900 dark:text-neutral-100">CMS</span>
            </Link>
          )}
          {collapsed && <span className="text-accent font-black text-xl">C</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {ADMIN_NAV.map((item) => {
            const Icon = ICON_MAP[item.icon] || FiHome;
            const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center gap-3 rounded-lg transition-all duration-150
                  ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'}
                  ${isActive
                    ? 'bg-accent/10 dark:bg-accent/20 text-accent'
                    : 'text-stone-600 dark:text-neutral-400 hover:bg-stone-100 dark:hover:bg-neutral-800 hover:text-stone-900 dark:hover:text-neutral-100'}
                `}
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
          <div className="p-4 border-t border-stone-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-stone-800 dark:text-neutral-200">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-stone-400 dark:text-neutral-600 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/" target="_blank" className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-stone-500 hover:text-accent border border-stone-200 dark:border-neutral-700 rounded hover:border-accent transition-all">
                <FiEye size={12} /> View Site
              </Link>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-stone-500 hover:text-red-500 border border-stone-200 dark:border-neutral-700 rounded hover:border-red-300 transition-all"
              >
                <FiLogOut size={12} /> Logout
              </button>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="p-2 border-t border-stone-200 dark:border-neutral-800">
            <button onClick={logout} className="w-full flex justify-center py-2 text-stone-400 hover:text-red-500 transition-colors" title="Logout">
              <FiLogOut size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-white dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800 flex items-center px-4 gap-3">
          <button
            onClick={() => { setCollapsed((c) => !c); setMobileOpen((o) => !o); }}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-neutral-200 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-all"
          >
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>

          <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-neutral-600">
            <Link href="/admin/dashboard" className="hover:text-accent">Admin</Link>
            <FiChevronRight size={12} />
            <span className="text-stone-700 dark:text-neutral-300 font-medium">{title}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-neutral-200 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-all">
              <FiBell size={17} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            <Link
              href="/admin/new-post"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <FiPlusCircle size={13} /> New Post
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {description && (
            <p className="text-sm text-stone-500 dark:text-neutral-500 mb-6">{description}</p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
