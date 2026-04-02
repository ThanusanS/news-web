// Lightweight analytics endpoint - tracks page views, referrers, events
// In production, use a proper analytics DB (ClickHouse, Plausible, etc.)

const analyticsBuffer = [];
const MAX_BUFFER = 1000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { event, page, referrer, duration, articleId, category } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'anon';
    const ua = req.headers['user-agent'] || '';

    // Skip bots
    if (/bot|crawler|spider|scraper/i.test(ua)) return res.status(200).json({ ok: true });

    const entry = {
      event: event || 'pageview',
      page,
      referrer,
      duration,
      articleId,
      category,
      timestamp: new Date().toISOString(),
      country: req.headers['x-vercel-ip-country'] || 'Unknown',
      city: req.headers['x-vercel-ip-city'] || 'Unknown',
      device: /mobile/i.test(ua) ? 'mobile' : /tablet/i.test(ua) ? 'tablet' : 'desktop',
    };

    // Buffer analytics (flush to DB in production)
    if (analyticsBuffer.length < MAX_BUFFER) analyticsBuffer.push(entry);

    // TODO: Store in Appwrite analytics collection or send to ClickHouse/Plausible
    // await storeAnalyticsEvent(entry);

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(200).json({ ok: true }); // Silent fail for analytics
  }
}

export const config = { api: { bodyParser: { sizeLimit: '1kb' } } };
