import { databases, DB_ID, ARTICLES_COL, Query } from '../../../lib/appwrite';

export default async function handler(req, res) {
  const { id } = req.query;

  // ── GET by slug or ID ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      let doc;
      // Try as slug first
      const bySlug = await databases.listDocuments(DB_ID, ARTICLES_COL, [Query.equal('slug', id), Query.limit(1)]);
      if (bySlug.documents.length) {
        doc = bySlug.documents[0];
      } else {
        doc = await databases.getDocument(DB_ID, ARTICLES_COL, id);
      }
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json(doc);
    } catch {
      return res.status(404).json({ error: 'Article not found' });
    }
  }

  // ── PUT update article ─────────────────────────────────────────────────────
  if (req.method === 'PUT') {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const data = { ...req.body, updatedAt: new Date().toISOString() };
      delete data.$id; delete data.$createdAt; delete data.$updatedAt;
      const updated = await databases.updateDocument(DB_ID, ARTICLES_COL, id, data);
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(500).json({ error: 'Update failed', details: err.message });
    }
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    try {
      await databases.deleteDocument(DB_ID, ARTICLES_COL, id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Delete failed', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
