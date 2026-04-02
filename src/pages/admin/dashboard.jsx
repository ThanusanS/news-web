import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import AdminLayout from '../../components/admin/AdminLayout';
import { databases, DB_ID, ARTICLES_COL, SUBSCRIBERS_COL, COMMENTS_COL, Query } from '../../lib/appwrite';
import { formatNumber, getCategoryEmoji } from '../../utils/helpers';
import {
  FiTrendingUp, FiFileText, FiUsers, FiMail,
  FiEye, FiEdit2, FiTrash2, FiArrowUp, FiActivity,
  FiPlusCircle, FiMessageSquare,
} from 'react-icons/fi';

function StatCard({ label, value, change, icon: Icon, color = 'accent', loading }) {
  const colorMap = {
    accent:  'from-red-500 to-rose-600',
    blue:    'from-blue-500 to-blue-600',
    green:   'from-green-500 to-emerald-600',
    purple:  'from-purple-500 to-violet-600',
  };
  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        {change && (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
            <FiArrowUp size={11} /> {change}
          </span>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-stone-100 dark:bg-neutral-800 rounded animate-pulse mb-1" />
      ) : (
        <div className="font-head text-3xl font-black text-stone-900 dark:text-neutral-100">{value}</div>
      )}
      <div className="text-xs text-stone-500 dark:text-neutral-500 mt-1">{label}</div>
    </div>
  );
}

function MiniBarChart({ data, color = '#C8102E' }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-300"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.5 }}
          title={`${v} views`}
        />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ articles: 0, published: 0, drafts: 0, totalViews: 0, subscribers: 0, comments: 0 });
  const [recentArticles, setRecentArticles] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fake sparkline data (replace with real analytics)
  const viewsSparkline = [1200, 1800, 1400, 2200, 1900, 2800, 3100, 2600, 3400, 2900, 3800, 4200];

  useEffect(() => {
    async function load() {
      try {
        const [articlesRes, publishedRes, subsRes, commentsRes, topRes] = await Promise.all([
          databases.listDocuments(DB_ID, ARTICLES_COL, [Query.limit(5), Query.orderDesc('$createdAt')]),
          databases.listDocuments(DB_ID, ARTICLES_COL, [Query.equal('status', 'published'), Query.limit(1)]),
          databases.listDocuments(DB_ID, SUBSCRIBERS_COL, [Query.limit(1)]),
          databases.listDocuments(DB_ID, COMMENTS_COL, [Query.equal('approved', false), Query.limit(5)]),
          databases.listDocuments(DB_ID, ARTICLES_COL, [Query.orderDesc('views'), Query.limit(5)]),
        ]);
        const totalViews = articlesRes.documents.reduce((s, a) => s + (a.views || 0), 0);
        setStats({
          articles: articlesRes.total,
          published: publishedRes.total,
          drafts: articlesRes.total - publishedRes.total,
          totalViews,
          subscribers: subsRes.total,
          comments: commentsRes.total,
        });
        setRecentArticles(articlesRes.documents);
        setTopArticles(topRes.documents);
        setPendingComments(commentsRes.documents);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <Head><title>Dashboard | CeylonUpdates Admin</title></Head>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Articles" value={formatNumber(stats.articles)} change="12 this week" icon={FiFileText} color="blue" loading={loading} />
        <StatCard label="Total Views" value={formatNumber(stats.totalViews)} change="23%" icon={FiEye} color="accent" loading={loading} />
        <StatCard label="Subscribers" value={formatNumber(stats.subscribers)} change="340 this week" icon={FiMail} color="green" loading={loading} />
        <StatCard label="Pending Comments" value={stats.comments} icon={FiMessageSquare} color="purple" loading={loading} />
      </div>

      {/* Traffic overview + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Traffic chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-stone-900 dark:text-neutral-100">Traffic Overview</h2>
              <p className="text-xs text-stone-400 dark:text-neutral-600">Last 12 months</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full">
              <FiTrendingUp size={12} /> 84K monthly
            </div>
          </div>
          <MiniBarChart data={viewsSparkline} />
          <div className="flex justify-between mt-2">
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m) => (
              <span key={m} className="text-[9px] text-stone-400">{m}</span>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-5">
          <h2 className="font-semibold text-stone-900 dark:text-neutral-100 mb-4">Quick Post</h2>
          <div className="space-y-2">
            {[
              { label: '🇱🇰 Sri Lanka News', cat: 'sri-lanka' },
              { label: '🤖 AI Tutorial', cat: 'ai-tutorials' },
              { label: '💻 Tech Article', cat: 'tech-news' },
              { label: '🐍 Dev Guide', cat: 'programming' },
              { label: '🌍 World News', cat: 'world' },
            ].map((q) => (
              <Link
                key={q.cat}
                href={`/admin/new-post?category=${q.cat}`}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg bg-stone-50 dark:bg-neutral-800 hover:bg-accent hover:text-white border border-stone-200 dark:border-neutral-700 hover:border-accent transition-all font-medium group"
              >
                {q.label}
                <FiPlusCircle size={13} className="ml-auto opacity-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent articles + top articles + pending comments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent articles */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-neutral-800">
            <h2 className="font-semibold text-stone-900 dark:text-neutral-100">Recent Articles</h2>
            <Link href="/admin/posts" className="text-xs text-accent hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-neutral-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-100 dark:bg-neutral-800 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-stone-100 dark:bg-neutral-800 rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))
            ) : recentArticles.length === 0 ? (
              <div className="p-8 text-center text-stone-400 dark:text-neutral-600">
                <FiFileText size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No articles yet.</p>
                <Link href="/admin/new-post" className="text-accent text-sm hover:underline mt-1 block">Create your first article →</Link>
              </div>
            ) : recentArticles.map((a) => (
              <div key={a.$id} className="flex items-center gap-3 p-4 hover:bg-stone-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-neutral-800 flex items-center justify-center text-lg shrink-0">
                  {getCategoryEmoji(a.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-neutral-100 truncate">{a.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-stone-400 dark:text-neutral-600 capitalize">{a.category?.replace(/-/g, ' ')}</span>
                    <span className="text-xs text-stone-400 dark:text-neutral-600">👁 {a.views?.toLocaleString() || 0}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {a.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/${a.slug}`} target="_blank" className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-neutral-700 text-stone-400 hover:text-accent transition-colors"><FiEye size={13} /></Link>
                  <Link href={`/admin/edit-post/${a.$id}`} className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-neutral-700 text-stone-400 hover:text-accent transition-colors"><FiEdit2 size={13} /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: top articles + pending comments */}
        <div className="space-y-4">
          {/* Top articles */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4">
            <h2 className="font-semibold text-stone-900 dark:text-neutral-100 mb-3">🔥 Top Articles</h2>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-6 h-4 bg-stone-100 dark:bg-neutral-800 rounded animate-pulse" />
                    <div className="flex-1 h-4 bg-stone-100 dark:bg-neutral-800 rounded animate-pulse" />
                  </div>
                ))
              ) : topArticles.map((a, i) => (
                <div key={a.$id} className="flex items-start gap-2">
                  <span className="font-head text-lg font-black text-stone-200 dark:text-neutral-700 w-6 shrink-0 leading-none mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/${a.slug}`} target="_blank" className="text-xs font-medium text-stone-700 dark:text-neutral-300 hover:text-accent line-clamp-2 leading-snug">
                      {a.title}
                    </Link>
                    <p className="text-[10px] text-stone-400 mt-0.5">👁 {a.views?.toLocaleString() || 0} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending comments */}
          <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-stone-900 dark:text-neutral-100">💬 Pending Comments</h2>
              <Link href="/admin/comments" className="text-xs text-accent hover:underline">All →</Link>
            </div>
            {pendingComments.length === 0 ? (
              <p className="text-xs text-stone-400 dark:text-neutral-600 text-center py-4">No pending comments 🎉</p>
            ) : pendingComments.map((c) => (
              <div key={c.$id} className="border-b border-stone-100 dark:border-neutral-800 last:border-0 py-2">
                <p className="text-xs font-medium text-stone-800 dark:text-neutral-200">{c.name}</p>
                <p className="text-xs text-stone-500 dark:text-neutral-500 line-clamp-2 mt-0.5">{c.content}</p>
                <div className="flex gap-2 mt-1.5">
                  <button className="text-[10px] font-bold text-green-600 hover:underline">Approve</button>
                  <button className="text-[10px] font-bold text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
