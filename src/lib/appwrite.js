import { Client, Databases, Storage, Account, Query, ID } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '69c126bb001b112e80ad');

const APPWRITE_ENDPOINT =
  (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1').replace(/\/$/, '');
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '69c126bb001b112e80ad';

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export { Query, ID };

// ─── Config ────────────────────────────────────────────────────────────────
export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'ceylonupdates_db';
export const ARTICLES_COL = process.env.NEXT_PUBLIC_APPWRITE_ARTICLES_COLLECTION_ID || 'articles';
export const CATEGORIES_COL =
  process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID || 'categories';
export const TAGS_COL = process.env.NEXT_PUBLIC_APPWRITE_TAGS_COLLECTION_ID || 'tags';
export const COMMENTS_COL = process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID || 'comments';
export const SUBSCRIBERS_COL =
  process.env.NEXT_PUBLIC_APPWRITE_SUBSCRIBERS_COLLECTION_ID || 'subscribers';
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || 'media';

function buildStorageUrl(fileId, action, params = {}) {
  const base = `${APPWRITE_ENDPOINT}/storage/buckets/${encodeURIComponent(BUCKET_ID)}/files/${encodeURIComponent(fileId)}/${action}`;
  const search = new URLSearchParams({ project: PROJECT_ID, ...params });
  return `${base}?${search.toString()}`;
}

function normalizeArticle(doc) {
  if (!doc) return doc;
  const featuredImage = doc.featuredImage || '';
  const newsImage = doc.newsImage || '';
  return { ...doc, featuredImage, newsImage };
}

// ─── Article helpers ────────────────────────────────────────────────────────
async function listArticlesWithFallback(querySets) {
  let lastError;
  for (const queries of querySets) {
    try {
      const result = await databases.listDocuments(DB_ID, ARTICLES_COL, queries);
      return {
        ...result,
        documents: (result.documents || []).map(normalizeArticle),
      };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export async function getArticles({ category, limit = 10, offset = 0, status = 'published' } = {}) {
  const nowIso = new Date().toISOString();
  const q1 = [Query.orderDesc('$createdAt'), Query.limit(limit), Query.offset(offset)];

  if (status) {
    q1.unshift(Query.equal('status', status));
  }
  if (category) {
    q1.push(Query.equal('category', category));
  }

  const result = await listArticlesWithFallback([q1, [Query.limit(limit), Query.offset(offset)]]);
  if (status !== 'published') return result;

  return {
    ...result,
    documents: (result.documents || []).filter(
      (doc) => !doc.publishedAt || String(doc.publishedAt) <= nowIso
    ),
  };
}

export async function getArticleBySlug(slug) {
  const nowIso = new Date().toISOString();
  let res;
  try {
    res = await databases.listDocuments(DB_ID, ARTICLES_COL, [
      Query.equal('slug', slug),
      Query.equal('status', 'published'),
      Query.limit(1),
    ]);
  } catch {
    res = await databases.listDocuments(DB_ID, ARTICLES_COL, [
      Query.equal('slug', slug),
      Query.limit(1),
    ]);
  }
  const article = normalizeArticle(res.documents[0] || null);
  if (article?.publishedAt && String(article.publishedAt) > nowIso) return null;
  return article;
}

export async function getArticleById(id) {
  const doc = await databases.getDocument(DB_ID, ARTICLES_COL, id);
  return normalizeArticle(doc);
}

export async function getTrendingArticles(limit = 5) {
  const nowIso = new Date().toISOString();
  const result = await listArticlesWithFallback([
    [Query.equal('status', 'published'), Query.orderDesc('views'), Query.limit(limit * 2)],
    [Query.equal('status', 'published'), Query.orderDesc('$createdAt'), Query.limit(limit * 2)],
    [Query.orderDesc('$createdAt'), Query.limit(limit * 2)],
  ]);

  return {
    ...result,
    documents: (result.documents || [])
      .filter((doc) => !doc.publishedAt || String(doc.publishedAt) <= nowIso)
      .slice(0, limit),
  };
}

export async function incrementViews(articleId, currentViews) {
  return databases.updateDocument(DB_ID, ARTICLES_COL, articleId, {
    views: currentViews + 1,
  });
}

function parseUnknownAttribute(err) {
  const msg = err?.message || '';
  const match = msg.match(/Unknown attribute:\s*"([^"]+)"/i);
  return match ? match[1] : null;
}

async function createWithSchemaFallback(collectionId, data) {
  const payload = { ...data };
  for (let i = 0; i < 8; i += 1) {
    try {
      return await databases.createDocument(DB_ID, collectionId, ID.unique(), payload);
    } catch (err) {
      const unknownAttr = parseUnknownAttribute(err);
      if (!unknownAttr || !(unknownAttr in payload)) throw err;
      delete payload[unknownAttr];
    }
  }
  return databases.createDocument(DB_ID, collectionId, ID.unique(), payload);
}

async function updateWithSchemaFallback(collectionId, id, data) {
  const payload = { ...data };
  for (let i = 0; i < 8; i += 1) {
    try {
      return await databases.updateDocument(DB_ID, collectionId, id, payload);
    } catch (err) {
      const unknownAttr = parseUnknownAttribute(err);
      if (!unknownAttr || !(unknownAttr in payload)) throw err;
      delete payload[unknownAttr];
    }
  }
  return databases.updateDocument(DB_ID, collectionId, id, payload);
}

export async function createArticle(data) {
  return createWithSchemaFallback(ARTICLES_COL, data);
}

export async function updateArticle(id, data) {
  return updateWithSchemaFallback(ARTICLES_COL, id, data);
}

export async function deleteArticle(id) {
  return databases.deleteDocument(DB_ID, ARTICLES_COL, id);
}

// ─── Auth helpers ────────────────────────────────────────────────────────────
export async function adminLogin(email, password) {
  return account.createEmailPasswordSession(email, password);
}

export async function adminLogout() {
  return account.deleteSession('current');
}

export async function getAdminUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

// ─── Storage helpers ─────────────────────────────────────────────────────────
export function getFilePreviewUrl(fileId, width = 800, height = 450) {
  return buildStorageUrl(fileId, 'preview', {
    width: String(width),
    height: String(height),
    quality: '90',
  });
}

export function getFileViewUrl(fileId) {
  return buildStorageUrl(fileId, 'view');
}

export async function uploadFile(file) {
  if (!BUCKET_ID) {
    throw new Error(
      'Missing NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID in .env.local. Set it to your Appwrite bucket ID.'
    );
  }

  try {
    return await storage.createFile(BUCKET_ID, ID.unique(), file);
  } catch (err) {
    const msg = err?.message || '';
    if (/Storage bucket with the requested ID could not be found/i.test(msg)) {
      throw new Error(
        `Storage bucket '${BUCKET_ID}' not found. Set NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID to the real bucket ID from Appwrite Storage, or create a bucket with this ID.`
      );
    }
    throw err;
  }
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
export async function subscribeEmail(email, name) {
  return databases.createDocument(DB_ID, SUBSCRIBERS_COL, ID.unique(), {
    email,
    name,
    subscribedAt: new Date().toISOString(),
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategories() {
  return databases.listDocuments(DB_ID, CATEGORIES_COL, [Query.orderAsc('name')]);
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export async function getComments(articleId) {
  return databases.listDocuments(DB_ID, COMMENTS_COL, [
    Query.equal('articleId', articleId),
    Query.equal('approved', true),
    Query.orderDesc('createdAt'),
  ]);
}

export async function createComment(data) {
  return databases.createDocument(DB_ID, COMMENTS_COL, ID.unique(), {
    ...data,
    approved: false,
    createdAt: new Date().toISOString(),
  });
}
