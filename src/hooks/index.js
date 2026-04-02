import { useState, useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { debounce } from '../utils/helpers';

// Generic SWR fetcher
export const fetcher = (url) => fetch(url).then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); });

// ── Articles hook with SWR ────────────────────────────────────────────────────
export function useArticles({ category, limit = 12, status = 'published' } = {}) {
  const params = new URLSearchParams({ limit, status });
  if (category) params.set('category', category);
  const { data, error, isLoading, mutate } = useSWR(`/api/articles?${params}`, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: true,
    dedupingInterval: 30000,
  });
  return { articles: data?.documents || [], total: data?.total || 0, isLoading, error, mutate };
}

// ── Infinite scroll articles ──────────────────────────────────────────────────
export function useInfiniteArticles({ category, limit = 9 } = {}) {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.documents.length) return null;
    const params = new URLSearchParams({ limit, offset: pageIndex * limit });
    if (category) params.set('category', category);
    return `/api/articles?${params}`;
  };
  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    persistSize: true,
  });
  const articles = data ? data.flatMap((d) => d.documents) : [];
  const isEmpty = data?.[0]?.documents?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.documents?.length < limit);
  return { articles, size, setSize, isLoading, isValidating, isReachingEnd };
}

// ── Search with debounce ──────────────────────────────────────────────────────
export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSWR(
    debouncedQuery.length >= 2 ? `/api/articles?search=${encodeURIComponent(debouncedQuery)}&limit=20` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return { query, setQuery, results: data?.documents || [], isLoading, total: data?.total || 0 };
}

// ── View counter with local dedup ─────────────────────────────────────────────
export function useViewCounter(articleId) {
  useEffect(() => {
    if (!articleId) return;
    const key = `viewed_${articleId}`;
    const seen = sessionStorage.getItem(key);
    if (seen) return;
    sessionStorage.setItem(key, '1');
    fetch(`/api/articles/${articleId}/view`, { method: 'POST' }).catch(() => {});
  }, [articleId]);
}

// ── Bookmark (saved articles) ─────────────────────────────────────────────────
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cu_bookmarks') || '[]');
      setBookmarks(saved);
    } catch {}
  }, []);

  const toggle = useCallback((article) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.$id === article.$id);
      const next = exists ? prev.filter((b) => b.$id !== article.$id) : [article, ...prev];
      localStorage.setItem('cu_bookmarks', JSON.stringify(next));
      return next;
    });
  }, []);

  const isBookmarked = useCallback((id) => bookmarks.some((b) => b.$id === id), [bookmarks]);

  return { bookmarks, toggle, isBookmarked };
}

// ── Local storage hook ────────────────────────────────────────────────────────
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try { return JSON.parse(localStorage.getItem(key)) ?? initialValue; } catch { return initialValue; }
  });
  const set = useCallback((v) => {
    setValue(v);
    localStorage.setItem(key, JSON.stringify(v));
  }, [key]);
  return [value, set];
}

// ── Trending articles ─────────────────────────────────────────────────────────
export function useTrending(limit = 5) {
  const { data, isLoading } = useSWR(`/api/articles?sort=views&limit=${limit}`, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 120000,
  });
  return { trending: data?.documents || [], isLoading };
}

// ── Intersection observer (lazy load, analytics) ──────────────────────────────
export function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

// ── Reading progress bar ──────────────────────────────────────────────────────
export function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);
  return progress;
}

// ── Window size ───────────────────────────────────────────────────────────────
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

// ── Copy to clipboard ─────────────────────────────────────────────────────────
export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, []);
  return { copied, copy };
}
