import { useState, useEffect } from 'react';
import Head from 'next/head';
import { formatDistanceToNow } from 'date-fns';
import AdminLayout from '../../components/admin/AdminLayout';
import { databases, DB_ID, COMMENTS_COL, Query } from '../../lib/appwrite';
import toast from 'react-hot-toast';
import { FiCheck, FiTrash2, FiExternalLink } from 'react-icons/fi';

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending | approved | all
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchComments(); }, [filter]);

  async function fetchComments() {
    setLoading(true);
    try {
      const queries = [Query.orderDesc('createdAt'), Query.limit(50)];
      if (filter === 'pending') queries.push(Query.equal('approved', false));
      if (filter === 'approved') queries.push(Query.equal('approved', true));
      const res = await databases.listDocuments(DB_ID, COMMENTS_COL, queries);
      setComments(res.documents);
    } catch { setComments([]); }
    setLoading(false);
  }

  async function approve(id) {
    try {
      await databases.updateDocument(DB_ID, COMMENTS_COL, id, { approved: true });
      setComments((prev) => prev.filter((c) => c.$id !== id || filter === 'all'));
      toast.success('Comment approved!');
    } catch { toast.error('Failed to approve.'); }
  }

  async function remove(id) {
    if (!confirm('Delete this comment permanently?')) return;
    try {
      await databases.deleteDocument(DB_ID, COMMENTS_COL, id);
      setComments((prev) => prev.filter((c) => c.$id !== id));
      toast.success('Comment deleted.');
    } catch { toast.error('Failed to delete.'); }
  }

  async function bulkApprove() {
    const pending = comments.filter((c) => !c.approved);
    await Promise.all(pending.map((c) => databases.updateDocument(DB_ID, COMMENTS_COL, c.$id, { approved: true })));
    toast.success(`${pending.length} comments approved!`);
    fetchComments();
  }

  return (
    <AdminLayout title="Comments" description="Moderate reader comments before they appear on articles.">
      <Head><title>Comments | CeylonUpdates Admin</title></Head>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex rounded-lg border border-stone-200 dark:border-neutral-700 overflow-hidden">
          {['pending', 'approved', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-accent text-white' : 'bg-white dark:bg-neutral-900 text-stone-600 dark:text-neutral-400 hover:bg-stone-50 dark:hover:bg-neutral-800'}`}
            >
              {f}
            </button>
          ))}
        </div>
        {filter === 'pending' && comments.length > 0 && (
          <button onClick={bulkApprove} className="btn-primary text-sm flex items-center gap-2">
            <FiCheck size={14} /> Approve All ({comments.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-stone-100 dark:bg-neutral-800 rounded w-1/4 mb-2" />
              <div className="h-3 bg-stone-100 dark:bg-neutral-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-12 text-center">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-stone-500 dark:text-neutral-500">
            {filter === 'pending' ? 'No pending comments. All caught up! 🎉' : 'No comments found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.$id} className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {c.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-stone-900 dark:text-neutral-100">{c.name}</span>
                      <span className="text-xs text-stone-400 dark:text-neutral-600">{c.email}</span>
                      {c.website && <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-xs text-accent flex items-center gap-1"><FiExternalLink size={10} /> {c.website}</a>}
                      <span className="text-xs text-stone-400 dark:text-neutral-600">
                        {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : ''}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {c.approved ? 'APPROVED' : 'PENDING'}
                      </span>
                    </div>
                    <p className="text-sm text-stone-700 dark:text-neutral-300 mt-2 leading-relaxed">{c.content}</p>
                    <p className="text-xs text-stone-400 dark:text-neutral-600 mt-1">
                      Article ID: <span className="font-mono">{c.articleId}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!c.approved && (
                    <button onClick={() => approve(c.$id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors">
                      <FiCheck size={12} /> Approve
                    </button>
                  )}
                  <button onClick={() => remove(c.$id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                    <FiTrash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
