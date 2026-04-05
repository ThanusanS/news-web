import slugify from 'slugify';

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
    `- Minimum ${minWords} words`,
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

  const apiKey = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL || 'deepseek-ai/DeepSeek-V3-0324:novita';
  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing HF_TOKEN. Add it to your environment variables first.',
    });
  }

  try {
    const {
      topic,
      category = 'world',
      minWords = 1500,
      tone = 'neutral and factual',
    } = req.body || {};
    if (!String(topic || '').trim()) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const prompt = buildPrompt({
      topic: String(topic).trim(),
      category: String(category || 'world').trim(),
      minWords: Math.max(800, Math.min(Number(minWords) || 1500, 3000)),
      tone: String(tone || 'neutral and factual').trim(),
    });

    const hfResponse = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert newsroom editor and SEO strategist. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!hfResponse.ok) {
      const details = await hfResponse.text();
      return res.status(502).json({
        error: 'Hugging Face provider error while generating article.',
        details: details.slice(0, 400),
      });
    }

    const data = await hfResponse.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = parseJsonSafely(content);

    const title = clampText(parsed.title, 300) || `Latest Update: ${String(topic).trim()}`;
    const contentHtml = String(parsed.content || '').trim();
    if (!contentHtml) {
      return res.status(502).json({ error: 'AI response missing content.' });
    }

    const slug = slugify(title, { lower: true, strict: true }).slice(0, 200);
    const wordCount = toWordCount(contentHtml);
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords.filter((k) => typeof k === 'string' && k.trim()).map((k) => k.trim())
      : [];
    const focusKeyword = clampText(keywords[0] || '', 100) || String(topic).slice(0, 100);
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
      targetWords: Math.max(800, Math.min(Number(minWords) || 1500, 3000)),
    };

    return res.status(200).json({ article });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to generate article',
      details: err?.message || 'Unknown error',
    });
  }
}
