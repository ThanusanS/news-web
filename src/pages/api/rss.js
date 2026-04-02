import { getArticles } from '../../lib/appwrite';
import { SITE_CONFIG } from '../../utils/constants';
import { stripHtml } from '../../utils/helpers';

export default async function handler(req, res) {
  try {
    const result = await getArticles({ limit: 20 });
    const articles = result.documents;

    const items = articles
      .map(
        (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${SITE_CONFIG.url}/${a.slug}</link>
      <guid isPermaLink="true">${SITE_CONFIG.url}/${a.slug}</guid>
      <description><![CDATA[${a.excerpt || stripHtml(a.content).slice(0, 300)}]]></description>
      <pubDate>${a.publishedAt ? new Date(a.publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
      <author>${a.author || 'CeylonUpdates Staff'}</author>
      <category>${a.category?.replace(/-/g, ' ')}</category>
      ${a.featuredImage ? `<enclosure url="${a.featuredImage}" type="image/jpeg"/>` : ''}
      ${(a.tags || []).map((t) => `<tag>${t}</tag>`).join('')}
    </item>`
      )
      .join('');

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${SITE_CONFIG.name}</title>
    <link>${SITE_CONFIG.url}</link>
    <description>${SITE_CONFIG.description}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_CONFIG.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_CONFIG.url}/logo.png</url>
      <title>${SITE_CONFIG.name}</title>
      <link>${SITE_CONFIG.url}</link>
    </image>
    <copyright>Copyright ${new Date().getFullYear()} ${SITE_CONFIG.name}</copyright>
    <managingEditor>editor@ceylonupdates.com (CeylonUpdates Editor)</managingEditor>
    <webMaster>tech@ceylonupdates.com (CeylonUpdates Tech)</webMaster>
    <ttl>60</ttl>
    ${items}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).send(feed);
  } catch (err) {
    console.error('[RSS] Error:', err);
    return res.status(500).json({ error: 'RSS feed generation failed' });
  }
}
