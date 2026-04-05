import { useState, useEffect, useRef } from 'react';
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
  { value: 'sri-lanka', label: 'Sri Lanka News' },
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
  const AUTOSAVE_PREF_KEY = 'ceylonupdates.newpost.autosave.pref.v1';
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
    status: 'draft',
  });
  const [scheduledAt, setScheduledAt] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showNewsMediaPicker, setShowNewsMediaPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [autosaveIntervalMs, setAutosaveIntervalMs] = useState(1000);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('neutral and factual');
  const [aiWordTarget, setAiWordTarget] = useState(1200);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiAttempt, setAiAttempt] = useState(0);
  const [aiGenerationMeta, setAiGenerationMeta] = useState({ provider: '', model: '' });
  const [trendSeed, setTrendSeed] = useState('');
  const [trendRegion, setTrendRegion] = useState('Worldwide');
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendData, setTrendData] = useState({
    trendingTopics: [],
    headlineIdeas: [],
    keywords: [],
  });
  const [headlineLoading, setHeadlineLoading] = useState(false);
  const [headlineIdeas, setHeadlineIdeas] = useState([]);
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkSuggestions, setLinkSuggestions] = useState([]);
  const [seoFixLoading, setSeoFixLoading] = useState(false);
  const [factCheckLoading, setFactCheckLoading] = useState(false);
  const [assistantRunning, setAssistantRunning] = useState(false);
  const [assistantStep, setAssistantStep] = useState('');
  const [assistantStatus, setAssistantStatus] = useState({
    headline: 'idle',
    links: 'idle',
    seo: 'idle',
    fact: 'idle',
  });
  const [factCheckReport, setFactCheckReport] = useState({
    riskScore: null,
    summary: '',
    flags: [],
    recommendedSources: [],
  });
  const [aiStatusLoading, setAiStatusLoading] = useState(false);
  const [aiProviderStatus, setAiProviderStatus] = useState({
    providerOrder: [],
    activeCount: 0,
    providers: {},
  });
  const suppressAutosaveRef = useRef(false);

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
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.form) {
          setForm((prev) => ({ ...prev, ...parsed.form }));
        }
        if (parsed?.scheduledAt) {
          setScheduledAt(parsed.scheduledAt);
        }
        if (parsed?.ts) {
          setLastSavedAt(parsed.ts);
        }
      }

      const prefRaw = localStorage.getItem(AUTOSAVE_PREF_KEY);
      if (prefRaw) {
        const prefs = JSON.parse(prefRaw);
        if (typeof prefs?.enabled === 'boolean') {
          setAutosaveEnabled(prefs.enabled);
        }
        if ([1000, 3000, 5000, 10000].includes(Number(prefs?.intervalMs))) {
          setAutosaveIntervalMs(Number(prefs.intervalMs));
        }
      }
    } catch {}
  }, []);

  function saveDraftSnapshot(showToast = false) {
    if (suppressAutosaveRef.current) {
      return;
    }

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
    try {
      localStorage.setItem(
        AUTOSAVE_PREF_KEY,
        JSON.stringify({ enabled: autosaveEnabled, intervalMs: autosaveIntervalMs })
      );
    } catch {}
  }, [autosaveEnabled, autosaveIntervalMs]);

  useEffect(() => {
    if (!autosaveEnabled) return undefined;
    const timer = setTimeout(() => {
      saveDraftSnapshot(false);
    }, autosaveIntervalMs);
    return () => clearTimeout(timer);
  }, [form, scheduledAt, autosaveEnabled, autosaveIntervalMs]);

  useEffect(() => {
    loadAiProviderStatus();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function loadAiProviderStatus() {
    setAiStatusLoading(true);
    try {
      const response = await fetch('/api/admin/ai-status');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load AI provider status.');
      }
      setAiProviderStatus({
        providerOrder: Array.isArray(data?.providerOrder) ? data.providerOrder : [],
        activeCount: Number(data?.activeCount) || 0,
        providers: data?.providers && typeof data.providers === 'object' ? data.providers : {},
      });
    } catch (err) {
      toast.error(err?.message || 'Failed to load AI provider status.');
    } finally {
      setAiStatusLoading(false);
    }
  }

  function normalizeAiText(input) {
    if (typeof input === 'string') {
      const text = input.trim();
      return text === '[object Object]' ? '' : text;
    }
    if (input && typeof input === 'object') {
      const candidate =
        input.topic ||
        input.title ||
        input.headline ||
        input.keyword ||
        input.text ||
        input.name ||
        input.label;
      if (typeof candidate === 'string') {
        return candidate.trim();
      }
    }
    const fallback = String(input || '').trim();
    return fallback === '[object Object]' ? '' : fallback;
  }

  function resetComposer(showToast = true) {
    suppressAutosaveRef.current = false;
    setForm({
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
      status: 'draft',
    });
    setScheduledAt('');
    setAiTopic('');
    setAiAttempt(0);
    localStorage.removeItem(AUTOSAVE_KEY);
    setLastSavedAt(null);
    if (showToast) {
      toast.success('Composer cleared. Ready for a new post.');
    }
  }

  function openPreview() {
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

  async function handleGenerateWithAI(topicOverride = '') {
    const isClickEvent =
      topicOverride &&
      typeof topicOverride === 'object' &&
      typeof topicOverride.preventDefault === 'function';
    const normalizedOverride = isClickEvent ? '' : topicOverride;
    const seedTopic = normalizeAiText(normalizedOverride || aiTopic);
    if (!seedTopic) {
      toast.error('Please enter a topic for AI generation.');
      return;
    }

    if (topicOverride) {
      setAiTopic(seedTopic);
    }

    setAiGenerating(true);
    setAiAttempt(0);
    setAiGenerationMeta({ provider: '', model: '' });
    try {
      const maxAttempts = 3;
      let generated = null;
      let generatedMeta = { provider: '', model: '' };
      let lastError = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        setAiAttempt(attempt);
        const response = await fetch('/api/admin/generate-article', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: seedTopic,
            category: form.category || 'world',
            minWords: aiWordTarget,
            tone: aiTone,
          }),
        });

        const raw = await response.text();
        let data = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          data = {};
        }
        if (response.ok && data?.article) {
          generated = data.article;
          generatedMeta = {
            provider: String(data?.generation?.provider || '').trim(),
            model: String(data?.generation?.model || '').trim(),
          };
          break;
        }

        const errorText = [data?.error, data?.details].filter(Boolean).join(' - ');
        lastError = errorText || 'AI generation failed.';

        // Retry automatically when backend says the article is below target length.
        const shouldRetryForLength = response.status === 422;
        if (!shouldRetryForLength || attempt === maxAttempts) {
          throw new Error(lastError);
        }
      }

      if (!generated?.content || !generated?.title) {
        throw new Error('AI did not return a valid article payload.');
      }

      setForm((f) => ({
        ...f,
        title: generated.title || f.title,
        slug: generated.slug || f.slug,
        category: generated.category || f.category || 'world',
        author: generated.author || f.author || 'CeylonUpdates Editorial Desk',
        excerpt: generated.excerpt || f.excerpt,
        content: generated.content || f.content,
        metaTitle: generated.metaTitle || f.metaTitle,
        metaDescription: generated.metaDescription || f.metaDescription,
        ogTitle: generated.ogTitle || f.ogTitle,
        ogDescription: generated.ogDescription || f.ogDescription,
        focusKeyword: generated.focusKeyword || f.focusKeyword,
      }));

      setAiGenerationMeta(generatedMeta);

      toast.success(
        `AI draft created (${generated.generatedWordCount || 0} words). Review and publish when ready.`
      );
    } catch (err) {
      toast.error(err?.message || 'Failed to generate article with AI.');
    }
    setAiAttempt(0);
    setAiGenerating(false);
  }

  async function handleFindTrending() {
    if (!trendSeed.trim()) {
      toast.error('Enter a seed term like Sri Lanka or AI.');
      return;
    }

    setTrendLoading(true);
    try {
      const response = await fetch('/api/admin/trending-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: trendSeed, region: trendRegion }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch trending ideas.');
      }

      setTrendData({
        trendingTopics: Array.isArray(data?.trendingTopics)
          ? data.trendingTopics.map(normalizeAiText).filter(Boolean)
          : [],
        headlineIdeas: Array.isArray(data?.headlineIdeas)
          ? data.headlineIdeas.map(normalizeAiText).filter(Boolean)
          : [],
        keywords: Array.isArray(data?.keywords)
          ? data.keywords.map(normalizeAiText).filter(Boolean)
          : [],
      });
      toast.success(`Trending ideas loaded (${trendRegion}).`);
    } catch (err) {
      toast.error(err?.message || 'Failed to fetch trending ideas.');
    }
    setTrendLoading(false);
  }

  async function handleGenerateHeadlineIdeas() {
    const topic = String(form.title || aiTopic || trendSeed).trim();
    if (!topic) {
      toast.error('Add a title/topic first for headline ideas.');
      return;
    }

    setHeadlineLoading(true);
    try {
      const response = await fetch('/api/admin/headline-ab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, content: form.content, count: 8 }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate headline ideas.');
      }
      setHeadlineIdeas(Array.isArray(data?.headlines) ? data.headlines : []);
      toast.success('Headline ideas ready.');
      return true;
    } catch (err) {
      toast.error(err?.message || 'Failed to generate headline ideas.');
      return false;
    } finally {
      setHeadlineLoading(false);
    }
  }

  async function handleRecommendInternalLinks() {
    if (!form.title && !form.content) {
      toast.error('Write some title/content first.');
      return;
    }

    setLinkLoading(true);
    try {
      const response = await fetch('/api/admin/internal-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          currentSlug: form.slug,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to suggest internal links.');
      }
      setLinkSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
      toast.success('Internal link suggestions ready.');
      return true;
    } catch (err) {
      toast.error(err?.message || 'Failed to suggest internal links.');
      return false;
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleSeoAutoFix() {
    if (!form.title && !form.content) {
      toast.error('Write title/content before SEO auto-fix.');
      return;
    }

    setSeoFixLoading(true);
    try {
      const response = await fetch('/api/admin/seo-autofix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt,
          content: form.content,
          focusKeyword: form.focusKeyword,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to auto-fix SEO.');
      }

      setForm((f) => ({
        ...f,
        excerpt: data?.excerpt || f.excerpt,
        focusKeyword: data?.focusKeyword || f.focusKeyword,
        metaTitle: data?.metaTitle || f.metaTitle,
        metaDescription: data?.metaDescription || f.metaDescription,
      }));
      toast.success('SEO fields optimized.');
      return true;
    } catch (err) {
      toast.error(err?.message || 'Failed to auto-fix SEO.');
      return false;
    } finally {
      setSeoFixLoading(false);
    }
  }

  async function handleFactCheckGuard() {
    if (!form.title && !form.content) {
      toast.error('Write title/content before running fact-check.');
      return;
    }

    setFactCheckLoading(true);
    try {
      const response = await fetch('/api/admin/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to run fact-check guard.');
      }

      setFactCheckReport({
        riskScore: Number.isFinite(Number(data?.riskScore)) ? Number(data.riskScore) : null,
        summary: data?.summary || '',
        flags: Array.isArray(data?.flags) ? data.flags : [],
        recommendedSources: Array.isArray(data?.recommendedSources) ? data.recommendedSources : [],
      });
      toast.success('Fact-check analysis complete.');
      return true;
    } catch (err) {
      toast.error(err?.message || 'Failed to run fact-check guard.');
      return false;
    } finally {
      setFactCheckLoading(false);
    }
  }

  async function handleRunAiAssistant() {
    if (!form.title && !form.content) {
      toast.error('Write title/content first to run AI assistant.');
      return;
    }

    setAssistantRunning(true);
    setAssistantStatus({
      headline: 'idle',
      links: 'idle',
      seo: 'idle',
      fact: 'idle',
    });

    setAssistantStep('Generating headline ideas...');
    setAssistantStatus((s) => ({ ...s, headline: 'running' }));
    const headlineOk = await handleGenerateHeadlineIdeas();
    setAssistantStatus((s) => ({ ...s, headline: headlineOk ? 'success' : 'error' }));

    setAssistantStep('Finding internal links...');
    setAssistantStatus((s) => ({ ...s, links: 'running' }));
    const linksOk = await handleRecommendInternalLinks();
    setAssistantStatus((s) => ({ ...s, links: linksOk ? 'success' : 'error' }));

    setAssistantStep('Optimizing SEO fields...');
    setAssistantStatus((s) => ({ ...s, seo: 'running' }));
    const seoOk = await handleSeoAutoFix();
    setAssistantStatus((s) => ({ ...s, seo: seoOk ? 'success' : 'error' }));

    setAssistantStep('Running fact-check guard...');
    setAssistantStatus((s) => ({ ...s, fact: 'running' }));
    const factOk = await handleFactCheckGuard();
    setAssistantStatus((s) => ({ ...s, fact: factOk ? 'success' : 'error' }));

    setAssistantStep('Done');
    if (headlineOk && linksOk && seoOk && factOk) {
      toast.success('AI Assistant completed all checks.');
    } else {
      toast.error('AI Assistant finished with some failed steps.');
    }
    setAssistantRunning(false);
    setTimeout(() => setAssistantStep(''), 1200);
  }

  async function handleSubmit(action) {
    setSaving(true);
    try {
      if ((action === 'published' || action === 'private') && !form.featuredImage) {
        toast.error('Please select a thumbnail image before publishing/private save.');
        setSaving(false);
        return;
      }

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
      // Stop pending autosave timers from writing the just-published draft back to localStorage.
      suppressAutosaveRef.current = true;
      localStorage.removeItem(AUTOSAVE_KEY);
      setLastSavedAt(null);
      router.push('/admin/posts');
    } catch (err) {
      toast.error('Failed to save: ' + err.message);
    }
    setSaving(false);
  }

  const contentHtml = String(form.content || '');
  const normalizedContent = contentHtml.toLowerCase();
  const contentText = contentHtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const normalizedContentText = contentText.toLowerCase();
  const normalizedKeyword = String(form.focusKeyword || '')
    .trim()
    .toLowerCase();
  const seoTitle = String(form.metaTitle || form.title || '').trim();
  const seoDescription = String(form.metaDescription || form.excerpt || '').trim();
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
    { label: 'Has featured image', pass: !!form.featuredImage },
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
  const textContent = contentText;
  const wordCount = textContent ? textContent.split(' ').length : 0;
  const charCount = textContent.length;
  const currentWorkingProvider = (aiProviderStatus.providerOrder || []).find((provider) => {
    const status = aiProviderStatus.providers?.[provider] || {};
    const configured = Boolean(status.configured);
    const reachable = provider === 'ollama' ? Boolean(status.reachable) : true;
    return configured && reachable;
  });
  const currentWorkingModel = currentWorkingProvider
    ? String(aiProviderStatus.providers?.[currentWorkingProvider]?.model || '').trim()
    : '';
  const currentWorkingClass = currentWorkingProvider
    ? 'text-green-700 dark:text-green-300'
    : 'text-red-700 dark:text-red-300';

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
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">AI Provider Status</h3>
              <button
                type="button"
                onClick={loadAiProviderStatus}
                disabled={aiStatusLoading}
                className="rounded border border-stone-200 px-2 py-1 text-xs font-semibold text-stone-700 hover:border-accent disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200"
              >
                {aiStatusLoading ? 'Checking...' : 'Refresh'}
              </button>
            </div>
            <p className="mb-3 text-xs text-stone-500 dark:text-neutral-400">
              Active providers: {aiProviderStatus.activeCount}
              {aiProviderStatus.providerOrder.length > 0
                ? ` | Order: ${aiProviderStatus.providerOrder.join(' -> ')}`
                : ''}
            </p>
            <p className={`mb-3 text-xs font-medium ${currentWorkingClass}`}>
              Now active: {currentWorkingProvider || 'none'}
              {currentWorkingModel ? ` / ${currentWorkingModel}` : ''}
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              {['openrouter', 'gemini', 'groq', 'ollama', 'hf', 'openai'].map((provider) => {
                const status = aiProviderStatus.providers?.[provider] || {};
                const configured = Boolean(status.configured);
                const reachable = provider === 'ollama' ? Boolean(status.reachable) : true;
                const ready = configured && reachable;

                const className = ready
                  ? 'border-green-200 text-green-700 dark:border-green-900 dark:text-green-300'
                  : 'border-stone-200 text-stone-500 dark:border-neutral-700 dark:text-neutral-400';

                return (
                  <div key={provider} className={`rounded border px-2 py-1 ${className}`}>
                    <p className="font-semibold capitalize">{provider}</p>
                    <p>{ready ? 'ready' : configured ? 'configured' : 'not configured'}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Trending News Finder</h3>
            <p className="mb-3 text-xs text-stone-500 dark:text-neutral-400">
              Find trending topics, headline ideas, and SEO keywords from a seed term.
            </p>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
              Seed Input
            </label>
            <input
              type="text"
              value={trendSeed}
              onChange={(e) => setTrendSeed(e.target.value)}
              placeholder="Example: Sri Lanka or AI"
              className="form-input mb-3"
            />
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
              Focus Region
            </label>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTrendRegion('Sri Lanka')}
                className={`rounded border px-2 py-1 text-xs font-semibold ${
                  trendRegion === 'Sri Lanka'
                    ? 'border-accent text-accent'
                    : 'border-stone-200 text-stone-600 dark:border-neutral-700 dark:text-neutral-300'
                }`}
              >
                Sri Lanka
              </button>
              <button
                type="button"
                onClick={() => setTrendRegion('Worldwide')}
                className={`rounded border px-2 py-1 text-xs font-semibold ${
                  trendRegion === 'Worldwide'
                    ? 'border-accent text-accent'
                    : 'border-stone-200 text-stone-600 dark:border-neutral-700 dark:text-neutral-300'
                }`}
              >
                Global
              </button>
            </div>
            <button
              type="button"
              onClick={handleFindTrending}
              disabled={trendLoading}
              className="btn-secondary w-full py-2.5 disabled:opacity-40"
            >
              {trendLoading ? 'Finding Trends...' : 'Find Trending Ideas'}
            </button>

            {(trendData.trendingTopics.length > 0 ||
              trendData.headlineIdeas.length > 0 ||
              trendData.keywords.length > 0) && (
              <div className="mt-3 space-y-3 text-xs">
                {trendData.trendingTopics.length > 0 && (
                  <div>
                    <p className="mb-1 font-semibold text-stone-700 dark:text-neutral-200">
                      Trending Topics
                    </p>
                    <ul className="space-y-1 text-stone-600 dark:text-neutral-300">
                      {trendData.trendingTopics.slice(0, 5).map((item) => (
                        <li key={`topic-${item}`} className="flex flex-col gap-1 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => setAiTopic(item)}
                            className="flex-1 rounded border border-stone-200 px-2 py-1 text-left hover:border-accent dark:border-neutral-700"
                          >
                            {item}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateWithAI(item)}
                            disabled={aiGenerating}
                            className="w-full rounded border border-stone-200 px-2 py-1 font-semibold text-stone-700 hover:border-accent disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 sm:w-auto"
                          >
                            Generate Now
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trendData.headlineIdeas.length > 0 && (
                  <div>
                    <p className="mb-1 font-semibold text-stone-700 dark:text-neutral-200">
                      Headline Ideas
                    </p>
                    <ul className="space-y-1 text-stone-600 dark:text-neutral-300">
                      {trendData.headlineIdeas.slice(0, 5).map((item) => (
                        <li key={`headline-${item}`}>
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, title: item }))}
                            className="w-full rounded border border-stone-200 px-2 py-1 text-left hover:border-accent dark:border-neutral-700"
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trendData.keywords.length > 0 && (
                  <div>
                    <p className="mb-1 font-semibold text-stone-700 dark:text-neutral-200">
                      Keywords
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {trendData.keywords.slice(0, 8).map((item) => (
                        <button
                          key={`kw-${item}`}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, focusKeyword: item }))}
                          className="rounded border border-stone-200 px-2 py-1 text-stone-600 hover:border-accent dark:border-neutral-700 dark:text-neutral-300"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">AI News Generator</h3>
            <p className="mb-3 text-xs text-stone-500 dark:text-neutral-400">
              Paste a topic and generate a full SEO-ready draft directly into this editor.
            </p>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
              Topic
            </label>
            <textarea
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              rows={3}
              placeholder="Example: Sri Lanka inflation 2026"
              className="form-input mb-3 resize-none"
            />

            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Target Words
                </label>
                <input
                  type="number"
                  min={1000}
                  step={100}
                  value={aiWordTarget}
                  onChange={(e) => setAiWordTarget(Number(e.target.value) || 1200)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                  Tone
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="form-input"
                >
                  <option value="neutral and factual">Neutral</option>
                  <option value="investigative and analytical">Analytical</option>
                  <option value="explainer style for general audience">Explainer</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGenerateWithAI()}
              disabled={aiGenerating}
              className="btn-primary w-full py-2.5 disabled:opacity-40"
            >
              {aiGenerating ? `Generating Draft... (${aiAttempt || 1}/3)` : 'Generate With AI'}
            </button>
            {aiGenerating && (
              <p className="mt-2 text-center text-xs text-stone-500 dark:text-neutral-400">
                Auto retry active if minimum word count is not met.
              </p>
            )}
            {!aiGenerating && (aiGenerationMeta.provider || aiGenerationMeta.model) && (
              <p className="mt-2 text-center text-xs text-stone-500 dark:text-neutral-400">
                Generated by {aiGenerationMeta.provider || 'unknown provider'}
                {aiGenerationMeta.model ? ` / ${aiGenerationMeta.model}` : ''}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">AI Assistant Panel</h3>
            <p className="mb-3 text-xs text-stone-500 dark:text-neutral-400">
              Run all AI checks in one click: Headline A/B, Internal Links, SEO Auto-Fix, and
              Fact-Check Guard.
            </p>
            <button
              type="button"
              onClick={handleRunAiAssistant}
              disabled={assistantRunning}
              className="btn-secondary w-full py-2.5 disabled:opacity-40"
            >
              {assistantRunning ? 'Running AI Assistant...' : 'Run All AI Checks'}
            </button>
            {assistantStep && (
              <p className="mt-2 text-center text-xs text-stone-500 dark:text-neutral-400">
                {assistantStep}
              </p>
            )}
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              {[
                ['Headlines', assistantStatus.headline],
                ['Links', assistantStatus.links],
                ['SEO', assistantStatus.seo],
                ['Fact Check', assistantStatus.fact],
              ].map(([label, status]) => {
                const statusClass =
                  status === 'success'
                    ? 'border-green-200 text-green-700 dark:border-green-900 dark:text-green-300'
                    : status === 'error'
                      ? 'border-red-200 text-red-700 dark:border-red-900 dark:text-red-300'
                      : status === 'running'
                        ? 'border-amber-200 text-amber-700 dark:border-amber-900 dark:text-amber-300'
                        : 'border-stone-200 text-stone-500 dark:border-neutral-700 dark:text-neutral-400';

                return (
                  <div
                    key={label}
                    className={`rounded border px-2 py-1 font-medium ${statusClass}`}
                  >
                    {label}: {status}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Headline A/B Generator</h3>
            <button
              type="button"
              onClick={handleGenerateHeadlineIdeas}
              disabled={headlineLoading}
              className="btn-secondary w-full py-2.5 disabled:opacity-40"
            >
              {headlineLoading ? 'Generating Headlines...' : 'Generate Headline Ideas'}
            </button>
            {headlineIdeas.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs">
                {headlineIdeas.slice(0, 8).map((item) => (
                  <li key={`ab-${item}`}>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, title: item }))}
                      className="w-full rounded border border-stone-200 px-2 py-1 text-left text-stone-700 hover:border-accent dark:border-neutral-700 dark:text-neutral-200"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Internal Link Recommender</h3>
            <button
              type="button"
              onClick={handleRecommendInternalLinks}
              disabled={linkLoading}
              className="btn-secondary w-full py-2.5 disabled:opacity-40"
            >
              {linkLoading ? 'Finding Links...' : 'Recommend Internal Links'}
            </button>
            {linkSuggestions.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs">
                {linkSuggestions.map((item, idx) => (
                  <li
                    key={`link-${item.slug}-${idx}`}
                    className="rounded border border-stone-200 p-2 dark:border-neutral-700"
                  >
                    <p className="font-semibold text-stone-700 dark:text-neutral-200">
                      {item.anchorText}
                    </p>
                    <p className="text-stone-500 dark:text-neutral-400">{item.url}</p>
                    {item.reason && (
                      <p className="mt-1 text-stone-500 dark:text-neutral-400">{item.reason}</p>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          content: `${f.content || ''}<p><a href="${item.url}">${item.anchorText}</a></p>`,
                        }))
                      }
                      className="mt-2 rounded border border-stone-300 px-2 py-1 font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      Add Link To Content
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">SEO Auto-Fix Agent</h3>
            <button
              type="button"
              onClick={handleSeoAutoFix}
              disabled={seoFixLoading}
              className="btn-secondary w-full py-2.5 disabled:opacity-40"
            >
              {seoFixLoading ? 'Optimizing SEO...' : 'Auto-Fix SEO Fields'}
            </button>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Fact-Check Guard</h3>
            <button
              type="button"
              onClick={handleFactCheckGuard}
              disabled={factCheckLoading}
              className="btn-secondary w-full py-2.5 disabled:opacity-40"
            >
              {factCheckLoading ? 'Checking Facts...' : 'Run Fact-Check Guard'}
            </button>

            {factCheckReport.riskScore !== null && (
              <div className="mt-3 text-xs">
                <p className="font-semibold text-stone-700 dark:text-neutral-200">
                  Risk Score: {factCheckReport.riskScore}/100
                </p>
                {factCheckReport.summary && (
                  <p className="mt-1 text-stone-600 dark:text-neutral-300">
                    {factCheckReport.summary}
                  </p>
                )}
                {factCheckReport.flags.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {factCheckReport.flags.slice(0, 6).map((flag, idx) => (
                      <li
                        key={`fact-flag-${idx}`}
                        className="rounded border border-stone-200 p-2 text-stone-600 dark:border-neutral-700 dark:text-neutral-300"
                      >
                        <p className="font-semibold">{flag.claim}</p>
                        <p>{flag.issue}</p>
                        {flag.suggestion && <p className="mt-1">Suggestion: {flag.suggestion}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Publish box */}
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-semibold">Publish</h3>
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
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => saveDraftSnapshot(true)}
                  className="rounded border border-stone-300 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  Save Now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(AUTOSAVE_KEY);
                    setLastSavedAt(null);
                    toast.success('Local draft cleared.');
                  }}
                  className="rounded border border-stone-300 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  Clear Local Draft
                </button>
              </div>
              <button
                type="button"
                onClick={() => resetComposer(true)}
                className="mt-2 w-full rounded border border-stone-300 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
              >
                Start Fresh
              </button>
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
              {(form.slug || form.title || form.content) && (
                <button
                  type="button"
                  onClick={openPreview}
                  className="block w-full rounded border border-stone-300 py-2.5 text-center text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  Preview
                </button>
              )}
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
                alt="News preview"
                className="mt-2 aspect-video w-full rounded object-cover"
              />
            )}
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
