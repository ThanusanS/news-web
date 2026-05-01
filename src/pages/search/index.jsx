import { useState } from 'react';
import { NextSeo } from 'next-seo';
import Layout from '../../components/Layout';
import ArticleCard from '../../components/ArticleCard';
import { FiSearch } from 'react-icons/fi';

const POPULAR_SEARCHES = [
  'ChatGPT 2026',
  'Sri Lanka news',
  'AI tools',
  'Python tutorial',
  'React 19',
  'MERN stack',
  'machine learning',
  'Colombo tech',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function doSearch(q) {
    const term = (q || query).trim();
    if (!term) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ search: term, status: 'published', limit: '20' });
      const res = await fetch(`/api/articles?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data?.documents || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <>
      <NextSeo
        title="Search Articles | CeylonUpdates.me"
        description="Search for Sri Lanka news, AI & Innovation, tech articles and programming guides on CeylonUpdates.me"
      />
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="mb-6 font-head text-3xl font-black text-stone-900 dark:text-neutral-50">
            Search
          </h1>

          {/* Search bar */}
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                size={18}
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                placeholder='Try "ChatGPT tutorial" or "Sri Lanka news"'
                className="w-full rounded-lg border-2 border-stone-200 bg-white py-3 pl-11 pr-4 text-base text-stone-900 transition-colors focus:border-accent focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <button onClick={() => doSearch()} className="btn-primary px-6 py-3 text-base">
              Search
            </button>
          </div>

          {/* Popular searches */}
          {!searched && (
            <div className="mb-8">
              <p className="mb-2 text-xs text-stone-400 dark:text-neutral-600">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                      doSearch(s);
                    }}
                    className="tag-pill"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="py-16 text-center text-stone-400 dark:text-neutral-600">
              <div className="mb-4 flex justify-center text-accent">
                <FiSearch size={44} />
              </div>
              <p className="mb-2 text-lg font-semibold">No results for "{query}"</p>
              <p className="text-sm">Try different keywords or browse our categories.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <p className="mb-5 text-sm text-stone-500 dark:text-neutral-500">
                {results.length} result{results.length !== 1 ? 's' : ''} for "
                <strong>{query}</strong>"
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results.map((a) => (
                  <ArticleCard key={a.$id} article={a} />
                ))}
              </div>
            </>
          )}
        </div>
      </Layout>
    </>
  );
}
