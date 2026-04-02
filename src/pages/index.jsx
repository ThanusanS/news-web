import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import AdSense from '../components/AdSense';
import Link from 'next/link';
import Image from 'next/image';
import { FiCode, FiCpu, FiFileText } from 'react-icons/fi';
import { getArticles, getTrendingArticles } from '../lib/appwrite';

// Fallback demo articles for when Appwrite is not yet configured
const DEMO_ARTICLES = [
  {
    $id: '1',
    slug: 'sri-lanka-digital-economy-2026',
    title: "Sri Lanka's Digital Economy Reaches Record $8.5B — Government Targets $25B by 2030",
    category: 'sri-lanka',
    author: 'Nimal Perera',
    publishedAt: new Date().toISOString(),
    views: 24830,
    excerpt:
      "Strong performance in tourism, exports and digital services drives Sri Lanka's digital transformation.",
    content: 'Lorem ipsum '.repeat(200),
  },
  {
    $id: '2',
    slug: 'chatgpt-guide-2026',
    title: 'How to Use ChatGPT for Content Creation — Complete 2026 Guide',
    category: 'ai-tutorials',
    author: 'Kasun Silva',
    publishedAt: new Date().toISOString(),
    views: 18400,
    excerpt:
      'Master ChatGPT with proven prompting techniques for writing, coding, research and business tasks.',
    content: 'Lorem ipsum '.repeat(200),
  },
  {
    $id: '3',
    slug: 'apple-wwdc-2026',
    title: 'Apple WWDC 2026: M5 Chip, iOS 20 & AI-Native Siri Unveiled',
    category: 'tech-news',
    author: 'Ravi De Silva',
    publishedAt: new Date().toISOString(),
    views: 12200,
    excerpt: "Apple's biggest developer conference brought major AI upgrades across all platforms.",
    content: 'Lorem ipsum '.repeat(200),
  },
  {
    $id: '4',
    slug: 'react-19-guide',
    title: 'React 19 Complete Guide: Server Components, Actions & New Hooks',
    category: 'programming',
    author: 'Janaka Fernando',
    publishedAt: new Date().toISOString(),
    views: 9800,
    excerpt:
      'Everything changed in React 19. Here is your complete guide with real project examples.',
    content: 'Lorem ipsum '.repeat(200),
  },
  {
    $id: '5',
    slug: 'prompt-engineering-2026',
    title: 'Master Prompt Engineering: 20 Techniques That Actually Work in 2026',
    category: 'ai-tutorials',
    author: 'Sunil Dias',
    publishedAt: new Date().toISOString(),
    views: 15600,
    excerpt:
      'From chain-of-thought to meta-prompts, these battle-tested techniques will transform how you use AI.',
    content: 'Lorem ipsum '.repeat(200),
  },
  {
    $id: '6',
    slug: 'sri-lanka-tourism-record',
    title: 'Record 2.1 Million Tourists Visit Sri Lanka in Q1 2026 — Europe Leads',
    category: 'sri-lanka',
    author: 'Amila Perera',
    publishedAt: new Date().toISOString(),
    views: 8300,
    excerpt:
      "Sri Lanka's tourism sector continues its remarkable post-pandemic recovery with record-breaking figures.",
    content: 'Lorem ipsum '.repeat(200),
  },
];

export default function HomePage({ latestArticles, trendingArticles, heroArticle, sideArticles }) {
  return (
    <>
      <NextSeo
        title="CeylonUpdates.com — Latest Sri Lanka News, AI Tutorials & Tech"
        description="Latest Sri Lanka news, AI tutorials, tech updates and programming guides. Your #1 source for fast, reliable news and in-depth tech content. Updated 5× daily."
        canonical="https://ceylonupdates.com"
        openGraph={{
          type: 'website',
          url: 'https://ceylonupdates.com',
          title: 'CeylonUpdates.com — Latest Sri Lanka News, AI & Tech',
          description: 'Latest Sri Lanka news, AI tutorials, tech updates and programming guides.',
          images: [{ url: 'https://ceylonupdates.com/og-default.jpg', width: 1200, height: 630 }],
          site_name: 'CeylonUpdates.com',
        }}
        twitter={{ cardType: 'summary_large_image', site: '@CeylonUpdates' }}
      />

      <Layout>
        {/* ── HERO ── */}
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Main hero */}
            <Link
              href={`/${heroArticle?.slug || '#'}`}
              className="group relative block min-h-[360px] cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-navy to-accent lg:col-span-2"
            >
              {heroArticle?.featuredImage && (
                <Image
                  src={heroArticle.featuredImage}
                  alt={heroArticle.title}
                  fill
                  className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              )}
              <div className="hero-overlay absolute inset-0" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="mb-3 inline-block rounded bg-accent px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                  {heroArticle?.category?.replace(/-/g, ' ') || 'Sri Lanka'}
                </span>
                <h1 className="mb-2 font-head text-2xl font-black leading-snug text-white md:text-3xl">
                  {heroArticle?.title || 'Welcome to CeylonUpdates — Your Daily News & Tech Source'}
                </h1>
                <p className="text-sm text-white/70">
                  By {heroArticle?.author || 'Staff Writer'} &nbsp;·&nbsp;{' '}
                  {Number(heroArticle?.views || 0).toLocaleString('en-US')} views &nbsp;·&nbsp; 5
                  min read
                </p>
              </div>
            </Link>

            {/* Side cards */}
            <div className="flex flex-col gap-3">
              {sideArticles.slice(0, 4).map((a) => (
                <Link
                  key={a.$id}
                  href={`/${a.slug}`}
                  className="group flex gap-3 rounded-lg border border-stone-200 bg-white p-3 transition-all hover:border-accent dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-gradient-to-br from-navy to-accent text-xl">
                    {a.featuredImage ? (
                      <Image
                        src={a.featuredImage}
                        alt={a.title}
                        width={80}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiFileText size={18} />
                    )}
                  </div>
                  <div>
                    <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-accent">
                      {a.category?.replace(/-/g, ' ')}
                    </div>
                    <h3 className="line-clamp-2 font-head text-sm font-bold leading-snug text-stone-900 transition-colors group-hover:text-accent dark:text-neutral-100">
                      {a.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-stone-400 dark:text-neutral-600">
                      {Number(a.views || 0).toLocaleString('en-US')} views ·{' '}
                      {Math.ceil((a.content?.split(' ')?.length || 400) / 200)} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── LEADERBOARD AD ── */}
        <div className="mx-auto mb-6 flex max-w-7xl justify-center px-4">
          <AdSense type="leaderboard" />
        </div>

        {/* ── MAIN CONTENT + SIDEBAR ── */}
        <div className="mx-auto max-w-7xl px-4 pb-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              {/* Latest News */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between border-b-2 border-stone-200 pb-2 dark:border-neutral-800">
                  <h2 className="section-title">Latest News</h2>
                  <Link
                    href="/category/sri-lanka"
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    All News →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {latestArticles.slice(0, 3).map((a) => (
                    <ArticleCard key={a.$id} article={a} />
                  ))}
                </div>
              </div>

              {/* In-article ad */}
              <div className="mb-8 flex justify-center">
                <AdSense type="inArticle" />
              </div>

              {/* AI Tutorials */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between border-b-2 border-stone-200 pb-2 dark:border-neutral-800">
                  <h2 className="section-title">
                    <FiCpu className="mr-2 inline-block" size={16} />
                    AI Tutorials
                  </h2>
                  <Link
                    href="/category/ai-tutorials"
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    All Tutorials →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {latestArticles
                    .filter((a) => a.category === 'ai-tutorials')
                    .slice(0, 3)
                    .map((a) => (
                      <ArticleCard key={a.$id} article={a} />
                    ))}
                </div>
              </div>

              {/* Programming Guides */}
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between border-b-2 border-stone-200 pb-2 dark:border-neutral-800">
                  <h2 className="section-title">
                    <FiCode className="mr-2 inline-block" size={16} />
                    Programming Guides
                  </h2>
                  <Link
                    href="/category/programming"
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    All Guides →
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {latestArticles
                    .filter((a) => a.category === 'programming')
                    .slice(0, 3)
                    .map((a) => (
                      <ArticleCard key={a.$id} article={a} />
                    ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <Sidebar trendingArticles={trendingArticles} />
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  try {
    const [latestRes, trendingRes] = await Promise.allSettled([
      getArticles({ limit: 12 }),
      getTrendingArticles(6),
    ]);

    const latestArticles = latestRes.status === 'fulfilled' ? latestRes.value.documents : [];
    const trendingArticles = trendingRes.status === 'fulfilled' ? trendingRes.value.documents : [];
    const safeLatest = latestArticles.length ? latestArticles : DEMO_ARTICLES;
    const safeTrending = trendingArticles.length ? trendingArticles : safeLatest.slice(0, 5);

    return {
      props: {
        latestArticles: safeLatest,
        trendingArticles: safeTrending,
        heroArticle: safeLatest[0] || null,
        sideArticles: safeLatest.slice(1, 5),
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        latestArticles: DEMO_ARTICLES,
        trendingArticles: DEMO_ARTICLES.slice(0, 5),
        heroArticle: DEMO_ARTICLES[0],
        sideArticles: DEMO_ARTICLES.slice(1, 5),
      },
      revalidate: 60,
    };
  }
}
