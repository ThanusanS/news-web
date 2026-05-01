/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ceylonupdates.me',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/admin/*', '/api/*', '/404', '/500'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/_next/', '/search?*'] },
      { userAgent: 'Googlebot', allow: '/' },
    ],
  },
  transform: async (config, path) => {
    // Higher priority for news articles
    const isArticle =
      !path.includes('/category/') &&
      !path.includes('/tag/') &&
      path !== '/' &&
      path !== '/about' &&
      path !== '/search';
    return {
      loc: path,
      changefreq: isArticle ? 'monthly' : 'daily',
      priority: path === '/' ? 1.0 : isArticle ? 0.8 : 0.7,
      lastmod: new Date().toISOString(),
    };
  },
};
