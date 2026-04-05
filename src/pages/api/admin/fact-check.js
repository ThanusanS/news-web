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

function normalizeFlags(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => ({
      claim: String(item?.claim || '').trim(),
      issue: String(item?.issue || '').trim(),
      severity: String(item?.severity || 'medium')
        .trim()
        .toLowerCase(),
      suggestion: String(item?.suggestion || '').trim(),
    }))
    .filter((item) => item.claim)
    .slice(0, 12);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, content } = req.body || {};
    if (!String(title || '').trim() && !String(content || '').trim()) {
      return res.status(400).json({ error: 'Title or content is required.' });
    }

    const prompt = [
      'You are a strict newsroom fact-check assistant.',
      'Analyze this draft and identify risky or unverifiable claims.',
      'Return ONLY JSON in this format:',
      '{"riskScore":0, "summary":"", "flags":[{"claim":"","issue":"","severity":"high|medium|low","suggestion":""}], "recommendedSources":[""]}',
      'Do not invent facts. Focus on verification risk only.',
      `Title: ${String(title || '')}`,
      `Content: ${String(content || '')
        .replace(/<[^>]*>/g, ' ')
        .slice(0, 3500)}`,
    ].join('\n');

    const completion = await chatCompletionsWithFallback({
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
    });

    const parsed = parseJsonSafely(completion?.content);

    return res.status(200).json({
      riskScore: Math.max(0, Math.min(100, Number(parsed.riskScore) || 0)),
      summary: String(parsed.summary || '').trim(),
      flags: normalizeFlags(parsed.flags),
      recommendedSources: Array.isArray(parsed.recommendedSources)
        ? parsed.recommendedSources
            .map((s) => String(s || '').trim())
            .filter(Boolean)
            .slice(0, 8)
        : [],
    });
  } catch (err) {
    const aiError = toAiHttpError(err, 'Failed to run fact-check guard');
    return res.status(aiError.status).json({
      error: aiError.error,
      details: aiError.details,
    });
  }
}
