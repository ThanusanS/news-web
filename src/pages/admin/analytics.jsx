import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import { FiTrendingUp, FiUsers, FiEye, FiClock, FiSmartphone, FiMonitor, FiGlobe } from 'react-icons/fi';

function MetricRow({ label, value, percent, color = 'bg-accent' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-stone-600 dark:text-neutral-400 w-32 shrink-0">{label}</span>
      <div className="flex-1 bg-stone-100 dark:bg-neutral-800 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-sm font-semibold text-stone-700 dark:text-neutral-300 w-16 text-right">{value}</span>
      <span className="text-xs text-stone-400 w-10 text-right">{percent}%</span>
    </div>
  );
}

function StatBox({ label, value, sub, icon: Icon, trend }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon size={17} className="text-accent" />
        </div>
        {trend && <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div className="font-head text-2xl font-black text-stone-900 dark:text-neutral-100">{value}</div>
      <div className="text-xs text-stone-500 dark:text-neutral-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-stone-400 dark:text-neutral-600 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const topPages = [
    { page: '/how-to-use-chatgpt-2026', views: 18400, sessions: 14200 },
    { page: '/sri-lanka-digital-economy', views: 24830, sessions: 19600 },
    { page: '/react-19-guide', views: 12200, sessions: 9800 },
    { page: '/python-beginners-2026', views: 14600, sessions: 11300 },
    { page: '/prompt-engineering-2026', views: 9800, sessions: 7200 },
  ];

  const trafficSources = [
    { label: 'Organic Search', value: '52,180', percent: 62, color: 'bg-blue-500' },
    { label: 'Direct', value: '13,380', percent: 16, color: 'bg-accent' },
    { label: 'Social Media', value: '10,100', percent: 12, color: 'bg-pink-500' },
    { label: 'Referral', value: '5,040', percent: 6, color: 'bg-green-500' },
    { label: 'Newsletter', value: '3,360', percent: 4, color: 'bg-purple-500' },
  ];

  const countries = [
    { label: 'Sri Lanka', value: '38,220', percent: 45 },
    { label: 'India', value: '16,840', percent: 20 },
    { label: 'United Kingdom', value: '8,440', percent: 10 },
    { label: 'United States', value: '6,740', percent: 8 },
    { label: 'Australia', value: '4,200', percent: 5 },
    { label: 'Other', value: '9,560', percent: 12 },
  ];

  return (
    <AdminLayout title="Analytics" description="Track your site traffic, engagement and growth.">
      <Head><title>Analytics | CeylonUpdates Admin</title></Head>

      {/* Google Analytics embed notice */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="text-blue-500 text-xl shrink-0"><FiGlobe size={20} /></div>
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Connect Google Analytics 4</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Add your GA4 Measurement ID in <strong>SEO Settings</strong> to embed live analytics here. The stats below are simulated examples.</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatBox label="Monthly Users" value="84,230" trend="↑ 23%" icon={FiUsers} />
        <StatBox label="Page Views" value="241,800" trend="↑ 31%" icon={FiEye} />
        <StatBox label="Avg. Session" value="2:45" sub="min:sec" icon={FiClock} />
        <StatBox label="Pages/Session" value="3.4" trend="↑ 0.3" icon={FiTrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Traffic sources */}
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-5">
          <h2 className="font-semibold text-stone-900 dark:text-neutral-100 mb-4">Traffic Sources</h2>
          <div className="space-y-3">
            {trafficSources.map((s) => <MetricRow key={s.label} {...s} />)}
          </div>
        </div>

        {/* Countries */}
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-5">
          <h2 className="font-semibold text-stone-900 dark:text-neutral-100 mb-4">Top Countries</h2>
          <div className="space-y-3">
            {countries.map((c) => <MetricRow key={c.label} {...c} color="bg-navy" />)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top pages */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-stone-100 dark:border-neutral-800">
            <h2 className="font-semibold text-stone-900 dark:text-neutral-100">Top Pages This Month</h2>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-neutral-800">
            {topPages.map((p, i) => (
              <div key={p.page} className="flex items-center gap-4 px-4 py-3">
                <span className="text-sm font-bold text-stone-300 dark:text-neutral-700 w-5 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 dark:text-neutral-300 truncate font-mono text-xs">{p.page}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-stone-900 dark:text-neutral-100">{p.views.toLocaleString()}</div>
                  <div className="text-xs text-stone-400 dark:text-neutral-600">views</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device breakdown */}
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-5">
          <h2 className="font-semibold text-stone-900 dark:text-neutral-100 mb-4">Devices</h2>
          <div className="space-y-4">
            {[
              { label: 'Mobile', icon: FiSmartphone, value: '58%', color: 'bg-accent' },
              { label: 'Desktop', icon: FiMonitor, value: '34%', color: 'bg-blue-500' },
              { label: 'Tablet', icon: FiGlobe, value: '8%', color: 'bg-green-500' },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${d.color} flex items-center justify-center`}>
                  <d.icon size={15} className="text-white" />
                </div>
                <span className="text-sm text-stone-600 dark:text-neutral-400 flex-1">{d.label}</span>
                <span className="font-bold text-stone-900 dark:text-neutral-100">{d.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-stone-100 dark:border-neutral-800">
            <h3 className="text-xs font-bold text-stone-500 dark:text-neutral-500 uppercase tracking-wider mb-3">AdSense Est. Revenue</h3>
            <div className="space-y-2">
              {[
                { m: 'This Month', v: '$284' },
                { m: 'Last Month', v: '$231' },
                { m: 'This Year', v: '$1,840' },
              ].map((r) => (
                <div key={r.m} className="flex justify-between text-sm">
                  <span className="text-stone-500 dark:text-neutral-500">{r.m}</span>
                  <span className="font-bold text-green-600">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
