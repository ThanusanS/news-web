import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isValid } from 'date-fns';

// Tailwind class merger
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format date safely
export function formatDate(dateStr, pattern = 'MMMM d, yyyy') {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isValid(d) ? format(d, pattern) : '';
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '';
}

// Format number with locale
export function formatNumber(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

// Truncate string
export function truncate(str, length = 150) {
  if (!str) return '';
  return str.length > length ? str.slice(0, length).trim() + '...' : str;
}

// Strip HTML tags
export function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Estimate reading time
export function readingTime(content = '') {
  const text = stripHtml(content);
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return { words, minutes, text: `${minutes} min read` };
}

// Generate excerpt from HTML content
export function generateExcerpt(content = '', length = 160) {
  const text = stripHtml(content);
  return truncate(text, length);
}

// Slugify title
export function toSlug(str = '') {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Validate email
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Get category color classes
export function getCategoryColors(category) {
  const map = {
    'sri-lanka':    { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200' },
    'tech-news':    { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200' },
    'ai-tutorials': { bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200' },
    'programming':  { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-200' },
    'world':        { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200' },
    'business':     { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200' },
  };
  return map[category] || { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' };
}

// Category emoji
export function getCategoryEmoji(category) {
  const map = {
    'sri-lanka': 'SL', 'tech-news': 'TECH', 'ai-tutorials': 'AI',
    'programming': 'CODE', 'world': 'WORLD', 'business': 'BIZ',
  };
  return map[category] || 'NEWS';
}

// Debounce
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Deep clone
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Safe JSON parse
export function safeJson(str, fallback = null) {
  try { return JSON.parse(str); } catch { return fallback; }
}

// Pagination helper
export function paginate(total, page, perPage) {
  const totalPages = Math.ceil(total / perPage);
  return {
    page,
    perPage,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    from: (page - 1) * perPage + 1,
    to: Math.min(page * perPage, total),
  };
}

// Build OG image URL (using dynamic og API)
export function buildOgImageUrl(title, category) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://ceylonupdates.com';
  const params = new URLSearchParams({ title: title?.slice(0, 80) || '', category: category || '' });
  return `${base}/api/og?${params}`;
}
