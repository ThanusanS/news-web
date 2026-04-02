import { NextSeo } from 'next-seo';
import Layout from '../../components/Layout';
import ArticleCard from '../../components/ArticleCard';
import { databases, DB_ID, ARTICLES_COL, Query } from '../../lib/appwrite';

export default function TagPage({ articles, tag }) {
  return (
    <>
      <NextSeo
        title={`#${tag} Articles | CeylonUpdates.com`}
        description={`All articles tagged with #${tag} on CeylonUpdates.com`}
      />
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="inline-block bg-accent text-white text-xs font-black tracking-widest px-3 py-1 rounded mb-3">TAG</div>
            <h1 className="font-head text-3xl font-black">#{tag}</h1>
            <p className="text-stone-500 dark:text-neutral-500 text-sm mt-1">{articles.length} articles tagged</p>
          </div>
          {articles.length === 0 ? (
            <div className="text-center py-20 text-stone-400">No articles with this tag yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((a) => <ArticleCard key={a.$id} article={a} />)}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { tag } = params;
  try {
    const res = await databases.listDocuments(DB_ID, ARTICLES_COL, [
      Query.search('tags', tag),
      Query.equal('status', 'published'),
      Query.limit(30),
    ]);
    return { props: { articles: res.documents, tag } };
  } catch {
    return { props: { articles: [], tag } };
  }
}
