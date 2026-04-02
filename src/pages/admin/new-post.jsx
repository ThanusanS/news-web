import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import slugify from 'slugify';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { createArticle, uploadFile, getFilePreviewUrl, ID } from '../../lib/appwrite';

// Dynamic import for TipTap (SSR off)
const RichEditor = dynamic(() => import('../../components/RichEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-b border border-stone-200 bg-stone-50 text-stone-400 dark:border-neutral-700 dark:bg-neutral-900">
      Loading editor...
    </div>
  ),
});

const CATEGORIES = [
  { value: 'sri-lanka', label: '🇱🇰 Sri Lanka' },
  { value: 'tech-news', label: '💻 Tech News' },
  { value: 'ai-tutorials', label: '🤖 AI Tutorials' },
  { value: 'programming', label: '🐍 Programming' },
  { value: 'world', label: '🌍 World' },
  { value: 'business', label: '💰 Business' },
];

export default function NewPostPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: router.query.category || '',
    author: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    tags: '',
    status: 'draft',
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (form.title && !form.slug) {
      setForm((f) => ({
        ...f,
        slug: slugify(form.title, { lower: true, strict: true }),
        metaTitle: form.title.slice(0, 60),
      }));
    }
  }, [form.title]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    try {
      const uploaded = await uploadFile(file);
      const url = getFilePreviewUrl(uploaded.$id, 1200, 675);
      setForm((f) => ({ ...f, featuredImage: url }));
      toast.success('Image uploaded!');
    } catch {
      toast.error('Image upload failed. Enter URL manually.');
    }
  }

  async function handleSubmit(status) {
    setSaving(true);
    try {
      const tagsArray = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await createArticle({
        ...form,
        tags: tagsArray,
        status,
        views: 0,
        publishedAt: status === 'published' ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      });
      toast.success(status === 'published' ? '🎉 Article published!' : 'Draft saved.');
      router.push('/admin/posts');
    } catch (err) {
      toast.error('Failed to save: ' + err.message);
    }
    setSaving(false);
  }

  // SEO score (simple)
  const seoScore = (() => {
    let score = 0;
    if (form.title.length >= 30) score += 20;
    if (form.metaDescription.length >= 80) score += 20;
    if (form.focusKeyword && form.title.toLowerCase().includes(form.focusKeyword.toLowerCase()))
      score += 20;
    if (form.featuredImage) score += 20;
    if (form.tags.length > 0) score += 20;
    return score;
  })();

  return (
    <AdminLayout title="New Post">
      <Head>
        <title>New Post | CeylonUpdates Admin</title>
      </Head>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
        {/* Main editor */}
        <div className="space-y-4">
          {/* Title */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="Article title — make it compelling and keyword-rich..."
              className="w-full border-none bg-transparent font-head text-2xl font-bold text-stone-900 placeholder-stone-300 outline-none dark:text-neutral-100 dark:placeholder-neutral-700"
            />
            <div className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-3 dark:border-neutral-800">
              <span className="text-xs text-stone-400 dark:text-neutral-600">Slug:</span>
              <input
                type="text"
                value={form.slug}
                onChange={set('slug')}
                className="flex-1 rounded border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-xs text-stone-600 focus:border-accent focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
              />
            </div>
          </div>

          {/* Rich text editor */}
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <RichEditor
              content={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            />
          </div>

          {/* Excerpt */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
              Excerpt (shown in cards)
            </label>
            <textarea
              value={form.excerpt}
              onChange={set('excerpt')}
              rows={2}
              maxLength={200}
              placeholder="Brief summary of the article (max 200 chars)..."
              className="form-input resize-none"
            />
            <p className="mt-1 text-xs text-stone-400 dark:text-neutral-600">
              {form.excerpt.length}/200
            </p>
          </div>
        </div>

        {/* Sidebar controls */}
        <div className="space-y-4">
          {/* Publish box */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Publish</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSubmit('published')}
                disabled={saving || !form.title || !form.content}
                className="btn-primary w-full py-2.5 disabled:opacity-40"
              >
                {saving ? 'Saving...' : '🚀 Publish Now'}
              </button>
              <button
                onClick={() => handleSubmit('draft')}
                disabled={saving || !form.title}
                className="btn-secondary w-full py-2.5 disabled:opacity-40"
              >
                Save Draft
              </button>
            </div>
          </div>

          {/* Category & Author */}
          <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                Category *
              </label>
              <select value={form.category} onChange={set('category')} className="form-input">
                <option value="">Select...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                Author
              </label>
              <input
                type="text"
                value={form.author}
                onChange={set('author')}
                placeholder="Author name"
                className="form-input"
              />
            </div>
          </div>

          {/* Featured image */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Featured Image</h3>
            <label className="mb-2 block w-full cursor-pointer rounded-lg border-2 border-dashed border-stone-200 py-8 text-center transition-colors hover:border-accent dark:border-neutral-700">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <span className="text-2xl">📷</span>
              <p className="mt-1 text-xs text-stone-400 dark:text-neutral-600">
                Click to upload or...
              </p>
            </label>
            <input
              type="text"
              value={form.featuredImage}
              onChange={set('featuredImage')}
              placeholder="...paste image URL"
              className="form-input text-xs"
            />
            {form.featuredImage && (
              <img
                src={form.featuredImage}
                alt="Preview"
                className="mt-2 aspect-video w-full rounded object-cover"
              />
            )}
          </div>

          {/* Tags */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
              Tags
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={set('tags')}
              placeholder="SriLanka, AI2026, ChatGPT"
              className="form-input"
            />
            <p className="mt-1 text-xs text-stone-400 dark:text-neutral-600">Comma-separated</p>
          </div>

          {/* SEO */}
          <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">SEO</h3>
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold ${seoScore >= 80 ? 'bg-green-100 text-green-700' : seoScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
              >
                Score: {seoScore}/100
              </span>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                Focus Keyword
              </label>
              <input
                type="text"
                value={form.focusKeyword}
                onChange={set('focusKeyword')}
                placeholder="e.g. AI tools 2026"
                className="form-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                Meta Title{' '}
                <span className="font-normal normal-case text-stone-400">
                  ({form.metaTitle.length}/60)
                </span>
              </label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={set('metaTitle')}
                placeholder="60 chars max"
                className="form-input"
                maxLength={60}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                Meta Description{' '}
                <span className="font-normal normal-case text-stone-400">
                  ({form.metaDescription.length}/155)
                </span>
              </label>
              <textarea
                value={form.metaDescription}
                onChange={set('metaDescription')}
                placeholder="155 chars max"
                className="form-input resize-none"
                rows={3}
                maxLength={155}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
