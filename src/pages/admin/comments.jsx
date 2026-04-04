import { useState, useEffect } from 'react';
import Head from 'next/head';
import { formatDistanceToNow } from 'date-fns';
import AdminLayout from '../../components/admin/AdminLayout';
import { databases, DB_ID, COMMENTS_COL, Query } from '../../lib/appwrite';
import toast from 'react-hot-toast';
import { FiCheck, FiTrash2, FiExternalLink, FiMessageSquare } from 'react-icons/fi';

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState('pending'); // pending | approved | all
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [filter]);

  async function fetchComments() {
    setLoading(true);
    try {
      const queries = [Query.orderDesc('createdAt'), Query.limit(50)];
      if (filter === 'pending') queries.push(Query.equal('approved', false));
      if (filter === 'approved') queries.push(Query.equal('approved', true));
      const res = await databases.listDocuments(DB_ID, COMMENTS_COL, queries);
      setComments(res.documents);
    } catch {
      setComments([]);
    }
    setLoading(false);
  }

  async function approve(id) {
    try {
      await databases.updateDocument(DB_ID, COMMENTS_COL, id, { approved: true });
      setComments((prev) => prev.filter((c) => c.$id !== id || filter === 'all'));
      toast.success('Comment approved!');
    } catch {
      toast.error('Failed to approve.');
    }
  }

  async function hideComment(id) {
    try {
      await databases.updateDocument(DB_ID, COMMENTS_COL, id, { approved: false });
      if (filter === 'approved') {
        setComments((prev) => prev.filter((c) => c.$id !== id));
      } else {
        setComments((prev) => prev.map((c) => (c.$id === id ? { ...c, approved: false } : c)));
      }
      toast.success('Comment hidden from public view.');
    } catch {
      toast.error('Failed to hide comment.');
    }
  }

  async function reject(id) {
    if (!confirm('Reject this comment? It will be deleted permanently.')) return;
    try {
      await databases.deleteDocument(DB_ID, COMMENTS_COL, id);
      setComments((prev) => prev.filter((c) => c.$id !== id));
      toast.success('Comment rejected and removed.');
    } catch {
      toast.error('Failed to reject comment.');
    }
  }

  async function remove(id) {
    if (!confirm('Delete this comment permanently?')) return;
    try {
      await databases.deleteDocument(DB_ID, COMMENTS_COL, id);
      setComments((prev) => prev.filter((c) => c.$id !== id));
      toast.success('Comment deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  }

  async function bulkApprove() {
    const pending = comments.filter((c) => !c.approved);
    await Promise.all(
      pending.map((c) => databases.updateDocument(DB_ID, COMMENTS_COL, c.$id, { approved: true }))
    );
    toast.success(`${pending.length} comments approved!`);
    fetchComments();
  }

  return (
    <AdminLayout
      title="Comments"
      description="Moderate reader comments before they appear on articles."
    >
      <Head>
        <title>Comments | CeylonUpdates Admin</title>
      </Head>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-lg border border-stone-200 dark:border-neutral-700">
          {['pending', 'approved', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-accent text-white' : 'bg-white text-stone-600 hover:bg-stone-50 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'}`}
            >
              {f}
            </button>
          ))}
        </div>
        {filter === 'pending' && comments.length > 0 && (
          <button onClick={bulkApprove} className="btn-primary flex items-center gap-2 text-sm">
            <FiCheck size={14} /> Approve All ({comments.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="mb-2 h-4 w-1/4 rounded bg-stone-100 dark:bg-neutral-800" />
              <div className="h-3 w-3/4 rounded bg-stone-100 dark:bg-neutral-800" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-3 flex justify-center text-stone-300 dark:text-neutral-600">
            <FiMessageSquare size={34} />
          </div>
          <p className="text-stone-500 dark:text-neutral-500">
            {filter === 'pending' ? 'No pending comments. All caught up.' : 'No comments found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) =>
            (() => {
              const parentRef = c.parentId || c.parentCommentId || c.replyTo || c.replyToId || '';
              const isReply = Boolean(parentRef);
              return (
                <div
                  key={c.$id}
                  className="rounded-xl border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-orange-400 text-sm font-bold text-white">
                        {(c.name || c.commenterName || 'A')?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-stone-900 dark:text-neutral-100">
                            {c.name || c.commenterName || 'Anonymous'}
                          </span>
                          <span className="text-xs text-stone-400 dark:text-neutral-600">
                            {c.email || c.commenterEmail || 'no-email'}
                          </span>
                          {c.website && (
                            <a
                              href={c.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-accent"
                            >
                              <FiExternalLink size={10} /> {c.website}
                            </a>
                          )}
                          <span className="text-xs text-stone-400 dark:text-neutral-600">
                            {c.createdAt
                              ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })
                              : ''}
                          </span>
                          {isReply && (
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                              REPLY
                            </span>
                          )}
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${c.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                          >
                            {c.approved ? 'APPROVED' : 'PENDING'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-neutral-300">
                          {c.content ||
                            c.comment ||
                            c.commentText ||
                            c.message ||
                            c.body ||
                            'Comment submitted.'}
                        </p>
                        <p className="mt-1 text-xs text-stone-400 dark:text-neutral-600">
                          Article ID: <span className="font-mono">{c.articleId}</span>
                        </p>
                        {isReply && (
                          <p className="mt-1 text-xs text-stone-400 dark:text-neutral-600">
                            Parent ID: <span className="font-mono">{parentRef}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!c.approved && (
                        <button
                          onClick={() => approve(c.$id)}
                          className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                        >
                          <FiCheck size={12} /> Approve
                        </button>
                      )}
                      {c.approved && (
                        <button
                          onClick={() => hideComment(c.$id)}
                          className="flex items-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-700 transition-colors hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300"
                        >
                          Hide
                        </button>
                      )}
                      {!c.approved && (
                        <button
                          onClick={() => reject(c.$id)}
                          className="flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => remove(c.$id)}
                        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                      >
                        <FiTrash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}
    </AdminLayout>
  );
}
