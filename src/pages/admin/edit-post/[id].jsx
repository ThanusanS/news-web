import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import slugify from 'slugify';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import { databases, DB_ID, ARTICLES_COL } from '../../../lib/appwrite';

const RichEditor = dynamic(() => import('../../../components/RichEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-stone-50 dark:bg-neutral-900 rounded-b border border-stone-200 dark:border-neutral-700 flex items-center justify-center text-stone-400">Loading editor...</div>,
});

const CATEGORIES = [
  { value: 'sri-lanka', label: '🇱🇰 Sri Lanka' },
  { value: 'tech-news', label: '💻 Tech News' },
  { value: 'ai-tutorials', label: '🤖 AI Tutorials' },
  { value: 'programming', label: '🐍 Programming' },
  { value: 'world', label: '🌍 World' },
  { value: 'business', label: '💰 Business' },
];

export default function EditPostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    databases.getDocument(DB_ID, ARTICLES_COL, id)
      .then((doc) => {
        setForm({ ...doc, tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : doc.tags || '' });
        setLoading(false);
      })
      .catch(() => { toast.error('Article not found.'); router.push('/admin/posts'); });
  }, [id]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSave(status) {
    if (!form) return;
    setSaving(true);
    try {
      const tagsArray = typeof form.tags === 'string'
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : form.tags || [];

      const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...rest } = form;

      await databases.updateDocument(DB_ID, ARTICLES_COL, id, {
        ...rest,
        tags: tagsArray,
        status,
        updatedAt: new Date().toISOString(),
        publishedAt: status === 'published' && !form.publishedAt ? new Date().toISOString() : form.publishedAt,
      });

      toast.success(status === 'published' ? '✅ Article updated and published!' : '💾 Draft saved.');
      router.push('/admin/posts');
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <AdminLayout title="Edit Post">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Edit: ${form?.title?.slice(0, 40) || ''}...`}>
      <Head><title>Edit Post | CeylonUpdates Admin</title></Head>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <input
              type="text"
              value={form.title || ''}
              onChange={set('title')}
              placeholder="Article title..."
              className="w-full text-2xl font-head font-bold bg-transparent border-none outline-none text-stone-900 dark:text-neutral-100 placeholder-stone-300 dark:placeholder-neutral-700"
            />
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-neutral-800">
              <span className="text-xs text-stone-400">Slug:</span>
              <input type="text" value={form.slug || ''} onChange={set('slug')} className="flex-1 text-xs font-mono bg-stone-50 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded px-2 py-1 focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <RichEditor content={form.content || ''} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase mb-2">Excerpt</label>
            <textarea value={form.excerpt || ''} onChange={set('excerpt')} rows={2} className="form-input resize-none" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Update</h3>
            <div className="mb-3 px-3 py-2 bg-stone-50 dark:bg-neutral-800 rounded text-xs text-stone-500">
              Status: <span className={`font-bold ${form.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}>{form.status?.toUpperCase()}</span>
            </div>
            <div className="space-y-2">
              <button onClick={() => handleSave('published')} disabled={saving} className="w-full btn-primary py-2.5 disabled:opacity-40">
                {saving ? 'Saving...' : '✅ Update & Publish'}
              </button>
              <button onClick={() => handleSave('draft')} disabled={saving} className="w-full btn-secondary py-2.5 disabled:opacity-40">
                Save as Draft
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase mb-1.5">Category</label>
              <select value={form.category || ''} onChange={set('category')} className="form-input">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase mb-1.5">Author</label>
              <input type="text" value={form.author || ''} onChange={set('author')} className="form-input" />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase mb-1.5">Featured Image URL</label>
            <input type="text" value={form.featuredImage || ''} onChange={set('featuredImage')} className="form-input text-xs" placeholder="https://..." />
            {form.featuredImage && <img src={form.featuredImage} alt="" className="mt-2 rounded aspect-video object-cover w-full" />}
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">SEO</h3>
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase mb-1">Meta Title</label>
              <input type="text" value={form.metaTitle || ''} onChange={set('metaTitle')} className="form-input" maxLength={60} />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase mb-1">Meta Description</label>
              <textarea value={form.metaDescription || ''} onChange={set('metaDescription')} className="form-input resize-none" rows={3} maxLength={155} />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase mb-1">Tags</label>
              <input type="text" value={form.tags || ''} onChange={set('tags')} className="form-input" placeholder="Tag1, Tag2, Tag3" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
