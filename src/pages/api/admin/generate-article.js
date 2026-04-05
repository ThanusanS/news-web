import slugify from 'slugify';
import { chatCompletionsWithFallback, toAiHttpError } from '../../../lib/ai/fallback';

const rateLimitMap = new Map();

function rateLimit(ip, max = 8, windowMs = 10 * 60 * 1000) {
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

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toWordCount(html) {
  const txt = stripHtml(html);
  if (!txt) return 0;
  return txt.split(' ').length;
}

function clampText(value, maxLen) {
  const v = String(value || '').trim();
  if (!v) return '';
  return v.slice(0, maxLen);
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

function buildPrompt({ topic, category, minWords, tone }) {
  return [
    'You are a professional news writer and SEO expert.',
    '',
    `Write a detailed news article about: "${topic}"`,
    '',
    'Requirements:',
    `- Minimum ${minWords} words (no maximum limit)`,
    '- SEO optimized',
    '- Engaging headline (H1)',
    '- Meta description (160 characters)',
    '- Include keywords',
    '- Use H2 and H3 headings',
    `- Write in ${tone} journalistic tone`,
    '- Include introduction, body, and conclusion',
    '- Add bullet points where needed',
    '- Ensure factual and realistic tone',
    '- No fake claims',
    `- Preferred category context: ${category || 'world'}`,
    '- Content should be valid HTML suitable for a rich text editor body.',
    '',
    'Output format:',
    '{',
    '  "title": "",',
    '  "meta_description": "",',
    '  "keywords": [],',
    '  "content": ""',
    '}',
    'Return ONLY valid JSON and nothing else.',
  ].join('\n');
}

function buildExpansionPrompt({ topic, category, minWords, tone, draft }) {
  return [
    'You are a professional news writer and SEO expert.',
    '',
    'Your previous draft is too short. Expand and improve it while preserving factual tone.',
    `Topic: "${topic}"`,
    `Category: ${category || 'world'}`,
    `Required minimum words: ${minWords} (no maximum limit)`,
    `Tone: ${tone}`,
    '',
    'Keep and improve:',
    '- Engaging H1 headline',
    '- SEO meta description',
    '- H2/H3 structure',
    '- Intro/body/conclusion',
    '- Bullet points where useful',
    '- No fake claims',
    '',
    'Return ONLY valid JSON in this format:',
    '{',
    '  "title": "",',
    '  "meta_description": "",',
    '  "keywords": [],',
    '  "content": ""',
    '}',
    '',
    'Current draft JSON to expand:',
    JSON.stringify(draft || {}, null, 2),
  ].join('\n');
}

async function requestAiCompletion({ prompt }) {
  const completion = await chatCompletionsWithFallback({
    temperature: 0.6,
    messages: [
      {
        role: 'system',
        content: 'You are an expert newsroom editor and SEO strategist. Return only valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  return {
    parsed: parseJsonSafely(completion?.content),
    generation: {
      provider: String(completion?.provider || '').trim(),
      model: String(completion?.model || '').trim(),
    },
  };
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
    return res.status(429).json({ error: 'Too many generation requests. Try again later.' });
  }

  try {
    const {
      topic,
      category = 'world',
      minWords = 1200,
      tone = 'neutral and factual',
    } = req.body || {};
    if (!String(topic || '').trim()) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const safeTopic = String(topic).trim();
    const safeCategory = String(category || 'world').trim();
    const safeTone = String(tone || 'neutral and factual').trim();
    const targetWords = Math.max(1000, Number(minWords) || 1200);

    let completionResult = await requestAiCompletion({
      prompt: buildPrompt({
        topic: safeTopic,
        category: safeCategory,
        minWords: targetWords,
        tone: safeTone,
      }),
    });
    let parsed = completionResult.parsed || {};
    let generation = completionResult.generation || { provider: '', model: '' };

    let draftHtml = String(parsed.content || '').trim();
    let wordCount = toWordCount(draftHtml);

    for (let attempt = 0; attempt < 2 && wordCount < targetWords; attempt += 1) {
      completionResult = await requestAiCompletion({
        prompt: buildExpansionPrompt({
          topic: safeTopic,
          category: safeCategory,
          minWords: targetWords,
          tone: safeTone,
          draft: parsed,
        }),
      });
      parsed = completionResult.parsed || {};
      generation = completionResult.generation || generation;
      draftHtml = String(parsed.content || '').trim();
      wordCount = toWordCount(draftHtml);
    }

    if (wordCount < targetWords) {
      return res.status(422).json({
        error: `Generation did not reach minimum length (${wordCount}/${targetWords} words). Please retry.`,
        generatedWordCount: wordCount,
        targetWords,
      });
    }

    const title = clampText(parsed.title, 300) || `Latest Update: ${safeTopic}`;
    const contentHtml = draftHtml;
    if (!contentHtml) {
      return res.status(502).json({ error: 'AI response missing content.' });
    }

    const slug = slugify(title, { lower: true, strict: true }).slice(0, 200);
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords.filter((k) => typeof k === 'string' && k.trim()).map((k) => k.trim())
      : [];
    const focusKeyword = clampText(keywords[0] || '', 100) || safeTopic.slice(0, 100);
    const excerptFromBody = clampText(stripHtml(contentHtml), 200);
    const metaDescription =
      clampText(parsed.meta_description, 155) || clampText(excerptFromBody, 155) || '';

    const article = {
      title,
      slug,
      category: String(category || 'world').trim(),
      author: 'CeylonUpdates Editorial Desk',
      excerpt: excerptFromBody,
      content: contentHtml,
      featuredImage: '',
      newsImage: '',
      metaTitle: clampText(title, 60),
      metaDescription,
      ogTitle: clampText(title, 100),
      ogDescription: clampText(metaDescription || excerptFromBody, 200),
      canonicalUrl: '',
      focusKeyword,
      tags: keywords.slice(0, 10),
      status: 'draft',
      generatedWordCount: wordCount,
      targetWords,
      minWordsMet: wordCount >= targetWords,
    };

    return res.status(200).json({
      article,
      generation,
    });
  } catch (err) {
    const aiError = toAiHttpError(err, 'Failed to generate article');
    return res.status(aiError.status).json({
      error: aiError.error,
      details: aiError.details,
    });
  }
}
