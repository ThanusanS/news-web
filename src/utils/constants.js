export const SITE_CONFIG = {
  name: 'CeylonUpdates.com',
  tagline: 'Latest Sri Lanka News, AI & Tech',
  description: 'Latest Sri Lanka news, AI tutorials, tech updates and programming guides. Your #1 source for fast, reliable news and in-depth tech content.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ceylonupdates.com',
  twitterHandle: '@CeylonUpdates',
  locale: 'en_US',
  country: 'LK',
  language: 'en',
  postsPerPage: 12,
  trendingCount: 5,
  breakingNewsCount: 6,
  recentArticlesCount: 3,
};

export const CATEGORIES = [
  { slug: 'sri-lanka',    label: 'Sri Lanka News 🇱🇰',    iconKey: 'sri-lanka', description: 'Latest news from Sri Lanka — politics, economy, sports and culture.', color: 'red',    keywords: ['Sri Lanka news', 'Colombo', 'Ceylon'] },
  { slug: 'tech-news',   label: 'Tech News',    iconKey: 'tech-news', description: 'Global technology updates curated for South Asian readers.', color: 'blue',   keywords: ['technology news', 'gadgets', 'startups'] },
  { slug: 'sports',      label: 'Sports',       iconKey: 'sports', description: 'Sports highlights, cricket updates and match coverage.', color: 'emerald', keywords: ['sports news', 'cricket', 'football'] },
  { slug: 'ai-tutorials',label: 'AI & Innovation', iconKey: 'ai-tutorials', description: 'Learn ChatGPT, Claude, Gemini and the best AI tools.', color: 'indigo', keywords: ['ChatGPT', 'AI tools', 'machine learning'] },
  { slug: 'jobs-careers',label: 'Jobs & Careers', iconKey: 'jobs-careers', description: 'Career growth guides, hiring trends and job opportunities.', color: 'orange', keywords: ['jobs', 'careers', 'remote work'] },
  { slug: 'education',   label: 'Education',    iconKey: 'education', description: 'Education updates, exams, universities and learning resources.', color: 'sky', keywords: ['education', 'universities', 'study tips'] },
  { slug: 'programming', label: 'Programming',  iconKey: 'programming', description: 'In-depth tutorials on MERN, Python, React and more.', color: 'green',  keywords: ['programming', 'coding', 'web development'] },
  { slug: 'world',       label: 'World News',        iconKey: 'world', description: 'International news and global affairs.', color: 'purple', keywords: ['world news', 'international', 'global'] },
  { slug: 'business',    label: 'Business',     iconKey: 'business', description: 'Business news, markets and entrepreneurship.', color: 'yellow', keywords: ['business', 'economy', 'markets'] },
];

export const AD_SLOTS = {
  LEADERBOARD:  { id: '1234567890', size: '728x90',  label: 'Leaderboard' },
  RECTANGLE:    { id: '0987654321', size: '300x250',  label: 'Medium Rectangle' },
  HALF_PAGE:    { id: '1122334455', size: '300x600',  label: 'Half Page' },
  IN_ARTICLE:   { id: '5544332211', size: '728x90',  label: 'In-Article' },
  MOBILE:       { id: '9988776655', size: '320x100',  label: 'Mobile Banner' },
  NATIVE:       { id: '6677889900', size: 'fluid',    label: 'Native' },
};

export const NAV_LINKS = [
  { label: 'Home',          href: '/' },
  { label: 'Sri Lanka News 🇱🇰', href: '/category/sri-lanka' },
  { label: 'World News',    href: '/category/world' },
  { label: 'Sports',        href: '/category/sports' },
  { label: 'Tech News',     href: '/category/tech-news' },
  { label: 'AI & Innovation', href: '/category/ai-tutorials' },
  { label: 'Jobs & Careers', href: '/category/jobs-careers' },
  { label: 'Education',     href: '/category/education' },
  { label: 'Search',        href: '/search' },
];

export const ADMIN_NAV = [
  { label: 'Dashboard',    href: '/admin/dashboard',  icon: 'FiHome' },
  { label: 'All Posts',    href: '/admin/posts',       icon: 'FiFileText' },
  { label: 'New Post',     href: '/admin/new-post',    icon: 'FiPlusCircle' },
  { label: 'Media',        href: '/admin/media',       icon: 'FiImage' },
  { label: 'Categories',   href: '/admin/categories',  icon: 'FiTag' },
  { label: 'Comments',     href: '/admin/comments',    icon: 'FiMessageSquare' },
  { label: 'Subscribers',  href: '/admin/subscribers', icon: 'FiMail' },
  { label: 'Analytics',    href: '/admin/analytics',   icon: 'FiBarChart2' },
  { label: 'SEO',          href: '/admin/seo',         icon: 'FiSearch' },
  { label: 'Users',        href: '/admin/users',       icon: 'FiUsers' },
  { label: 'Settings',     href: '/admin/settings',    icon: 'FiSettings' },
];

export const SEO_KEYWORDS = {
  primary: ['latest news Sri Lanka', 'AI tools 2026', 'how to use ChatGPT', 'MERN stack tutorial', 'Python beginner 2026'],
  secondary: ['Sri Lanka technology', 'Colombo news', 'React tutorial', 'machine learning guide', 'artificial intelligence Sri Lanka'],
};

export const SOCIAL_LINKS = {
  facebook:  'https://facebook.com/ceylonupdates',
  twitter:   'https://twitter.com/ceylonupdates',
  youtube:   'https://youtube.com/@ceylonupdates',
  whatsapp:  'https://whatsapp.com/channel/ceylonupdates',
  telegram:  'https://t.me/ceylonupdates',
  instagram: 'https://instagram.com/ceylonupdates',
};

export const API_ROUTES = {
  ARTICLES:    '/api/articles',
  NEWSLETTER:  '/api/newsletter',
  COMMENTS:    '/api/comments',
  UPLOAD:      '/api/upload',
  SEARCH:      '/api/search',
  RSS:         '/api/rss',
  OG:          '/api/og',
  ANALYTICS:   '/api/analytics',
};

export const REVALIDATE = {
  HOME:     300,   // 5 min
  ARTICLE:  600,   // 10 min
  CATEGORY: 300,   // 5 min
  TRENDING: 120,   // 2 min
};
