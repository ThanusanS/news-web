import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import slugify from 'slugify';
import toast from 'react-hot-toast';
import { AdminLayout } from './index';
import { createArticle, uploadFile, getFilePreviewUrl, ID } from '../../lib/appwrite';

// Dynamic import for TipTap (SSR off)
const RichEditor = dynamic(() => import('../../components/RichEditor'), { ssr: false, loading: () => <div className="h-64 bg-stone-50 dark:bg-neutral-900 rounded-b border border-stone-200 dark:border-neutral-700 flex items-center justify-center text-stone-400">Loading editor...</div> });

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
      const tagsArray = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
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
    if (form.focusKeyword && form.title.toLowerCase().includes(form.focusKeyword.toLowerCase())) score += 20;
    if (form.featuredImage) score += 20;
    if (form.tags.length > 0) score += 20;
    return score;
  })();

  return (
    <AdminLayout title="New Post">
      <Head><title>New Post | CeylonUpdates Admin</title></Head>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        {/* Main editor */}
        <div className="space-y-4">
          {/* Title */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="Article title — make it compelling and keyword-rich..."
              className="w-full text-2xl font-head font-bold bg-transparent border-none outline-none text-stone-900 dark:text-neutral-100 placeholder-stone-300 dark:placeholder-neutral-700"
            />
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-neutral-800">
              <span className="text-xs text-stone-400 dark:text-neutral-600">Slug:</span>
              <input
                type="text"
                value={form.slug}
                onChange={set('slug')}
                className="flex-1 text-xs font-mono bg-stone-50 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded px-2 py-1 text-stone-600 dark:text-neutral-400 focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Rich text editor */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <RichEditor
              content={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-2">Excerpt (shown in cards)</label>
            <textarea
              value={form.excerpt}
              onChange={set('excerpt')}
              rows={2}
              maxLength={200}
              placeholder="Brief summary of the article (max 200 chars)..."
              className="form-input resize-none"
            />
            <p className="text-xs text-stone-400 dark:text-neutral-600 mt-1">{form.excerpt.length}/200</p>
          </div>
        </div>

        {/* Sidebar controls */}
        <div className="space-y-4">
          {/* Publish box */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Publish</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSubmit('published')}
                disabled={saving || !form.title || !form.content}
                className="w-full btn-primary py-2.5 disabled:opacity-40"
              >
                {saving ? 'Saving...' : '🚀 Publish Now'}
              </button>
              <button
                onClick={() => handleSubmit('draft')}
                disabled={saving || !form.title}
                className="w-full btn-secondary py-2.5 disabled:opacity-40"
              >
                Save Draft
              </button>
            </div>
          </div>

          {/* Category & Author */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Category *</label>
              <select value={form.category} onChange={set('category')} className="form-input">
                <option value="">Select...</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Author</label>
              <input type="text" value={form.author} onChange={set('author')} placeholder="Author name" className="form-input" />
            </div>
          </div>

          {/* Featured image */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Featured Image</h3>
            <label className="block w-full py-8 border-2 border-dashed border-stone-200 dark:border-neutral-700 rounded-lg text-center cursor-pointer hover:border-accent transition-colors mb-2">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <span className="text-2xl">📷</span>
              <p className="text-xs text-stone-400 dark:text-neutral-600 mt-1">Click to upload or...</p>
            </label>
            <input type="text" value={form.featuredImage} onChange={set('featuredImage')} placeholder="...paste image URL" className="form-input text-xs" />
            {form.featuredImage && (
              <img src={form.featuredImage} alt="Preview" className="mt-2 rounded w-full object-cover aspect-video" />
            )}
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4">
            <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Tags</label>
            <input type="text" value={form.tags} onChange={set('tags')} placeholder="SriLanka, AI2026, ChatGPT" className="form-input" />
            <p className="text-xs text-stone-400 dark:text-neutral-600 mt-1">Comma-separated</p>
          </div>

          {/* SEO */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">SEO</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${seoScore >= 80 ? 'bg-green-100 text-green-700' : seoScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                Score: {seoScore}/100
              </span>
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1">Focus Keyword</label>
              <input type="text" value={form.focusKeyword} onChange={set('focusKeyword')} placeholder="e.g. AI tools 2026" className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1">
                Meta Title <span className="text-stone-400 normal-case font-normal">({form.metaTitle.length}/60)</span>
              </label>
              <input type="text" value={form.metaTitle} onChange={set('metaTitle')} placeholder="60 chars max" className="form-input" maxLength={60} />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1">
                Meta Description <span className="text-stone-400 normal-case font-normal">({form.metaDescription.length}/155)</span>
              </label>
              <textarea value={form.metaDescription} onChange={set('metaDescription')} placeholder="155 chars max" className="form-input resize-none" rows={3} maxLength={155} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
