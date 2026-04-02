import { databases, DB_ID, SUBSCRIBERS_COL, ID, Query } from '../../../lib/appwrite';
import { newsletterSchema } from '../../../utils/validators';

// Simple rate limiter
const subMap = new Map();
function canSubscribe(ip) {
  const now = Date.now();
  const last = subMap.get(ip);
  if (last && now - last < 60000) return false;
  subMap.set(ip, now);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'anon';
  if (!canSubscribe(ip)) return res.status(429).json({ error: 'Please wait before subscribing again.' });

  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid email address', issues: parsed.error.issues });
  }

  const { email, name } = parsed.data;

  try {
    // Check for existing subscription
    const existing = await databases.listDocuments(DB_ID, SUBSCRIBERS_COL, [Query.equal('email', email)]);
    if (existing.documents.length > 0) {
      return res.status(409).json({ error: 'This email is already subscribed.' });
    }

    await databases.createDocument(DB_ID, SUBSCRIBERS_COL, ID.unique(), {
      email,
      name: name || '',
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
    return res.status(500).json({ error: 'Subscription failed. Please try again.' });
  }
}
