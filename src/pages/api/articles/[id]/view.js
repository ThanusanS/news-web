import { databases, DB_ID, ARTICLES_COL } from '../../../../lib/appwrite';

// Track per-IP in memory (use Redis in production)
const viewedMap = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'anon';
  const key = `${ip}_${id}`;

  // Dedup: one view per IP per article per hour
  if (viewedMap.has(key)) return res.status(200).json({ ok: true, deduplicated: true });
  viewedMap.set(key, Date.now());
  setTimeout(() => viewedMap.delete(key), 3600000); // 1 hour TTL

  try {
    const doc = await databases.getDocument(DB_ID, ARTICLES_COL, id);
    await databases.updateDocument(DB_ID, ARTICLES_COL, id, { views: (doc.views || 0) + 1 });
    return res.status(200).json({ ok: true, views: (doc.views || 0) + 1 });
  } catch {
    return res.status(200).json({ ok: true }); // Silent fail
  }
}
