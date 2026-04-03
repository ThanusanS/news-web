import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import slugify from 'slugify';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  createArticle,
  uploadFile,
  getFilePreviewUrl,
  getFileViewUrl,
  storage,
  BUCKET_ID,
  Query,
} from '../../lib/appwrite';

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
  { value: 'sri-lanka', label: 'Sri Lanka News 🇱🇰' },
  { value: 'tech-news', label: 'Tech News' },
  { value: 'sports', label: 'Sports' },
  { value: 'ai-tutorials', label: 'AI & Innovation' },
  { value: 'jobs-careers', label: 'Jobs & Careers' },
  { value: 'education', label: 'Education' },
  { value: 'world', label: 'World News' },
];

export default function NewPostPage() {
  const router = useRouter();
  const AUTOSAVE_KEY = 'ceylonupdates.newpost.autosave.v1';
  const REVISIONS_KEY = `${AUTOSAVE_KEY}.revisions`;
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: router.query.category || '',
    author: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    newsImage: '',
    metaTitle: '',
    metaDescription: '',
    ogTitle: '',
    ogDescription: '',
    canonicalUrl: '',
    focusKeyword: '',
    tags: '',
    status: 'draft',
  });
  const [scheduledAt, setScheduledAt] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showNewsMediaPicker, setShowNewsMediaPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revisions, setRevisions] = useState([]);

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.form) {
        setForm((prev) => ({ ...prev, ...parsed.form }));
      }
      if (parsed?.scheduledAt) {
        setScheduledAt(parsed.scheduledAt);
      }

      const revRaw = localStorage.getItem(REVISIONS_KEY);
      if (revRaw) {
        const parsedRevs = JSON.parse(revRaw);
        if (Array.isArray(parsedRevs)) {
          setRevisions(parsedRevs);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ form, scheduledAt, ts: Date.now() }));
      } catch {}
    }, 1000);
    return () => clearTimeout(timer);
  }, [form, scheduledAt]);

  useEffect(() => {
    try {
      localStorage.setItem(REVISIONS_KEY, JSON.stringify(revisions));
    } catch {}
  }, [revisions]);

  useEffect(() => {
    if (!form.title && !form.content) return;
    const interval = setInterval(() => {
      createRevision('Auto');
    }, 120000);
    return () => clearInterval(interval);
  }, [form.title, form.content, scheduledAt]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function createRevision(label = 'Manual') {
    if (!form.title && !form.content) return;
    const snapshot = {
      id: Date.now(),
      label,
      savedAt: new Date().toISOString(),
      form,
      scheduledAt,
    };
    setRevisions((prev) => [snapshot, ...prev].slice(0, 8));
    if (label === 'Manual') {
      toast.success('Revision snapshot saved.');
    }
  }

  function restoreRevision(snapshot) {
    if (!snapshot?.form) return;
    setForm(snapshot.form);
    setScheduledAt(snapshot.scheduledAt || '');
    toast.success('Revision restored.');
  }

  function formatUploadError(err) {
    const msg = err?.message || 'Image upload failed.';
    if (/not authorized|missing scope|permission/i.test(msg)) {
      return 'Upload blocked by Appwrite permissions. Grant create/read access for this bucket.';
    }
    if (/network|failed to fetch|cors/i.test(msg)) {
      return 'Upload failed due to network or CORS. Add your domain as an Appwrite web platform.';
    }
    return msg;
  }

  async function loadMediaFiles() {
    setMediaLoading(true);
    try {
      const res = await storage.listFiles(BUCKET_ID, [
        Query.orderDesc('$createdAt'),
        Query.limit(24),
      ]);
      const images = (res.files || []).filter((file) => file.mimeType?.startsWith('image/'));
      setMediaFiles(images);
    } catch {
      setMediaFiles([]);
      toast.error('Failed to load media files.');
    }
    setMediaLoading(false);
  }

  async function toggleMediaPicker() {
    const next = !showMediaPicker;
    setShowMediaPicker(next);
    if (next && mediaFiles.length === 0) {
      await loadMediaFiles();
    }
  }

  async function toggleNewsMediaPicker() {
    const next = !showNewsMediaPicker;
    setShowNewsMediaPicker(next);
    if (next && mediaFiles.length === 0) {
      await loadMediaFiles();
    }
  }

  function selectMediaImage(fileId) {
    const url = getFileViewUrl(fileId);
    setForm((f) => ({ ...f, featuredImage: url }));
    toast.success('Thumbnail selected from media library.');
  }

  function selectNewsMediaImage(fileId) {
    const url = getFileViewUrl(fileId);
    setForm((f) => ({ ...f, newsImage: url }));
    toast.success('News image selected from media library.');
  }

  async function handleThumbnailUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (jpg, png, webp, etc.).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image is too large. Max size is 8MB.');
      return;
    }

    try {
      const uploaded = await uploadFile(file);
      const url = getFileViewUrl(uploaded.$id);
      setForm((f) => ({ ...f, featuredImage: url }));
      toast.success('Thumbnail uploaded!');
    } catch (err) {
      toast.error(formatUploadError(err));
    }
  }

  async function handleNewsImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (jpg, png, webp, etc.).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image is too large. Max size is 8MB.');
      return;
    }

    try {
      const uploaded = await uploadFile(file);
      const url = getFileViewUrl(uploaded.$id);
      setForm((f) => ({ ...f, newsImage: url }));
      toast.success('News image uploaded!');
    } catch (err) {
      toast.error(formatUploadError(err));
    }
  }

  async function uploadContentImage(file) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (jpg, png, webp, etc.).');
      return null;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image is too large. Max size is 8MB.');
      return null;
    }

    try {
      const uploaded = await uploadFile(file);
      toast.success('Inline image uploaded.');
      return getFileViewUrl(uploaded.$id);
    } catch (err) {
      toast.error(formatUploadError(err));
      return null;
    }
  }

  async function handleSubmit(action) {
    setSaving(true);
    try {
      if ((action === 'published' || action === 'private') && !form.featuredImage) {
        toast.error('Please select a thumbnail image before publishing/private save.');
        setSaving(false);
        return;
      }

      const tagsArray = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const scheduleIso = scheduledAt ? new Date(scheduledAt).toISOString() : null;
      const nowIso = new Date().toISOString();
      const isFutureSchedule = Boolean(scheduleIso && scheduleIso > nowIso);

      let nextStatus = action;
      let publishedAt = null;
      if (action === 'published') {
        if (isFutureSchedule) {
          nextStatus = 'published';
          publishedAt = scheduleIso;
        } else {
          nextStatus = 'published';
          publishedAt = nowIso;
        }
      }
      if (action === 'draft') {
        nextStatus = 'draft';
      }
      if (action === 'private') {
        nextStatus = 'archived';
      }

      const created = await createArticle({
        ...form,
        tags: tagsArray,
        status: nextStatus,
        views: 0,
        publishedAt,
        updatedAt: nowIso,
      });

      if (form.featuredImage && !created?.featuredImage) {
        toast.error(
          'Image URL was not saved in Appwrite. Add a featuredImage string attribute to articles collection.'
        );
      }

      const successMessage =
        action === 'published' && isFutureSchedule
          ? 'Article scheduled successfully.'
          : nextStatus === 'archived'
            ? 'Article saved as private.'
            : nextStatus === 'published'
              ? 'Article published successfully.'
              : 'Draft saved.';

      toast.success(successMessage);
      localStorage.removeItem(AUTOSAVE_KEY);
      localStorage.removeItem(REVISIONS_KEY);
      router.push('/admin/posts');
    } catch (err) {
      toast.error('Failed to save: ' + err.message);
    }
    setSaving(false);
  }

  const imageTags = String(form.content || '').match(/<img\b[^>]*>/gi) || [];
  const imageAltCount = imageTags.filter((tag) => /\salt="[^\"]*\S[^\"]*"/i.test(tag)).length;
  const seoChecks = [
    { label: 'Title length between 30-60', pass: form.title.length >= 30 && form.title.length <= 60 },
    { label: 'Meta description 120-155 chars', pass: form.metaDescription.length >= 120 && form.metaDescription.length <= 155 },
    { label: 'Focus keyword appears in title', pass: !!form.focusKeyword && form.title.toLowerCase().includes(form.focusKeyword.toLowerCase()) },
    { label: 'Focus keyword appears early in content', pass: !!form.focusKeyword && String(form.content || '').toLowerCase().slice(0, 800).includes(form.focusKeyword.toLowerCase()) },
    { label: 'Has featured image', pass: !!form.featuredImage },
    { label: 'Images include alt text', pass: imageTags.length === 0 || imageAltCount === imageTags.length },
    { label: 'Has internal link', pass: /href="\//i.test(String(form.content || '')) },
    { label: 'Has external link', pass: /href="https?:\/\//i.test(String(form.content || '')) },
  ];
  const seoScore = Math.round((seoChecks.filter((item) => item.pass).length / seoChecks.length) * 100);
  const textContent = String(form.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent ? textContent.split(' ').length : 0;
  const charCount = textContent.length;

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
              onUploadImage={uploadContentImage}
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
            <div className="mb-3 rounded bg-stone-50 px-3 py-2 text-xs text-stone-600 dark:bg-neutral-800 dark:text-neutral-300">
              {wordCount} words · {charCount} characters
            </div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
              Schedule (optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="form-input mb-3 text-xs"
            />
            <div className="space-y-2">
              <button
                onClick={() => createRevision('Manual')}
                disabled={saving || (!form.title && !form.content)}
                className="w-full rounded border border-stone-300 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Save Revision Snapshot
              </button>
              <button
                onClick={() => handleSubmit('published')}
                disabled={saving || !form.title || !form.content}
                className="btn-primary w-full py-2.5 disabled:opacity-40"
              >
                {saving ? 'Saving...' : scheduledAt ? 'Schedule / Publish' : 'Publish Now'}
              </button>
              <button
                onClick={() => handleSubmit('private')}
                disabled={saving || !form.title}
                className="w-full rounded border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Save Private
              </button>
              <button
                onClick={() => handleSubmit('draft')}
                disabled={saving || !form.title}
                className="btn-secondary w-full py-2.5 disabled:opacity-40"
              >
                Save Draft
              </button>
              {form.slug && (
                <a
                  href={`/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded border border-stone-300 py-2.5 text-center text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  View Live
                </a>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Revision History</h3>
            {revisions.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-neutral-500">No snapshots yet.</p>
            ) : (
              <div className="space-y-2">
                {revisions.map((rev) => (
                  <button
                    key={rev.id}
                    type="button"
                    onClick={() => restoreRevision(rev)}
                    className="w-full rounded border border-stone-200 px-3 py-2 text-left text-xs text-stone-600 hover:border-accent hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <span className="font-semibold">{rev.label}</span> · {new Date(rev.savedAt).toLocaleString()}
                  </button>
                ))}
              </div>
            )}
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

          {/* Thumbnail */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Thumbnail (YouTube style)</h3>
            <label className="mb-2 block w-full cursor-pointer rounded-lg border-2 border-dashed border-stone-200 py-8 text-center transition-colors hover:border-accent dark:border-neutral-700">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />
              <span className="text-2xl">IMG</span>
              <p className="mt-1 text-xs text-stone-400 dark:text-neutral-600">
                Upload custom thumbnail
              </p>
            </label>

            <div className="mb-2 flex gap-2">
              <button
                type="button"
                onClick={toggleMediaPicker}
                className="flex-1 rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {showMediaPicker ? 'Hide Media Library' : 'Choose From Media Library'}
              </button>
              {showMediaPicker && (
                <button
                  type="button"
                  onClick={loadMediaFiles}
                  className="rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  Refresh
                </button>
              )}
            </div>

            {showMediaPicker && (
              <div className="mb-3 max-h-48 overflow-y-auto rounded border border-stone-200 p-2 dark:border-neutral-700">
                {mediaLoading ? (
                  <p className="text-xs text-stone-400 dark:text-neutral-500">Loading images...</p>
                ) : mediaFiles.length === 0 ? (
                  <p className="text-xs text-stone-400 dark:text-neutral-500">
                    No uploaded images found.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {mediaFiles.map((file) =>
                      (() => {
                        const fileUrl = getFileViewUrl(file.$id);
                        const selected = form.featuredImage === fileUrl;
                        return (
                          <button
                            key={file.$id}
                            type="button"
                            onClick={() => selectMediaImage(file.$id)}
                            className={`group overflow-hidden rounded border dark:border-neutral-700 ${selected ? 'border-accent ring-1 ring-accent' : 'border-stone-200 hover:border-accent'}`}
                            title={file.name}
                          >
                            <img
                              src={getFilePreviewUrl(file.$id, 200, 120)}
                              alt={file.name}
                              className="h-16 w-full object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                          </button>
                        );
                      })()
                    )}
                  </div>
                )}
              </div>
            )}

            <input
              type="text"
              value={form.featuredImage}
              onChange={set('featuredImage')}
              placeholder="Thumbnail URL"
              className="form-input text-xs"
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, featuredImage: '' }))}
              className="mt-2 w-full rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Remove Thumbnail
            </button>
            {form.featuredImage && (
              <img
                src={form.featuredImage}
                alt="Thumbnail preview"
                className="mt-2 aspect-video w-full rounded object-cover"
              />
            )}
          </div>

          {/* News image */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">News Image (Article Header)</h3>
            <label className="mb-2 block w-full cursor-pointer rounded-lg border-2 border-dashed border-stone-200 py-8 text-center transition-colors hover:border-accent dark:border-neutral-700">
              <input
                type="file"
                accept="image/*"
                onChange={handleNewsImageUpload}
                className="hidden"
              />
              <span className="text-2xl">IMG</span>
              <p className="mt-1 text-xs text-stone-400 dark:text-neutral-600">Upload news image</p>
            </label>

            <div className="mb-2 flex gap-2">
              <button
                type="button"
                onClick={toggleNewsMediaPicker}
                className="flex-1 rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {showNewsMediaPicker ? 'Hide Media Library' : 'Choose From Media Library'}
              </button>
              {showNewsMediaPicker && (
                <button
                  type="button"
                  onClick={loadMediaFiles}
                  className="rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  Refresh
                </button>
              )}
            </div>

            {showNewsMediaPicker && (
              <div className="mb-3 max-h-48 overflow-y-auto rounded border border-stone-200 p-2 dark:border-neutral-700">
                {mediaLoading ? (
                  <p className="text-xs text-stone-400 dark:text-neutral-500">Loading images...</p>
                ) : mediaFiles.length === 0 ? (
                  <p className="text-xs text-stone-400 dark:text-neutral-500">
                    No uploaded images found.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {mediaFiles.map((file) => {
                      const fileUrl = getFileViewUrl(file.$id);
                      const selected = form.newsImage === fileUrl;
                      return (
                        <button
                          key={`news-${file.$id}`}
                          type="button"
                          onClick={() => selectNewsMediaImage(file.$id)}
                          className={`group overflow-hidden rounded border dark:border-neutral-700 ${selected ? 'border-accent ring-1 ring-accent' : 'border-stone-200 hover:border-accent'}`}
                          title={file.name}
                        >
                          <img
                            src={getFilePreviewUrl(file.$id, 200, 120)}
                            alt={file.name}
                            className="h-16 w-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <input
              type="text"
              value={form.newsImage}
              onChange={set('newsImage')}
              placeholder="News image URL"
              className="form-input text-xs"
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, newsImage: '' }))}
              className="mt-2 w-full rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Remove News Image
            </button>
            {form.newsImage && (
              <img
                src={form.newsImage}
                alt="News image preview"
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
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                OG Title
              </label>
              <input
                type="text"
                value={form.ogTitle}
                onChange={set('ogTitle')}
                placeholder="Optional social title"
                className="form-input"
                maxLength={100}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                OG Description
              </label>
              <textarea
                value={form.ogDescription}
                onChange={set('ogDescription')}
                placeholder="Optional social description"
                className="form-input resize-none"
                rows={3}
                maxLength={200}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                Canonical URL (advanced)
              </label>
              <input
                type="url"
                value={form.canonicalUrl}
                onChange={set('canonicalUrl')}
                placeholder="https://ceylonupdates.com/your-article"
                className="form-input"
              />
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-semibold">SEO Checklist</h3>
            {seoChecks.map((item) => (
              <p key={item.label} className={`text-xs ${item.pass ? 'text-green-600' : 'text-stone-500 dark:text-neutral-400'}`}>
                {item.pass ? 'PASS' : 'TODO'} {item.label}
              </p>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
