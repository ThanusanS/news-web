import { databases, DB_ID, ARTICLES_COL, Query } from '../../../lib/appwrite';
import { chatCompletionsWithFallback, toAiHttpError } from '../../../lib/ai/fallback';

function parseJsonSafely(raw) {
  const text = String(raw || '').trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {}

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch {}
  }

  return {};
}

function normalizeSuggestions(list, catalogBySlug, limit = 6) {
  if (!Array.isArray(list)) return [];
  const out = [];

  for (const item of list) {
    const slug = String(item?.slug || '').trim();
    const anchorText = String(item?.anchorText || '').trim();
    const reason = String(item?.reason || '').trim();
    if (!slug || !catalogBySlug.has(slug)) continue;

    out.push({
      slug,
      url: `/${slug}`,
      anchorText: anchorText || catalogBySlug.get(slug).title,
      reason,
      title: catalogBySlug.get(slug).title,
    });

    if (out.length >= limit) break;
  }

  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, content, currentSlug = '' } = req.body || {};
    if (!String(title || '').trim() && !String(content || '').trim()) {
      return res.status(400).json({ error: 'Title or content is required.' });
    }

    const listResult = await databases.listDocuments(DB_ID, ARTICLES_COL, [
      Query.equal('status', 'published'),
      Query.orderDesc('publishedAt'),
      Query.limit(50),
    ]);

    const catalog = (listResult.documents || [])
      .map((doc) => ({
        slug: String(doc.slug || '').trim(),
        title: String(doc.title || '').trim(),
      }))
      .filter((doc) => doc.slug && doc.title && doc.slug !== String(currentSlug || '').trim());

    if (catalog.length === 0) {
      return res.status(200).json({ suggestions: [] });
    }

    const catalogBySlug = new Map(catalog.map((item) => [item.slug, item]));

    const prompt = [
      'You are an SEO internal linking assistant.',
      'Based on draft text and available published articles, propose internal links.',
      'Return ONLY JSON in this format:',
      '{"links":[{"slug":"", "anchorText":"", "reason":""}]}',
      '',
      `Draft title: ${String(title || '').slice(0, 200)}`,
      `Draft content snippet: ${String(content || '')
        .replace(/<[^>]*>/g, ' ')
        .slice(0, 1800)}`,
      '',
      `Available articles: ${JSON.stringify(catalog.slice(0, 40))}`,
      'Pick 4-6 relevant links max.',
    ].join('\n');

    const completion = await chatCompletionsWithFallback({
      temperature: 0.4,
      messages: [
        { role: 'system', content: 'Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
    });

    const parsed = parseJsonSafely(completion?.content);
    const suggestions = normalizeSuggestions(parsed.links, catalogBySlug, 6);

    return res.status(200).json({ suggestions });
  } catch (err) {
    const aiError = toAiHttpError(err, 'Failed to suggest internal links');
    return res.status(aiError.status).json({
      error: aiError.error,
      details: aiError.details,
    });
  }
}
