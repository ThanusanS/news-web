import { databases, DB_ID, SUBSCRIBERS_COL, ID } from '../../../lib/appwrite';
import { newsletterSchema } from '../../../utils/validators';

// Simple rate limiter
const subMap = new Map();
function canSubscribe(ip, email) {
  const key = `${ip}:${String(email || '').toLowerCase()}`;
  const now = Date.now();
  const last = subMap.get(key);
  if (last && now - last < 10000) return false;
  subMap.set(key, now);
  return true;
}

function parseUnknownAttribute(err) {
  const msg = err?.message || '';
  const match = msg.match(/Unknown attribute:\s*"([^"]+)"/i);
  return match ? match[1] : null;
}

async function createSubscriberWithFallback(payload) {
  const doc = { ...payload };
  for (let i = 0; i < 6; i += 1) {
    try {
      return await databases.createDocument(DB_ID, SUBSCRIBERS_COL, ID.unique(), doc);
    } catch (err) {
      const unknown = parseUnknownAttribute(err);
      if (!unknown || !(unknown in doc)) throw err;
      delete doc[unknown];
    }
  }
  return databases.createDocument(DB_ID, SUBSCRIBERS_COL, ID.unique(), doc);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid email address', issues: parsed.error.issues });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'anon';
  const { email, name } = parsed.data;

  if (!canSubscribe(ip, email)) {
    return res.status(429).json({ error: 'Please wait a few seconds and try again.' });
  }

  try {
    await createSubscriberWithFallback({
      email,
      name: name || '',
      subscriptionType: 'free',
      subscribedAt: new Date().toISOString(),
      active: true,
      source: req.headers.referer || 'direct',
      ip: ip.slice(0, 20), // Partial IP for privacy
    });

    // TODO: Send welcome email via Nodemailer/Resend/SendGrid
    // await sendWelcomeEmail(email, name);

    return res.status(201).json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) {
    console.error('[API] Newsletter error:', err);
    const msg = err?.message || '';
    if (err?.code === 409 || /already exists|unique/i.test(msg)) {
      return res.status(409).json({ error: 'This email is already subscribed.' });
    }
    if (/not authorized|missing scope|permission/i.test(msg)) {
      return res.status(403).json({
        error:
          'Newsletter write permission is blocked in Appwrite. Allow create access on subscribers collection.',
      });
    }
    return res.status(500).json({ error: 'Subscription failed. Please try again.' });
  }
}
