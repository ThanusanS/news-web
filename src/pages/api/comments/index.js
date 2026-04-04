import { databases, DB_ID, COMMENTS_COL, ID, Query } from '../../../lib/appwrite';
import { commentSchema } from '../../../utils/validators';
import isomorphicDompurify from 'isomorphic-dompurify';

const commentRateMap = new Map();
function canComment(ip) {
  const now = Date.now();
  const entry = commentRateMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > 3600000) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count++;
  commentRateMap.set(ip, entry);
  return entry.count <= 5; // Max 5 comments per hour per IP
}

// Basic spam detection
function isSpam(content) {
  const spamPatterns = [/https?:\/\//gi, /\b(viagra|casino|lottery|winner)\b/gi, /<[^>]+>/gi];
  const linkCount = (content.match(/https?:\/\//gi) || []).length;
  return linkCount > 2 || spamPatterns.slice(1).some((p) => p.test(content));
}

function parseUnknownAttribute(err) {
  const msg = String(err?.message || err?.response?.message || '').replace(/\s+/g, ' ');
  const match = msg.match(/Unknown attribute:\s*"([^"]+)"/i);
  return match ? match[1] : null;
}

function resolveObjectKeyByName(obj, expectedKey) {
  if (!obj || !expectedKey) return null;
  if (Object.prototype.hasOwnProperty.call(obj, expectedKey)) return expectedKey;
  const lower = String(expectedKey).toLowerCase();
  return Object.keys(obj).find((k) => String(k).toLowerCase() === lower) || null;
}

function parseMissingRequiredAttribute(err) {
  const msg = String(err?.message || err?.response?.message || '').replace(/\s+/g, ' ');
  const match = msg.match(/Missing required attribute\s*"([^"]+)"/i);
  return match ? match[1] : null;
}

function parseEnumConstraint(err) {
  const msg = String(err?.message || err?.response?.message || '').replace(/\s+/g, ' ');
  const match = msg.match(
    /Attribute\s+"([^"]+)"\s+has invalid format\.\s*Value must be one of\s*\(([^)]+)\)/i
  );
  if (!match) return null;
  const values = String(match[2])
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  if (!values.length) return null;
  return { key: match[1], allowed: values };
}

function defaultForRequiredKey(key, seed = {}) {
  const k = String(key || '').toLowerCase();
  const now = new Date().toISOString();
  const normalizedArticleId = normalizeArticleIdKey(seed.articleId);
  const normalizedParentId = normalizeArticleIdKey(seed.parentId);
  const seedName = String(seed.name || seed.commenterName || '').trim();
  const seedEmail = String(seed.email || seed.commenterEmail || '').trim();
  const seedContent = String(
    seed.content || seed.comment || seed.commentText || seed.message || seed.body || seed.text || ''
  ).trim();

  if (k === 'articleid') return normalizedArticleId;
  if (k === 'commentid') return Number.isFinite(normalizedArticleId) ? normalizedArticleId : 1;
  if (k === 'parentid' || k === 'parentcommentid' || k === 'replyto' || k === 'replytoid') {
    return seed.parentId || normalizedParentId || '';
  }
  if (k === 'isreply') return !!seed.parentId;

  if (k === 'name' || k === 'commentername' || k === 'authorname') {
    return seedName || 'Reader';
  }
  if (k === 'email' || k === 'commenteremail' || k === 'authoremail') {
    return seedEmail || 'reader@comment.local';
  }
  if (
    k === 'content' ||
    k === 'comment' ||
    k === 'commenttext' ||
    k === 'message' ||
    k === 'body' ||
    k === 'text'
  ) {
    return seedContent || 'Comment submitted.';
  }
  if (k === 'website') return '';
  if (k === 'approved' || k === 'isapproved' || k === 'active') return false;
  if (k.includes('date') || k.endsWith('at')) return now;
  if (k === 'status' || k === 'state') return 'pending';
  if (k === 'source') return 'direct';
  if (k === 'type' || k === 'commenttype') return 'comment';
  if (k === 'ip') return 'anon';

  return '';
}

function normalizeArticleIdKey(rawArticleId) {
  const raw = String(rawArticleId || '').trim();
  if (!raw) return 0;
  if (/^-?\d+$/.test(raw)) {
    const asNum = Number(raw);
    return Number.isFinite(asNum) ? asNum : 0;
  }

  // Deterministic numeric key (safe integer) for string IDs.
  const maxSafe = 9007199254740991n;
  let hash = 0n;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 131n + BigInt(raw.charCodeAt(i))) % maxSafe;
  }
  const normalized = Number(hash || 1n);
  return Number.isFinite(normalized) ? normalized : 1;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }
  return '';
}

function normalizeCommentDoc(doc) {
  const email = firstNonEmpty(doc?.email, doc?.commenterEmail, doc?.authorEmail, '');
  const emailLocalName = String(email || '')
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .trim();
  const fallbackName = emailLocalName
    ? emailLocalName
        .split(' ')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join(' ')
    : 'Anonymous';

  const name = firstNonEmpty(
    doc?.name,
    doc?.commenterName,
    doc?.commenter,
    doc?.authorName,
    doc?.username,
    doc?.userName,
    doc?.fullName,
    fallbackName
  );
  const content = firstNonEmpty(
    doc?.content,
    doc?.comment,
    doc?.commentText,
    doc?.message,
    doc?.body,
    doc?.text,
    ''
  );

  return {
    ...doc,
    name,
    email,
    content,
    parentId: firstNonEmpty(doc?.parentId, doc?.parentCommentId, doc?.replyTo, doc?.replyToId, ''),
  };
}

function getParentReference(doc) {
  return String(
    firstNonEmpty(doc?.parentId, doc?.parentCommentId, doc?.replyTo, doc?.replyToId, '')
  ).trim();
}

function buildThreadedComments(documents = []) {
  const normalized = documents.map(normalizeCommentDoc);
  const byId = new Map(normalized.map((d) => [String(d.$id), { ...d, replies: [] }]));
  const roots = [];

  normalized.forEach((doc) => {
    const ref = getParentReference(doc);
    const parent = ref ? byId.get(ref) : null;
    if (parent) {
      parent.replies.push({ ...doc, replies: [] });
    } else {
      roots.push(byId.get(String(doc.$id)) || { ...doc, replies: [] });
    }
  });

  return roots;
}

async function createCommentWithFallback(payload) {
  const doc = { ...payload };

  // Retry against schema mismatches so comments keep working across Appwrite schema drift.
  for (let i = 0; i < 20; i += 1) {
    try {
      return await databases.createDocument(DB_ID, COMMENTS_COL, ID.unique(), doc);
    } catch (err) {
      const unknown = parseUnknownAttribute(err);
      const unknownKey = resolveObjectKeyByName(doc, unknown);
      if (unknownKey) {
        delete doc[unknownKey];
        continue;
      }

      const missing = parseMissingRequiredAttribute(err);
      if (missing && !(missing in doc)) {
        doc[missing] = defaultForRequiredKey(missing, payload);
        continue;
      }

      const enumConstraint = parseEnumConstraint(err);
      if (enumConstraint?.key) {
        doc[enumConstraint.key] = enumConstraint.allowed[0];
        continue;
      }

      throw err;
    }
  }

  return databases.createDocument(DB_ID, COMMENTS_COL, ID.unique(), doc);
}

async function listCommentsWithFallback(rawArticleId) {
  const normalizedArticleId = normalizeArticleIdKey(rawArticleId);
  const articleIdCandidates = [rawArticleId, normalizedArticleId].filter(
    (value, idx, arr) => value !== '' && arr.indexOf(value) === idx
  );

  const querySets = [];
  for (const candidate of articleIdCandidates) {
    querySets.push([
      Query.equal('articleId', candidate),
      Query.equal('approved', true),
      Query.orderDesc('createdAt'),
      Query.limit(50),
    ]);
    querySets.push([
      Query.equal('articleId', candidate),
      Query.orderDesc('createdAt'),
      Query.limit(50),
    ]);
    querySets.push([Query.equal('articleId', candidate), Query.limit(50)]);
  }

  let lastErr;
  for (const queries of querySets) {
    try {
      const result = await databases.listDocuments(DB_ID, COMMENTS_COL, queries);
      if (queries.length === 2) {
        const docs = Array.isArray(result?.documents)
          ? result.documents
              .filter((d) => d?.approved === true || d?.approved === undefined)
              .map(normalizeCommentDoc)
          : [];
        const threaded = buildThreadedComments(docs);
        return { ...result, documents: threaded, total: threaded.length };
      }
      const normalizedDocuments = Array.isArray(result?.documents)
        ? result.documents.map(normalizeCommentDoc)
        : [];
      const threaded = buildThreadedComments(
        normalizedDocuments.filter((d) => d?.approved === true || d?.approved === undefined)
      );
      return {
        ...result,
        documents: threaded,
        total: threaded.length,
      };
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr;
}

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'anon';

  // ── GET comments for article ───────────────────────────────────────────────
  if (req.method === 'GET') {
    const { articleId } = req.query;
    if (!articleId) return res.status(400).json({ error: 'articleId required' });
    try {
      const result = await listCommentsWithFallback(articleId);
      res.setHeader('Cache-Control', 'public, s-maxage=60');
      return res.status(200).json(result);
    } catch (err) {
      console.error('[API] Comments GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  // ── POST new comment ───────────────────────────────────────────────────────
  if (req.method === 'POST') {
    if (!canComment(ip))
      return res.status(429).json({ error: 'Too many comments. Try again later.' });

    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) {
      const issueMessage = parsed.error.issues?.[0]?.message || 'Validation failed';
      return res.status(400).json({ error: issueMessage, issues: parsed.error.issues });
    }

    const { articleId, parentId, name, email, content } = parsed.data;
    const normalizedArticleId = normalizeArticleIdKey(articleId);
    const safeName = isomorphicDompurify.sanitize(name, { ALLOWED_TAGS: [] });
    const safeEmail =
      (email || '').trim() ||
      `${
        safeName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '.') || 'reader'
      }@comment.local`;

    // Sanitize content
    const cleanContent = isomorphicDompurify.sanitize(content, { ALLOWED_TAGS: [] });

    if (isSpam(cleanContent)) return res.status(400).json({ error: 'Comment flagged as spam.' });

    try {
      const comment = await createCommentWithFallback({
        articleId: normalizedArticleId,
        name: safeName,
        commenterName: safeName,
        commenter: safeName,
        authorName: safeName,
        email: safeEmail,
        commenterEmail: safeEmail,
        authorEmail: safeEmail,
        content: cleanContent,
        comment: cleanContent,
        commentText: cleanContent,
        message: cleanContent,
        body: cleanContent,
        parentId: parentId || '',
        parentCommentId: parentId || '',
        replyTo: parentId || '',
        approved: false, // Requires admin approval
        createdAt: new Date().toISOString(),
      });

      const persistedContent = firstNonEmpty(
        comment?.content,
        comment?.comment,
        comment?.commentText,
        comment?.message,
        comment?.body,
        comment?.text
      );
      if (!persistedContent) {
        return res.status(500).json({
          error:
            'Comments schema is missing a text field. Add a string attribute like "content" in the Appwrite comments collection.',
        });
      }

      return res.status(201).json({
        success: true,
        message: parentId
          ? 'Reply submitted for moderation. It will appear after approval.'
          : 'Comment submitted for moderation. It will appear after approval.',
        id: comment.$id,
      });
    } catch (err) {
      console.error('[API] Comments POST error:', err);
      const msg = err?.message || '';
      if (/not authorized|missing scope|permission/i.test(msg)) {
        return res.status(403).json({
          error:
            'Comments write permission is blocked in Appwrite. Allow create access on comments collection.',
        });
      }
      return res.status(500).json({ error: 'Failed to post comment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
