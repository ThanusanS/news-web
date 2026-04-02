// next-seo.config.js
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ceylonupdates.com';

module.exports = {
  defaultTitle: 'CeylonUpdates.com — Latest Sri Lanka News, AI & Tech',
  titleTemplate: '%s | CeylonUpdates.com',
  description: 'Latest Sri Lanka news, AI tutorials, tech updates and programming guides. Your #1 source for fast, reliable news and in-depth tech content.',
  canonical: SITE_URL,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    site_name: 'CeylonUpdates.com',
    images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'CeylonUpdates.com' }],
  },
  twitter: {
    handle: '@CeylonUpdates',
    site: '@CeylonUpdates',
    cardType: 'summary_large_image',
  },
  additionalLinkTags: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
  ],
  additionalMetaTags: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#C8102E' },
    { name: 'author', content: 'CeylonUpdates.com' },
    { name: 'geo.region', content: 'LK' },
    { name: 'geo.placename', content: 'Sri Lanka' },
  ],
};
