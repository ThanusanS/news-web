// pages/sitemap.xml.jsx
import { getArticles } from '../lib/appwrite';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ceylonupdates.me';

const STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  { path: '/write-for-us', priority: '0.7', changefreq: 'monthly' },
  { path: '/advertise', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.6', changefreq: 'yearly' },
  { path: '/terms', priority: '0.6', changefreq: 'yearly' },
  { path: '/category/sri-lanka', priority: '0.9', changefreq: 'hourly' },
  { path: '/category/tech-news', priority: '0.9', changefreq: 'daily' },
  { path: '/category/sports', priority: '0.8', changefreq: 'daily' },
  { path: '/category/ai-tutorials', priority: '0.9', changefreq: 'weekly' },
  { path: '/category/jobs-careers', priority: '0.8', changefreq: 'weekly' },
  { path: '/category/education', priority: '0.8', changefreq: 'weekly' },
  { path: '/category/programming', priority: '0.9', changefreq: 'weekly' },
  { path: '/category/world', priority: '0.8', changefreq: 'daily' },
  { path: '/search', priority: '0.7', changefreq: 'monthly' },
];

function generateSitemap(articles) {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${STATIC_PAGES.map(
    (p) => `<url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join('\n  ')}
  ${articles
    .map(
      (a) => `<url>
    <loc>${SITE_URL}/${a.slug}</loc>
    <lastmod>${a.updatedAt || a.publishedAt || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <news:news>
      <news:publication>
        <news:name>CeylonUpdates.me</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt || now}</news:publication_date>
      <news:title>${a.title?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
    </news:news>
  </url>`
    )
    .join('\n  ')}
</urlset>`;
}

function SitemapPage() {
  return null;
}

export async function getServerSideProps({ res }) {
  try {
    const result = await getArticles({ limit: 1000 });
    const sitemap = generateSitemap(result?.documents || []);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    res.write(sitemap);
    res.end();
  } catch {
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    res.write(generateSitemap([]));
    res.end();
  }
  return { props: {} };
}

export default SitemapPage;
