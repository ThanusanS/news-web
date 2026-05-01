const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ceylonupdates.me';
const SITE_NAME = 'CeylonUpdates.me';

export function buildSeoProps({
  title,
  description,
  slug,
  image,
  canonicalUrl,
  ogTitle,
  ogDescription,
  type = 'article',
  article,
}) {
  const url = slug ? `${SITE_URL}/${slug}` : SITE_URL;
  const canonical = canonicalUrl || url;
  const ogImage = image || `${SITE_URL}/og-default.jpg`;
  const resolvedOgTitle = ogTitle || title;
  const resolvedOgDescription = ogDescription || description;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    canonical,
    openGraph: {
      type,
      url: canonical,
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      site_name: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(article && {
        article: {
          publishedTime: article.publishedAt,
          modifiedTime: article.updatedAt,
          authors: [article.author],
          tags: article.tags,
        },
      }),
    },
    twitter: {
      cardType: 'summary_large_image',
      site: '@CeylonUpdates',
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      image: ogImage,
    },
    additionalMetaTags: [
      { name: 'keywords', content: Array.isArray(article?.tags) ? article.tags.join(', ') : '' },
    ],
  };
}

export function buildArticleSchema(article, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: article.newsImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: Array.isArray(article.tags) ? article.tags.join(', ') : '',
  };
}

export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function estimateReadTime(content = '') {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / 200);
}

export function generateExcerpt(content = '', length = 160) {
  const text = content.replace(/<[^>]*>/g, '');
  return text.length > length ? text.substring(0, length).trim() + '...' : text;
}
