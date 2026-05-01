import { databases, DB_ID, ARTICLES_COL, Query, createArticle } from '../../../lib/appwrite';
import { articleSchema } from '../../../utils/validators';

const ALLOWED_ORIGINS = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ceylonupdates.me';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map();
function rateLimit(ip, max = 60, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
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
        category,
        status = 'published',
        limit = '12',
        offset = '0',
        sort = 'publishedAt',
        search,
        featured,
        tag,
      } = req.query;

      const parsedLimit = Math.min(parseInt(limit), 50);
      const parsedOffset = Number.isFinite(parseInt(offset)) ? parseInt(offset) : 0;
      const normalizedSearch = typeof search === 'string' ? search.trim() : '';
      const normalizedTag = typeof tag === 'string' ? tag.trim() : '';
      const nowIso = new Date().toISOString();

      const filterQueries = [];
      if (status && status !== 'all') filterQueries.push(Query.equal('status', status));
      if (category) filterQueries.push(Query.equal('category', category));
      if (featured === 'true') filterQueries.push(Query.equal('isFeatured', true));

      const baseQueries = [Query.limit(parsedLimit), Query.offset(parsedOffset), ...filterQueries];

      const sortDocs = (docs) => {
        if (sort === 'views') {
          return docs.sort((a, b) => (b.views || 0) - (a.views || 0));
        }
        return docs.sort((a, b) => {
          const left = a.publishedAt || a.$createdAt || '';
          const right = b.publishedAt || b.$createdAt || '';
          return right.localeCompare(left);
        });
      };

      const filterPublished = (docs) => {
        if (status !== 'published') return docs;
        return docs.filter((doc) => !doc.publishedAt || String(doc.publishedAt) <= nowIso);
      };

      const runSearchQueries = async (querySets) => {
        const seen = new Set();
        const collected = [];
        for (const qs of querySets) {
          try {
            const result = await databases.listDocuments(DB_ID, ARTICLES_COL, qs);
            for (const doc of result.documents || []) {
              if (seen.has(doc.$id)) continue;
              seen.add(doc.$id);
              collected.push(doc);
            }
          } catch {
            continue;
          }
        }
        return collected;
      };

      const fallbackFilter = (docs, term) => {
        const needle = term.toLowerCase();
        return docs.filter((doc) => {
          const tags = Array.isArray(doc.tags) ? doc.tags.join(' ') : '';
          const haystack =
            `${doc.title || ''} ${doc.excerpt || ''} ${doc.content || ''} ${tags}`.toLowerCase();
          return haystack.includes(needle);
        });
      };

      let result;
      if (normalizedSearch || normalizedTag) {
        const querySets = [];
        if (normalizedSearch) {
          querySets.push([...baseQueries, Query.search('title', normalizedSearch)]);
          querySets.push([...baseQueries, Query.search('tags', normalizedSearch)]);
          querySets.push([...baseQueries, Query.search('excerpt', normalizedSearch)]);
          querySets.push([...baseQueries, Query.search('content', normalizedSearch)]);
        }
        if (normalizedTag) {
          querySets.push([...baseQueries, Query.search('tags', normalizedTag)]);
        }

        let documents = await runSearchQueries(querySets);
        documents = filterPublished(documents);
        documents = sortDocs(documents).slice(0, parsedLimit);

        if (documents.length === 0 && normalizedSearch) {
          const fallbackLimit = Math.min(200, Math.max(50, parsedLimit * 5));
          const fallbackQueries = [
            Query.limit(fallbackLimit),
            Query.offset(0),
            Query.orderDesc('publishedAt'),
            ...filterQueries,
          ];
          const fallbackResult = await databases.listDocuments(
            DB_ID,
            ARTICLES_COL,
            fallbackQueries
          );
          let fallbackDocs = filterPublished(fallbackResult.documents || []);
          fallbackDocs = fallbackFilter(fallbackDocs, normalizedSearch);
          documents = sortDocs(fallbackDocs).slice(0, parsedLimit);
        }

        result = {
          documents,
          total: documents.length,
        };
      } else {
        const queries = [...baseQueries];
        if (sort === 'views') queries.push(Query.orderDesc('views'));
        else queries.push(Query.orderDesc('publishedAt'));
        const data = await databases.listDocuments(DB_ID, ARTICLES_COL, queries);
        result = {
          documents: filterPublished(data.documents || []),
          total: data.total,
        };
      }

      // Cache headers
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

      return res.status(200).json({
        documents: result.documents,
        total: result.total,
        limit: parsedLimit,
        offset: parsedOffset,
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

      const doc = await createArticle(data);
      return res.status(201).json(doc);
    } catch (err) {
      console.error('[API] POST /articles error:', err);
      if (err.code === 409) return res.status(409).json({ error: 'Slug already exists' });
      return res.status(500).json({ error: 'Failed to create article' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
