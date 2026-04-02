import { databases, DB_ID, ARTICLES_COL, Query, ID } from '../../../lib/appwrite';
import { articleSchema } from '../../../utils/validators';

const ALLOWED_ORIGINS = process.env.NEXT_PUBLIC_SITE_URL || 'https://ceylonupdates.com';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map();
function rateLimit(ip, max = 60, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count <= max;
}

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';

  // Rate limiting
  if (!rateLimit(ip, 100, 60000)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  // CORS
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET /api/articles ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const {
        category, status = 'published', limit = '12', offset = '0',
        sort = 'publishedAt', search, featured, tag,
      } = req.query;

      const queries = [Query.limit(Math.min(parseInt(limit), 50)), Query.offset(parseInt(offset))];

      if (status && status !== 'all') queries.push(Query.equal('status', status));
      if (category) queries.push(Query.equal('category', category));
      if (featured === 'true') queries.push(Query.equal('isFeatured', true));
      if (tag) queries.push(Query.search('tags', tag));
      if (search) queries.push(Query.search('title', search));

      if (sort === 'views') queries.push(Query.orderDesc('views'));
      else queries.push(Query.orderDesc('publishedAt'));

      const result = await databases.listDocuments(DB_ID, ARTICLES_COL, queries);

      // Cache headers
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

      return res.status(200).json({
        documents: result.documents,
        total: result.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (err) {
      console.error('[API] GET /articles error:', err);
      return res.status(500).json({ error: 'Failed to fetch articles', details: err.message });
    }
  }

  // ── POST /api/articles ─────────────────────────────────────────────────────
  if (req.method === 'POST') {
    // Check auth token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const body = req.body;
      const parsed = articleSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Validation failed', issues: parsed.error.issues });
      }

      const data = {
        ...parsed.data,
        views: 0,
        publishedAt: parsed.data.status === 'published' ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      };

      const doc = await databases.createDocument(DB_ID, ARTICLES_COL, ID.unique(), data);
      return res.status(201).json(doc);
    } catch (err) {
      console.error('[API] POST /articles error:', err);
      if (err.code === 409) return res.status(409).json({ error: 'Slug already exists' });
      return res.status(500).json({ error: 'Failed to create article' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
