import { chatCompletionsWithFallback, toAiHttpError } from '../../../lib/ai/fallback';

const rateLimitMap = new Map();

function rateLimit(ip, max = 15, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return entry.count <= max;
}

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

function normalizeStringList(value, limit = 8) {
  if (!Array.isArray(value)) return [];

  const pickText = (item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      const candidate =
        item.topic ||
        item.title ||
        item.headline ||
        item.keyword ||
        item.text ||
        item.name ||
        item.label;
      if (typeof candidate === 'string') return candidate;
    }
    return String(item || '');
  };

  return value
    .map((item) => pickText(item).trim())
    .filter((item) => Boolean(item) && item !== '[object Object]')
    .slice(0, limit);
}

function buildPrompt(seed, region) {
  return [
    'You are a newsroom trend analyst and SEO strategist.',
    `Find trending news opportunities for: "${seed}".`,
    `Region focus: ${region || 'Worldwide (global news coverage across all major regions)'}.`,
    'Return ONLY valid JSON in this exact format:',
    '{',
    '  "trending_topics": [""],',
    '  "headline_ideas": [""],',
    '  "keywords": [""]',
    '}',
    'Guidelines:',
    '- Make topics timely and realistic.',
    '- Headline ideas should be journalistic and clickable but factual.',
    '- Keywords should be SEO-focused short phrases.',
    '- No fake claims or fabricated statistics.',
  ].join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const reqHost = req.headers.host;
  const origin = req.headers.origin || req.headers.referer;
  if (origin && reqHost) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== reqHost) {
        return res.status(403).json({ error: 'Forbidden origin' });
      }
    } catch {
      return res.status(403).json({ error: 'Invalid origin' });
    }
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  try {
    const { seed, region = 'Worldwide' } = req.body || {};
    const safeSeed = String(seed || '').trim();
    if (!safeSeed) {
      return res.status(400).json({ error: 'Seed input is required.' });
    }

    const completion = await chatCompletionsWithFallback({
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content: 'You are an expert editor. Return only valid JSON.',
        },
        {
          role: 'user',
          content: buildPrompt(safeSeed, String(region || '').trim()),
        },
      ],
    });

    const parsed = parseJsonSafely(completion?.content);

    const trendingTopics = normalizeStringList(parsed.trending_topics, 8);
    const headlineIdeas = normalizeStringList(parsed.headline_ideas, 8);
    const keywords = normalizeStringList(parsed.keywords, 12);

    if (trendingTopics.length === 0 && headlineIdeas.length === 0 && keywords.length === 0) {
      return res.status(502).json({ error: 'AI response did not include usable trend ideas.' });
    }

    return res.status(200).json({
      seed: safeSeed,
      trendingTopics,
      headlineIdeas,
      keywords,
    });
  } catch (err) {
    const aiError = toAiHttpError(err, 'Failed to find trending ideas');
    return res.status(aiError.status).json({
      error: aiError.error,
      details: aiError.details,
    });
  }
}
