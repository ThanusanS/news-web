import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getArticles,
  deleteArticle,
  databases,
  DB_ID,
  ARTICLES_COL,
  Query,
} from '../../lib/appwrite';
import toast from 'react-hot-toast';
import { FiEye, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

export default function AllPostsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchArticles();
  }, [category, status]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const queries = [Query.orderDesc('$createdAt'), Query.limit(50)];
      if (category) queries.push(Query.equal('category', category));
      if (status === 'private') {
        queries.push(Query.equal('status', 'archived'));
      } else if (status === 'scheduled') {
        queries.push(Query.equal('status', 'published'));
        queries.push(Query.greaterThan('publishedAt', new Date().toISOString()));
      } else if (status === 'published') {
        queries.push(Query.equal('status', 'published'));
        queries.push(Query.lessThanEqual('publishedAt', new Date().toISOString()));
      } else if (status) {
        queries.push(Query.equal('status', status));
      }
      const res = await databases.listDocuments(DB_ID, ARTICLES_COL, queries);
      setArticles(res.documents);
    } catch {
      setArticles([]);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Permanently delete this article?')) return;
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.$id !== id));
      toast.success('Deleted.');
    } catch {
      toast.error('Delete failed.');
    }
  }

  const filtered = articles.filter(
    (a) => !search || a.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="All Posts">
      <Head>
        <title>All Posts | CeylonUpdates Admin</title>
      </Head>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-48 flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="form-input pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-input w-auto"
        >
          <option value="">All Categories</option>
          <option value="sri-lanka">Sri Lanka</option>
          <option value="tech-news">Tech News</option>
          <option value="ai-tutorials">AI Tutorials</option>
          <option value="programming">Programming</option>
          <option value="world">World</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="form-input w-auto"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="private">Private</option>
          <option value="draft">Draft</option>
        </select>
        <Link href="/admin/new-post" className="btn-primary">
          + New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 dark:bg-neutral-800 dark:text-neutral-500">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Author</th>
                  <th className="px-4 py-3 text-left">Views</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      No posts found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => {
                      const isScheduled =
                        a.status === 'published' &&
                        a.publishedAt &&
                        new Date(a.publishedAt).getTime() > Date.now();
                      const uiStatus =
                        a.status === 'archived'
                          ? 'private'
                          : isScheduled
                            ? 'scheduled'
                            : a.status || 'draft';
                      const badgeClass =
                        uiStatus === 'published'
                          ? 'badge-published'
                          : uiStatus === 'scheduled'
                            ? 'bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-bold uppercase'
                            : uiStatus === 'private'
                              ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200 rounded px-2 py-0.5 text-xs font-bold uppercase'
                              : 'badge-draft';
                    return (
                    <tr
                      key={a.$id}
                      className="border-t border-stone-100 transition-colors hover:bg-stone-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
                    >
                      <td className="max-w-xs px-4 py-3 font-medium">
                        <span className="line-clamp-1">{a.title}</span>
                      </td>
                      <td className="px-4 py-3 capitalize text-stone-500">
                        {a.category?.replace(/-/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-stone-500">{a.author || '—'}</td>
                      <td className="px-4 py-3 text-stone-500">{a.views?.toLocaleString() || 0}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-stone-500">
                        {a.publishedAt ? format(new Date(a.publishedAt), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={badgeClass}>{uiStatus.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/${a.slug}`}
                            target="_blank"
                            className="rounded p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-accent dark:hover:bg-neutral-700"
                            title="View"
                          >
                            <FiEye size={13} />
                          </Link>
                          <Link
                            href={`/admin/edit-post/${a.$id}`}
                            className="rounded p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-accent dark:hover:bg-neutral-700"
                            title="Edit"
                          >
                            <FiEdit2 size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(a.$id)}
                            className="rounded p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            title="Delete"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
