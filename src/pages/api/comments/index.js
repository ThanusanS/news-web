import { databases, DB_ID, COMMENTS_COL, ID, Query } from '../../../lib/appwrite';
import { commentSchema } from '../../../utils/validators';
import isomorphicDompurify from 'isomorphic-dompurify';

const commentRateMap = new Map();
function canComment(ip) {
  const now = Date.now();
  const entry = commentRateMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > 3600000) { entry.count = 0; entry.start = now; }
  entry.count++;
  commentRateMap.set(ip, entry);
  return entry.count <= 5; // Max 5 comments per hour per IP
}

// Basic spam detection
function isSpam(content) {
  const spamPatterns = [/https?:\/\//gi, /\b(viagra|casino|lottery|winner)\b/gi, /<[^>]+>/gi];
  const linkCount = (content.match(/https?:\/\//gi) || []).length;
  return linkCount > 2 || spamPatterns.slice(1).some((p) => p.test(content));
}

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'anon';

  // ── GET comments for article ───────────────────────────────────────────────
  if (req.method === 'GET') {
    const { articleId } = req.query;
    if (!articleId) return res.status(400).json({ error: 'articleId required' });
    try {
      const result = await databases.listDocuments(DB_ID, COMMENTS_COL, [
        Query.equal('articleId', articleId),
        Query.equal('approved', true),
        Query.orderDesc('createdAt'),
        Query.limit(50),
      ]);
      res.setHeader('Cache-Control', 'public, s-maxage=60');
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  // ── POST new comment ───────────────────────────────────────────────────────
  if (req.method === 'POST') {
    if (!canComment(ip)) return res.status(429).json({ error: 'Too many comments. Try again later.' });

    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Validation failed', issues: parsed.error.issues });

    const { articleId, name, email, content, website } = parsed.data;

    // Sanitize content
    const cleanContent = isomorphicDompurify.sanitize(content, { ALLOWED_TAGS: [] });

    if (isSpam(cleanContent)) return res.status(400).json({ error: 'Comment flagged as spam.' });

    try {
      const comment = await databases.createDocument(DB_ID, COMMENTS_COL, ID.unique(), {
        articleId,
        name: isomorphicDompurify.sanitize(name, { ALLOWED_TAGS: [] }),
        email,
        content: cleanContent,
        website: website || '',
        approved: false, // Requires admin approval
        createdAt: new Date().toISOString(),
        ip: ip.slice(0, 20),
      });

      return res.status(201).json({
        success: true,
        message: 'Comment submitted for moderation. It will appear after approval.',
        id: comment.$id,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to post comment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
