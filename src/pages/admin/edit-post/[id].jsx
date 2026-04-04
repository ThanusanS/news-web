import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import slugify from 'slugify';
import toast from 'react-hot-toast';
import AdminLayout from '../../../components/admin/AdminLayout';
import {
  updateArticle,
  getArticleById,
  uploadFile,
  getFileViewUrl,
  getFilePreviewUrl,
  storage,
  BUCKET_ID,
  Query,
} from '../../../lib/appwrite';

const RichEditor = dynamic(() => import('../../../components/RichEditor'), {
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

export default function EditPostPage() {
  const router = useRouter();
  const { id } = router.query;
  const AUTOSAVE_KEY = id ? `ceylonupdates.editpost.autosave.${id}` : null;
  const AUTOSAVE_PREF_KEY = id ? `ceylonupdates.editpost.autosave.pref.${id}` : null;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showThumbMediaPicker, setShowThumbMediaPicker] = useState(false);
  const [showNewsMediaPicker, setShowNewsMediaPicker] = useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [autosaveIntervalMs, setAutosaveIntervalMs] = useState(1000);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    if (!AUTOSAVE_PREF_KEY) return;
    try {
      const prefRaw = localStorage.getItem(AUTOSAVE_PREF_KEY);
      if (!prefRaw) return;
      const prefs = JSON.parse(prefRaw);
      if (typeof prefs?.enabled === 'boolean') {
        setAutosaveEnabled(prefs.enabled);
      }
      if ([1000, 3000, 5000, 10000].includes(Number(prefs?.intervalMs))) {
        setAutosaveIntervalMs(Number(prefs.intervalMs));
      }
    } catch {}
  }, [AUTOSAVE_PREF_KEY]);

  function saveDraftSnapshot(showToast = false) {
    if (!AUTOSAVE_KEY || !form) return;
    try {
      const now = Date.now();
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ form, scheduledAt, ts: now }));
      setLastSavedAt(now);
      if (showToast) {
        toast.success('Draft saved locally.');
      }
    } catch {
      if (showToast) {
        toast.error('Could not save local draft.');
      }
    }
  }

  useEffect(() => {
    if (!AUTOSAVE_PREF_KEY) return;
    try {
      localStorage.setItem(
        AUTOSAVE_PREF_KEY,
        JSON.stringify({ enabled: autosaveEnabled, intervalMs: autosaveIntervalMs })
      );
    } catch {}
  }, [AUTOSAVE_PREF_KEY, autosaveEnabled, autosaveIntervalMs]);

  useEffect(() => {
    if (!id) return;
    getArticleById(id)
      .then((doc) => {
        const { tags, ...docWithoutTags } = doc;
        const baseForm = { ...docWithoutTags };
        let restored = null;
        try {
          if (AUTOSAVE_KEY) {
            restored = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null');
          }
        } catch {}

        setForm(restored?.form ? { ...baseForm, ...restored.form } : baseForm);
        if (restored?.ts) {
          setLastSavedAt(restored.ts);
        }
        const scheduleValue =
          restored?.scheduledAt ||
          (doc.publishedAt ? new Date(doc.publishedAt).toISOString().slice(0, 16) : '');
        setScheduledAt(scheduleValue);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Article not found.');
        router.push('/admin/posts');
      });
  }, [id]);

  useEffect(() => {
    if (!AUTOSAVE_KEY || !form || !autosaveEnabled) return undefined;
    const timer = setTimeout(() => {
      saveDraftSnapshot(false);
    }, autosaveIntervalMs);
    return () => clearTimeout(timer);
  }, [AUTOSAVE_KEY, form, scheduledAt, autosaveEnabled, autosaveIntervalMs]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function openPreview() {
    if (!form) return;
    try {
      const nonce =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const key = `ceylonupdates.preview.${nonce}`;
      const payload = {
        title: form.title,
        slug: form.slug,
        author: form.author,
        category: form.category,
        excerpt: form.excerpt,
        content: form.content,
        featuredImage: form.featuredImage,
        newsImage: form.newsImage,
        updatedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(key, JSON.stringify(payload));
      localStorage.setItem(key, JSON.stringify(payload));
      window.open(`/admin/preview?key=${encodeURIComponent(key)}`, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Preview unavailable in this browser tab.');
    }
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

  async function toggleThumbMediaPicker() {
    const next = !showThumbMediaPicker;
    setShowThumbMediaPicker(next);
    if (next && mediaFiles.length === 0) await loadMediaFiles();
  }

  async function toggleNewsMediaPicker() {
    const next = !showNewsMediaPicker;
    setShowNewsMediaPicker(next);
    if (next && mediaFiles.length === 0) await loadMediaFiles();
  }

  function selectThumbMediaImage(fileId) {
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

  async function handleSave(action) {
    if (!form) return;
    setSaving(true);
    try {
      if ((action === 'published' || action === 'private') && !form.featuredImage) {
        toast.error('Please select a thumbnail image before publishing/private save.');
        setSaving(false);
        return;
      }

      const {
        $id,
        $createdAt,
        $updatedAt,
        $permissions,
        $collectionId,
        $databaseId,
        tags,
        ...rest
      } = form;

      const scheduleIso = scheduledAt ? new Date(scheduledAt).toISOString() : null;
      const nowIso = new Date().toISOString();
      const isFutureSchedule = Boolean(scheduleIso && scheduleIso > nowIso);

      let nextStatus = action;
      let publishedAt = form.publishedAt || null;
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

      const updated = await updateArticle(id, {
        ...rest,
        status: nextStatus,
        updatedAt: nowIso,
        publishedAt,
      });

      if (form.featuredImage && !updated?.featuredImage) {
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
              ? 'Article updated and published.'
              : 'Draft saved.';
      toast.success(successMessage);
      if (AUTOSAVE_KEY) {
        localStorage.removeItem(AUTOSAVE_KEY);
        setLastSavedAt(null);
      }
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  const contentHtml = String(form?.content || '');
  const textContent = contentHtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const normalizedContentText = textContent.toLowerCase();
  const normalizedKeyword = String(form?.focusKeyword || '')
    .trim()
    .toLowerCase();
  const seoTitle = String(form?.metaTitle || form?.title || '').trim();
  const seoDescription = String(form?.metaDescription || form?.excerpt || '').trim();
  const wordCount = textContent ? textContent.split(' ').length : 0;
  const charCount = textContent.length;
  const imageTags = contentHtml.match(/<img\b[^>]*>/gi) || [];
  const imageAltCount = imageTags.filter((tag) => /\salt="[^\"]*\S[^\"]*"/i.test(tag)).length;
  const seoChecks = [
    {
      label: 'SEO title length between 30-60',
      pass: seoTitle.length >= 30 && seoTitle.length <= 60,
    },
    {
      label: 'Meta description 120-155 chars',
      pass: seoDescription.length >= 120 && seoDescription.length <= 155,
    },
    {
      label: 'Focus keyword appears in SEO title',
      pass: !!normalizedKeyword && seoTitle.toLowerCase().includes(normalizedKeyword),
    },
    {
      label: 'Focus keyword appears early in content',
      pass: !!normalizedKeyword && normalizedContentText.slice(0, 800).includes(normalizedKeyword),
    },
    { label: 'Has featured image', pass: !!form?.featuredImage },
    {
      label: 'Images include alt text',
      pass: imageTags.length === 0 || imageAltCount === imageTags.length,
    },
    { label: 'Has internal link', pass: /href\s*=\s*["']\/(?!\/)/i.test(contentHtml) },
    { label: 'Has external link', pass: /href\s*=\s*["']https?:\/\//i.test(contentHtml) },
  ];
  const seoScore = Math.round(
    (seoChecks.filter((item) => item.pass).length / seoChecks.length) * 100
  );

  return (
    <AdminLayout title={`Edit: ${form?.title?.slice(0, 40) || ''}...`}>
      <Head>
        <title>Edit Post | CeylonUpdates Admin</title>
      </Head>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <input
              type="text"
              value={form.title || ''}
              onChange={set('title')}
              placeholder="Article title..."
              className="w-full border-none bg-transparent font-head text-2xl font-bold text-stone-900 placeholder-stone-300 outline-none dark:text-neutral-100 dark:placeholder-neutral-700"
            />
            <div className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-3 dark:border-neutral-800">
              <span className="text-xs text-stone-400">Slug:</span>
              <input
                type="text"
                value={form.slug || ''}
                onChange={set('slug')}
                className="flex-1 rounded border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-xs focus:border-accent focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <RichEditor
              content={form.content || ''}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              onUploadImage={uploadContentImage}
            />
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">
              Excerpt
            </label>
            <textarea
              value={form.excerpt || ''}
              onChange={set('excerpt')}
              rows={2}
              className="form-input resize-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Update</h3>
            <div className="mb-3 rounded bg-stone-50 px-3 py-2 text-xs text-stone-600 dark:bg-neutral-800 dark:text-neutral-300">
              SEO Score: <span className="font-bold">{seoScore}/100</span>
            </div>
            <div className="mb-3 rounded bg-stone-50 px-3 py-2 text-xs text-stone-600 dark:bg-neutral-800 dark:text-neutral-300">
              {wordCount} words · {charCount} characters
            </div>
            <div className="mb-3 rounded border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-semibold text-stone-700 dark:text-neutral-200">Autosave</span>
                <label className="inline-flex items-center gap-2 text-stone-600 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={autosaveEnabled}
                    onChange={(e) => setAutosaveEnabled(e.target.checked)}
                  />
                  {autosaveEnabled ? 'On' : 'Off'}
                </label>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-stone-500 dark:text-neutral-400">Every</span>
                <select
                  value={autosaveIntervalMs}
                  onChange={(e) => setAutosaveIntervalMs(Number(e.target.value))}
                  disabled={!autosaveEnabled}
                  className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-700 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                >
                  <option value={1000}>1s</option>
                  <option value={3000}>3s</option>
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                </select>
              </div>
              <p className="mb-2 text-stone-500 dark:text-neutral-400">
                Last local save:{' '}
                {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : 'Not saved yet'}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => saveDraftSnapshot(true)}
                  className="flex-1 rounded border border-stone-300 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  Save Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (AUTOSAVE_KEY) {
                      localStorage.removeItem(AUTOSAVE_KEY);
                    }
                    setLastSavedAt(null);
                    toast.success('Local draft cleared.');
                  }}
                  className="flex-1 rounded border border-stone-300 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  Clear Local Draft
                </button>
              </div>
            </div>
            <div className="mb-3 rounded bg-stone-50 px-3 py-2 text-xs text-stone-500 dark:bg-neutral-800">
              Status:{' '}
              <span
                className={`font-bold ${form.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}
              >
                {form.status?.toUpperCase()}
              </span>
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
                onClick={() => handleSave('published')}
                disabled={saving}
                className="btn-primary w-full py-2.5 disabled:opacity-40"
              >
                {saving ? 'Saving...' : scheduledAt ? 'Schedule / Publish' : 'Update & Publish'}
              </button>
              <button
                onClick={() => handleSave('private')}
                disabled={saving}
                className="w-full rounded border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Save Private
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="btn-secondary w-full py-2.5 disabled:opacity-40"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={openPreview}
                className="block w-full rounded border border-stone-300 py-2.5 text-center text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Preview
              </button>
              {form.slug && form.status === 'published' && (
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

          <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Category
              </label>
              <select value={form.category || ''} onChange={set('category')} className="form-input">
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Author
              </label>
              <input
                type="text"
                value={form.author || ''}
                onChange={set('author')}
                className="form-input"
              />
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
              Thumbnail URL
            </label>
            <label className="mb-2 block w-full cursor-pointer rounded-lg border-2 border-dashed border-stone-200 py-6 text-center transition-colors hover:border-accent dark:border-neutral-700">
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
                onClick={toggleThumbMediaPicker}
                className="flex-1 rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {showThumbMediaPicker ? 'Hide Media Library' : 'Choose From Media Library'}
              </button>
              {showThumbMediaPicker && (
                <button
                  type="button"
                  onClick={loadMediaFiles}
                  className="rounded border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  Refresh
                </button>
              )}
            </div>
            {showThumbMediaPicker && (
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
                      const selected = (form.featuredImage || '') === fileUrl;
                      return (
                        <button
                          key={`thumb-${file.$id}`}
                          type="button"
                          onClick={() => selectThumbMediaImage(file.$id)}
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
              value={form.featuredImage || ''}
              onChange={set('featuredImage')}
              className="form-input text-xs"
              placeholder="Thumbnail URL"
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
                alt=""
                className="mt-2 aspect-video w-full rounded object-cover"
              />
            )}
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
              News Image URL
            </label>
            <label className="mb-2 block w-full cursor-pointer rounded-lg border-2 border-dashed border-stone-200 py-6 text-center transition-colors hover:border-accent dark:border-neutral-700">
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
                      const selected = (form.newsImage || '') === fileUrl;
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
              value={form.newsImage || ''}
              onChange={set('newsImage')}
              className="form-input text-xs"
              placeholder="News image URL"
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
                alt=""
                className="mt-2 aspect-video w-full rounded object-cover"
              />
            )}
          </div>

          <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-semibold">SEO</h3>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Meta Title
              </label>
              <input
                type="text"
                value={form.metaTitle || ''}
                onChange={set('metaTitle')}
                className="form-input"
                maxLength={60}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Meta Description
              </label>
              <textarea
                value={form.metaDescription || ''}
                onChange={set('metaDescription')}
                className="form-input resize-none"
                rows={3}
                maxLength={155}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                OG Title
              </label>
              <input
                type="text"
                value={form.ogTitle || ''}
                onChange={set('ogTitle')}
                className="form-input"
                maxLength={100}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                OG Description
              </label>
              <textarea
                value={form.ogDescription || ''}
                onChange={set('ogDescription')}
                className="form-input resize-none"
                rows={3}
                maxLength={200}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Canonical URL (advanced)
              </label>
              <input
                type="url"
                value={form.canonicalUrl || ''}
                onChange={set('canonicalUrl')}
                className="form-input"
                placeholder="https://ceylonupdates.com/your-article"
              />
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-semibold">SEO Checklist</h3>
            {seoChecks.map((item) => (
              <p
                key={item.label}
                className={`text-xs ${item.pass ? 'text-green-600' : 'text-stone-500 dark:text-neutral-400'}`}
              >
                {item.pass ? 'PASS' : 'TODO'} {item.label}
              </p>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
