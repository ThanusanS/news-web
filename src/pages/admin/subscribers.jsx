import { useState, useEffect } from 'react';
import Head from 'next/head';
import { format } from 'date-fns';
import AdminLayout from '../../components/admin/AdminLayout';
import { databases, DB_ID, SUBSCRIBERS_COL, Query } from '../../lib/appwrite';
import { formatNumber } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FiDownload, FiMail, FiTrash2, FiSearch, FiUsers, FiTrendingUp } from 'react-icons/fi';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSubs(); }, []);

  async function fetchSubs() {
    setLoading(true);
    try {
      const res = await databases.listDocuments(DB_ID, SUBSCRIBERS_COL, [
        Query.orderDesc('subscribedAt'), Query.limit(100),
      ]);
      setSubscribers(res.documents);
      setTotal(res.total);
    } catch { setSubscribers([]); }
    setLoading(false);
  }

  async function remove(id) {
    if (!confirm('Unsubscribe and delete this record?')) return;
    try {
      await databases.deleteDocument(DB_ID, SUBSCRIBERS_COL, id);
      setSubscribers((prev) => prev.filter((s) => s.$id !== id));
      setTotal((t) => t - 1);
      toast.success('Subscriber removed.');
    } catch { toast.error('Failed.'); }
  }

  function exportCsv() {
    const rows = [['Name', 'Email', 'Subscribed At', 'Source']];
    subscribers.forEach((s) => rows.push([s.name || '', s.email, s.subscribedAt || '', s.source || '']));
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ceylonupdates-subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = subscribers.filter((s) =>
    !search || s.email?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Subscribers" description="Manage your newsletter subscribers.">
      <Head><title>Subscribers | CeylonUpdates Admin</title></Head>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Subscribers', value: formatNumber(total), Icon: FiUsers },
          { label: 'This Week', value: '+340', Icon: FiTrendingUp },
          { label: 'Open Rate (est.)', value: '24.6%', Icon: FiMail },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4">
            <div className="mb-2 text-accent"><s.Icon size={20} /></div>
            <div className="font-head text-2xl font-black text-stone-900 dark:text-neutral-100">{s.value}</div>
            <div className="text-xs text-stone-500 dark:text-neutral-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="form-input pl-9" />
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 btn-secondary text-sm">
          <FiDownload size={14} /> Export CSV
        </button>
        <button className="flex items-center gap-2 btn-primary text-sm">
          <FiMail size={14} /> Send Newsletter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-neutral-800 text-xs text-stone-500 dark:text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Source</th>
                <th className="text-left px-4 py-3">Subscribed</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-neutral-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-stone-100 dark:bg-neutral-800 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-stone-400">No subscribers found.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.$id} className="hover:bg-stone-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-neutral-100">{s.name || '—'}</td>
                  <td className="px-4 py-3 text-stone-600 dark:text-neutral-400 font-mono text-xs">{s.email}</td>
                  <td className="px-4 py-3 text-stone-500 dark:text-neutral-500 text-xs">{s.source || 'direct'}</td>
                  <td className="px-4 py-3 text-stone-500 dark:text-neutral-500 text-xs whitespace-nowrap">
                    {s.subscribedAt ? format(new Date(s.subscribedAt), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.active !== false ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                      {s.active !== false ? 'ACTIVE' : 'UNSUBSCRIBED'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(s.$id)} className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
                      <FiTrash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
