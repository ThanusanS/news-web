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

function clampText(value, maxLen) {
  const v = String(value || '').trim();
  if (!v) return '';
  return v.slice(0, maxLen);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, excerpt, content, focusKeyword, metaTitle, metaDescription } = req.body || {};
    const safeTitle = String(title || '').trim();
    if (!safeTitle && !String(content || '').trim()) {
      return res.status(400).json({ error: 'Title or content is required.' });
    }

    const prompt = [
      'You are an SEO editor for a news site.',
      'Fix and optimize SEO metadata for this draft.',
      'Return ONLY JSON in this format:',
      '{"metaTitle":"", "metaDescription":"", "focusKeyword":"", "excerpt":""}',
      'Rules: metaTitle <= 60, metaDescription <= 155, excerpt <= 200.',
      `Current title: ${safeTitle}`,
      `Current excerpt: ${String(excerpt || '')}`,
      `Current focus keyword: ${String(focusKeyword || '')}`,
      `Current meta title: ${String(metaTitle || '')}`,
      `Current meta description: ${String(metaDescription || '')}`,
      `Content snippet: ${String(content || '')
        .replace(/<[^>]*>/g, ' ')
        .slice(0, 2000)}`,
    ].join('\n');

    const completion = await chatCompletionsWithFallback({
      temperature: 0.4,
      messages: [
        { role: 'system', content: 'Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
    });

    const parsed = parseJsonSafely(completion?.content);

    return res.status(200).json({
      metaTitle: clampText(parsed.metaTitle || safeTitle, 60),
      metaDescription: clampText(parsed.metaDescription || excerpt || '', 155),
      focusKeyword: clampText(parsed.focusKeyword || focusKeyword || '', 100),
      excerpt: clampText(parsed.excerpt || excerpt || '', 200),
    });
  } catch (err) {
    const aiError = toAiHttpError(err, 'Failed to auto-fix SEO');
    return res.status(aiError.status).json({
      error: aiError.error,
      details: aiError.details,
    });
  }
}
