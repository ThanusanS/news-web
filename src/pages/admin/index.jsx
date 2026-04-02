import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { getArticles, deleteArticle } from '../../lib/appwrite';
import toast from 'react-hot-toast';
import {
  FiHome, FiFileText, FiPlusCircle, FiTag, FiImage,
  FiSearch, FiBarChart2, FiUsers, FiSettings, FiLogOut, FiEye, FiEdit2, FiTrash2,
} from 'react-icons/fi';

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/admin',            icon: FiHome },
  { label: 'All Posts',    href: '/admin/posts',       icon: FiFileText },
  { label: 'New Post',     href: '/admin/new-post',    icon: FiPlusCircle },
  { label: 'Categories',   href: '/admin/categories',  icon: FiTag },
  { label: 'Media',        href: '/admin/media',       icon: FiImage },
  { label: 'SEO Settings', href: '/admin/seo',         icon: FiSearch },
  { label: 'Analytics',    href: '/admin/analytics',   icon: FiBarChart2 },
  { label: 'Users',        href: '/admin/users',       icon: FiUsers },
  { label: 'Settings',     href: '/admin/settings',    icon: FiSettings },
];

export function AdminLayout({ children, title = 'Dashboard' }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-neutral-950">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-neutral-950 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} shrink-0 bg-white dark:bg-neutral-900 border-r border-stone-200 dark:border-neutral-800 flex flex-col transition-all duration-200`}>
        <div className="h-14 flex items-center px-4 border-b border-stone-200 dark:border-neutral-800">
          {sidebarOpen && (
            <span className="font-head font-black text-lg text-accent">
              Ceylon<span className="text-stone-900 dark:text-neutral-100">CMS</span>
            </span>
          )}
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all border-l-2
                ${router.pathname === href
                  ? 'text-accent border-accent bg-red-50 dark:bg-accent/10'
                  : 'text-stone-600 dark:text-neutral-400 border-transparent hover:text-accent hover:bg-stone-50 dark:hover:bg-neutral-800'}`}
            >
              <Icon size={17} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          ))}
        </nav>
        {sidebarOpen && (
          <div className="p-4 border-t border-stone-200 dark:border-neutral-800">
            <p className="text-xs text-stone-400 dark:text-neutral-600">Logged in as</p>
            <p className="text-sm font-semibold truncate mt-0.5">{user.email}</p>
            <button onClick={logout} className="mt-3 flex items-center gap-2 text-xs text-stone-500 hover:text-accent transition-colors">
              <FiLogOut size={13} /> Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800 flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen((o) => !o)} className="text-stone-400 hover:text-accent transition-colors">
            ☰
          </button>
          <h1 className="font-head font-bold text-lg text-stone-900 dark:text-neutral-100">{title}</h1>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" target="_blank" className="text-xs text-stone-400 hover:text-accent flex items-center gap-1">
              <FiEye size={13} /> View Site
            </Link>
            <Link href="/admin/new-post" className="btn-primary text-xs px-3 py-1.5">
              + New Post
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

// ─── Dashboard page ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [recentArticles, setRecentArticles] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, views: 0 });

  useEffect(() => {
    getArticles({ limit: 5 }).then((res) => {
      setRecentArticles(res.documents);
      const published = res.documents.filter((a) => a.status === 'published').length;
      const totalViews = res.documents.reduce((s, a) => s + (a.views || 0), 0);
      setStats({ total: res.total, published, drafts: res.total - published, views: totalViews });
    }).catch(() => {});
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this article permanently?')) return;
    try {
      await deleteArticle(id);
      setRecentArticles((prev) => prev.filter((a) => a.$id !== id));
      toast.success('Article deleted.');
    } catch {
      toast.error('Failed to delete article.');
    }
  }

  return (
    <AdminLayout title="Dashboard">
      <Head><title>Admin Dashboard | CeylonUpdates</title></Head>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Monthly Visitors', value: '84,230', change: '↑ 23%', color: 'text-accent' },
          { label: 'Total Articles',   value: stats.total || '247',    change: '↑ 12 this week', color: 'text-blue-600' },
          { label: 'AdSense Est.',     value: '$280',   change: '↑ 18%', color: 'text-green-600' },
          { label: 'Subscribers',      value: '6,840',  change: '↑ 340 this week', color: 'text-purple-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <div className={`font-head text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-stone-500 dark:text-neutral-500 mt-1">{s.label}</div>
            <div className="text-xs text-green-600 mt-0.5">{s.change}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-sm mb-3">Quick Post</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '🇱🇰 Sri Lanka News', cat: 'sri-lanka' },
            { label: '🤖 AI Tutorial',    cat: 'ai-tutorials' },
            { label: '💻 Tech Article',   cat: 'tech-news' },
            { label: '🐍 Dev Guide',      cat: 'programming' },
          ].map((q) => (
            <Link
              key={q.cat}
              href={`/admin/new-post?category=${q.cat}`}
              className="p-3 text-center text-sm rounded-lg bg-stone-50 dark:bg-neutral-800 hover:bg-accent hover:text-white border border-stone-200 dark:border-neutral-700 transition-all font-medium"
            >
              {q.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent articles table */}
      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-neutral-800">
          <h2 className="font-semibold text-sm">Recent Articles</h2>
          <Link href="/admin/posts" className="text-xs text-accent hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-neutral-800 text-xs text-stone-500 dark:text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Views</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-stone-400">No articles yet. <Link href="/admin/new-post" className="text-accent underline">Create your first one →</Link></td></tr>
              ) : recentArticles.map((a) => (
                <tr key={a.$id} className="border-t border-stone-100 dark:border-neutral-800 hover:bg-stone-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs">
                    <span className="line-clamp-1">{a.title}</span>
                  </td>
                  <td className="px-4 py-3 text-stone-500 dark:text-neutral-500 capitalize">{a.category?.replace(/-/g, ' ')}</td>
                  <td className="px-4 py-3 text-stone-500 dark:text-neutral-500">{a.views?.toLocaleString() || 0}</td>
                  <td className="px-4 py-3">
                    <span className={a.status === 'published' ? 'badge-published' : 'badge-draft'}>
                      {a.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/${a.slug}`} target="_blank" className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-neutral-700 text-stone-400 hover:text-accent transition-colors"><FiEye size={13} /></Link>
                      <Link href={`/admin/edit-post/${a.$id}`} className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-neutral-700 text-stone-400 hover:text-accent transition-colors"><FiEdit2 size={13} /></Link>
                      <button onClick={() => handleDelete(a.$id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-stone-400 hover:text-red-500 transition-colors"><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
