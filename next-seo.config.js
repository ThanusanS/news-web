// next-seo.config.js
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ceylonupdates.me';

module.exports = {
  defaultTitle: 'CeylonUpdates.me — Latest Sri Lanka News, AI & Tech',
  titleTemplate: '%s | CeylonUpdates.me',
  description:
    'Latest Sri Lanka news, AI & Innovation, tech updates and programming guides. Your #1 source for fast, reliable news and in-depth tech content.',
  canonical: SITE_URL,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    site_name: 'CeylonUpdates.me',
    images: [
      { url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630, alt: 'CeylonUpdates.me' },
    ],
  },
  twitter: {
    handle: '@CeylonUpdates',
    site: '@CeylonUpdates',
    cardType: 'summary_large_image',
  },
  additionalLinkTags: [
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
  ],
  additionalMetaTags: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#C8102E' },
    { name: 'author', content: 'CeylonUpdates.me' },
    { name: 'geo.region', content: 'LK' },
    { name: 'geo.placename', content: 'Sri Lanka' },
  ],
};
