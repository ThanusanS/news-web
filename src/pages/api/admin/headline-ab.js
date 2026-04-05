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

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {}
  }

  return {};
}

function normalizeList(value, limit = 10) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, limit);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, content, count = 8 } = req.body || {};
    const safeTopic = String(topic || '').trim();
    if (!safeTopic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const prompt = [
      'You are a news headline strategist.',
      `Create ${Math.max(4, Math.min(Number(count) || 8, 12))} A/B headline ideas for this topic: ${safeTopic}.`,
      'Keep headlines factual, strong, and SEO-friendly.',
      'Return ONLY JSON in this format:',
      '{"headlines": ["..."]}',
      `Draft context: ${String(content || '').slice(0, 1200)}`,
    ].join('\n');

    const completion = await chatCompletionsWithFallback({
      temperature: 0.8,
      messages: [
        { role: 'system', content: 'Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
    });

    const parsed = parseJsonSafely(completion?.content);
    const headlines = normalizeList(parsed.headlines, 12);

    if (headlines.length === 0) {
      return res.status(502).json({ error: 'No headline ideas returned.' });
    }

    return res.status(200).json({ headlines });
  } catch (err) {
    const aiError = toAiHttpError(err, 'Failed to generate headline ideas');
    return res.status(aiError.status).json({
      error: aiError.error,
      details: aiError.details,
    });
  }
}
