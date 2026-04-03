import { useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { FiSave, FiRefreshCw, FiSend, FiMail, FiAlertTriangle } from 'react-icons/fi';

const TABS = ['General', 'SEO', 'Integrations', 'Email', 'Security'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success('Settings saved successfully!');
  }

  return (
    <AdminLayout title="Settings">
      <Head><title>Settings | CeylonUpdates Admin</title></Head>

      {/* Tab bar */}
      <div className="flex gap-0 mb-6 border-b border-stone-200 dark:border-neutral-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t
                ? 'border-accent text-accent'
                : 'border-transparent text-stone-500 dark:text-neutral-500 hover:text-stone-700 dark:hover:text-neutral-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">

            {activeTab === 'General' && (
              <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
                <h2 className="font-semibold border-b border-stone-100 dark:border-neutral-800 pb-3">Site Configuration</h2>
                {[
                  { label: 'Site Name', key: 'siteName', value: 'CeylonUpdates.com', type: 'text' },
                  { label: 'Site URL', key: 'siteUrl', value: 'https://ceylonupdates.com', type: 'url' },
                  { label: 'Tagline', key: 'tagline', value: 'Latest Sri Lanka News, AI & Tech', type: 'text' },
                  { label: 'Contact Email', key: 'contactEmail', value: 'editor@ceylonupdates.com', type: 'email' },
                  { label: 'Posts Per Page', key: 'postsPerPage', value: '12', type: 'number' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">{f.label}</label>
                    <input type={f.type} defaultValue={f.value} className="form-input" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Site Description</label>
                  <textarea rows={3} defaultValue="Sri Lanka's fastest-growing news and tech platform." className="form-input resize-none" />
                </div>
              </div>
            )}

            {activeTab === 'SEO' && (
              <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
                <h2 className="font-semibold border-b border-stone-100 dark:border-neutral-800 pb-3">SEO & Social</h2>
                {[
                  { label: 'Google Analytics ID', key: 'gaId', placeholder: 'G-XXXXXXXXXX' },
                  { label: 'Google Search Console', key: 'gsc', placeholder: 'Verification meta tag content' },
                  { label: 'Facebook App ID', key: 'fbId', placeholder: '1234567890' },
                  { label: 'Twitter Handle', key: 'twitter', placeholder: '@CeylonUpdates' },
                  { label: 'AdSense Publisher ID', key: 'adsense', placeholder: 'ca-pub-XXXXXXXXXXXXXXXX' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">{f.label}</label>
                    <input type="text" placeholder={f.placeholder} className="form-input font-mono" />
                  </div>
                ))}
                <div className="pt-2 border-t border-stone-100 dark:border-neutral-800 flex gap-3">
                  <button type="button" onClick={() => toast.success('sitemap.xml regenerated!')} className="btn-secondary text-sm flex items-center gap-2"><FiRefreshCw size={13} /> Regenerate Sitemap</button>
                  <button type="button" onClick={() => toast.success('Pinged Google!')} className="btn-secondary text-sm inline-flex items-center gap-2"><FiSend size={13} /> Ping Google</button>
                </div>
              </div>
            )}

            {activeTab === 'Integrations' && (
              <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
                <h2 className="font-semibold border-b border-stone-100 dark:border-neutral-800 pb-3">Third-Party Integrations</h2>
                {[
                  { label: 'Appwrite Endpoint', key: 'awEndpoint', value: 'https://cloud.appwrite.io/v1' },
                  { label: 'Appwrite Project ID', key: 'awProject', value: '••••••••••••' },
                  { label: 'Appwrite Database ID', key: 'awDb', value: 'ceylonupdates_db' },
                  { label: 'Cloudinary Cloud Name', key: 'cloudinary', placeholder: 'your-cloud-name (optional)' },
                  { label: 'Mailgun API Key', key: 'mailgun', placeholder: 'key-XXXXXXXX (for newsletters)' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">{f.label}</label>
                    <input type="text" defaultValue={f.value} placeholder={f.placeholder} className="form-input font-mono text-xs" />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Email' && (
              <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
                <h2 className="font-semibold border-b border-stone-100 dark:border-neutral-800 pb-3">Email Configuration</h2>
                {[
                  { label: 'SMTP Host', key: 'smtpHost', placeholder: 'smtp.mailgun.org' },
                  { label: 'SMTP Port', key: 'smtpPort', placeholder: '587' },
                  { label: 'SMTP Username', key: 'smtpUser', placeholder: 'postmaster@ceylonupdates.com' },
                  { label: 'From Name', key: 'fromName', value: 'CeylonUpdates Newsletter' },
                  { label: 'From Email', key: 'fromEmail', value: 'newsletter@ceylonupdates.com' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">{f.label}</label>
                    <input type="text" defaultValue={f.value} placeholder={f.placeholder} className="form-input" />
                  </div>
                ))}
                <button type="button" onClick={() => toast.success('Test email sent!')} className="btn-secondary text-sm inline-flex items-center gap-2"><FiMail size={13} /> Send Test Email</button>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-6 space-y-4">
                <h2 className="font-semibold border-b border-stone-100 dark:border-neutral-800 pb-3">Security Settings</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Require email moderation for comments', defaultChecked: false },
                    { label: 'Enable spam filter for comments', defaultChecked: true },
                    { label: 'Block VPN/proxy registrations', defaultChecked: false },
                    { label: 'Enable rate limiting on API routes', defaultChecked: true },
                    { label: 'Log admin actions', defaultChecked: true },
                    { label: 'Force HTTPS redirects', defaultChecked: true },
                  ].map((s) => (
                    <label key={s.label} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked={s.defaultChecked} className="w-4 h-4 accent-accent" />
                      <span className="text-sm text-stone-700 dark:text-neutral-300">{s.label}</span>
                    </label>
                  ))}
                </div>
                <div className="pt-3 border-t border-stone-100 dark:border-neutral-800">
                  <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Admin IP Whitelist (optional)</label>
                  <input type="text" placeholder="e.g. 203.0.113.1, 198.51.100.0/24" className="form-input font-mono text-xs" />
                  <p className="text-xs text-stone-400 dark:text-neutral-600 mt-1">Comma-separated IPs/CIDRs. Leave blank to allow all.</p>
                </div>
              </div>
            )}
          </div>

          {/* Save sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4">
              <button type="submit" disabled={saving} className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><FiSave size={14} /> Save Settings</>}
              </button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-1 inline-flex items-center gap-1.5"><FiAlertTriangle size={14} /> Remember</h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                API keys and secrets should be stored in your <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">.env.local</code> file, not in the database. Settings here are for UI configuration only.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-3 text-stone-900 dark:text-neutral-100">System Info</h3>
              <div className="space-y-1.5 text-xs">
                {[
                  { k: 'Version', v: '2.0.0' },
                  { k: 'Next.js', v: '14.2.0' },
                  { k: 'Environment', v: process.env.NODE_ENV || 'development' },
                  { k: 'Database', v: 'Appwrite' },
                ].map((i) => (
                  <div key={i.k} className="flex justify-between">
                    <span className="text-stone-400 dark:text-neutral-600">{i.k}</span>
                    <span className="font-mono text-stone-600 dark:text-neutral-400">{i.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
