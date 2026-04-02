import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { AdminLayout } from './index';
import { getArticles, deleteArticle, databases, DB_ID, ARTICLES_COL, Query } from '../../lib/appwrite';
import toast from 'react-hot-toast';
import { FiEye, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

export default function AllPostsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => { fetchArticles(); }, [category, status]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const queries = [Query.orderDesc('$createdAt'), Query.limit(50)];
      if (category) queries.push(Query.equal('category', category));
      if (status) queries.push(Query.equal('status', status));
      const res = await databases.listDocuments(DB_ID, ARTICLES_COL, queries);
      setArticles(res.documents);
    } catch { setArticles([]); }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Permanently delete this article?')) return;
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.$id !== id));
      toast.success('Deleted.');
    } catch { toast.error('Delete failed.'); }
  }

  const filtered = articles.filter((a) =>
    !search || a.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="All Posts">
      <Head><title>All Posts | CeylonUpdates Admin</title></Head>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="form-input pl-9" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input w-auto">
          <option value="">All Categories</option>
          <option value="sri-lanka">Sri Lanka</option>
          <option value="tech-news">Tech News</option>
          <option value="ai-tutorials">AI Tutorials</option>
          <option value="programming">Programming</option>
          <option value="world">World</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-input w-auto">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <Link href="/admin/new-post" className="btn-primary">+ New Post</Link>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 dark:bg-neutral-800 text-xs text-stone-500 dark:text-neutral-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Author</th>
                  <th className="text-left px-4 py-3">Views</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-stone-400">No posts found.</td></tr>
                ) : filtered.map((a) => (
                  <tr key={a.$id} className="border-t border-stone-100 dark:border-neutral-800 hover:bg-stone-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium max-w-xs"><span className="line-clamp-1">{a.title}</span></td>
                    <td className="px-4 py-3 text-stone-500 capitalize">{a.category?.replace(/-/g, ' ')}</td>
                    <td className="px-4 py-3 text-stone-500">{a.author || '—'}</td>
                    <td className="px-4 py-3 text-stone-500">{a.views?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                      {a.publishedAt ? format(new Date(a.publishedAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={a.status === 'published' ? 'badge-published' : 'badge-draft'}>
                        {a.status?.toUpperCase() || 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/${a.slug}`} target="_blank" className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-neutral-700 text-stone-400 hover:text-accent transition-colors" title="View"><FiEye size={13} /></Link>
                        <Link href={`/admin/edit-post/${a.$id}`} className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-neutral-700 text-stone-400 hover:text-accent transition-colors" title="Edit"><FiEdit2 size={13} /></Link>
                        <button onClick={() => handleDelete(a.$id)} className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors" title="Delete"><FiTrash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
