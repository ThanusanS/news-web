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
  const REVISIONS_KEY = AUTOSAVE_KEY ? `${AUTOSAVE_KEY}.revisions` : null;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [revisions, setRevisions] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showThumbMediaPicker, setShowThumbMediaPicker] = useState(false);
  const [showNewsMediaPicker, setShowNewsMediaPicker] = useState(false);

  useEffect(() => {
    if (!id) return;
    getArticleById(id)
      .then((doc) => {
        const baseForm = {
          ...doc,
          tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : doc.tags || '',
        };
        let restored = null;
        try {
          if (AUTOSAVE_KEY) {
            restored = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null');
          }
        } catch {}

        setForm(restored?.form ? { ...baseForm, ...restored.form } : baseForm);
        const scheduleValue = restored?.scheduledAt
          || (doc.publishedAt ? new Date(doc.publishedAt).toISOString().slice(0, 16) : '');
        setScheduledAt(scheduleValue);
        try {
          if (REVISIONS_KEY) {
            const revRaw = localStorage.getItem(REVISIONS_KEY);
            if (revRaw) {
              const parsedRevs = JSON.parse(revRaw);
              if (Array.isArray(parsedRevs)) {
                setRevisions(parsedRevs);
              }
            }
          }
        } catch {}
        setLoading(false);
      })
      .catch(() => {
        toast.error('Article not found.');
        router.push('/admin/posts');
      });
  }, [id, REVISIONS_KEY]);

  useEffect(() => {
    if (!AUTOSAVE_KEY || !form) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ form, scheduledAt, ts: Date.now() }));
      } catch {}
    }, 1000);
    return () => clearTimeout(timer);
  }, [AUTOSAVE_KEY, form, scheduledAt]);

  useEffect(() => {
    if (!REVISIONS_KEY || !form) return;
    try {
      localStorage.setItem(REVISIONS_KEY, JSON.stringify(revisions));
    } catch {}
  }, [REVISIONS_KEY, revisions, form]);

  useEffect(() => {
    if (!form || (!form.title && !form.content)) return;
    const interval = setInterval(() => {
      createRevision('Auto');
    }, 120000);
    return () => clearInterval(interval);
  }, [form?.title, form?.content, scheduledAt]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function createRevision(label = 'Manual') {
    if (!form || (!form.title && !form.content)) return;
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

      const tagsArray =
        typeof form.tags === 'string'
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : form.tags || [];

      const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...rest } =
        form;

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
        tags: tagsArray,
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
      if (AUTOSAVE_KEY) localStorage.removeItem(AUTOSAVE_KEY);
      if (REVISIONS_KEY) localStorage.removeItem(REVISIONS_KEY);
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

  const textContent = String(form?.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent ? textContent.split(' ').length : 0;
  const charCount = textContent.length;
  const imageTags = String(form?.content || '').match(/<img\b[^>]*>/gi) || [];
  const imageAltCount = imageTags.filter((tag) => /\salt="[^\"]*\S[^\"]*"/i.test(tag)).length;
  const seoChecks = [
    { label: 'Title length between 30-60', pass: (form?.title || '').length >= 30 && (form?.title || '').length <= 60 },
    { label: 'Meta description 120-155 chars', pass: (form?.metaDescription || '').length >= 120 && (form?.metaDescription || '').length <= 155 },
    { label: 'Focus keyword appears in title', pass: !!form?.focusKeyword && (form?.title || '').toLowerCase().includes(form.focusKeyword.toLowerCase()) },
    { label: 'Focus keyword appears early in content', pass: !!form?.focusKeyword && String(form?.content || '').toLowerCase().slice(0, 800).includes(form.focusKeyword.toLowerCase()) },
    { label: 'Has featured image', pass: !!form?.featuredImage },
    { label: 'Images include alt text', pass: imageTags.length === 0 || imageAltCount === imageTags.length },
    { label: 'Has internal link', pass: /href="\//i.test(String(form?.content || '')) },
    { label: 'Has external link', pass: /href="https?:\/\//i.test(String(form?.content || '')) },
  ];
  const seoScore = Math.round((seoChecks.filter((item) => item.pass).length / seoChecks.length) * 100);

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
                onClick={() => createRevision('Manual')}
                disabled={saving || (!form?.title && !form?.content)}
                className="w-full rounded border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Save Revision Snapshot
              </button>
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
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Tags
              </label>
              <input
                type="text"
                value={form.tags || ''}
                onChange={set('tags')}
                className="form-input"
                placeholder="Tag1, Tag2, Tag3"
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
