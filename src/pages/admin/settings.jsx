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
      <Head>
        <title>Settings | CeylonUpdates Admin</title>
      </Head>

      {/* Tab bar */}
      <div className="mb-6 flex gap-0 border-b border-stone-200 dark:border-neutral-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === t
                ? 'border-accent text-accent'
                : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-neutral-500 dark:hover:text-neutral-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            {activeTab === 'General' && (
              <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="border-b border-stone-100 pb-3 font-semibold dark:border-neutral-800">
                  Site Configuration
                </h2>
                {[
                  { label: 'Site Name', key: 'siteName', value: 'CeylonUpdates.me', type: 'text' },
                  {
                    label: 'Site URL',
                    key: 'siteUrl',
                    value: 'https://www.ceylonupdates.me',
                    type: 'url',
                  },
                  {
                    label: 'Tagline',
                    key: 'tagline',
                    value: 'Latest Sri Lanka News, AI & Tech',
                    type: 'text',
                  },
                  {
                    label: 'Contact Email',
                    key: 'contactEmail',
                    value: 'editor@ceylonupdates.me',
                    type: 'email',
                  },
                  { label: 'Posts Per Page', key: 'postsPerPage', value: '12', type: 'number' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                      {f.label}
                    </label>
                    <input type={f.type} defaultValue={f.value} className="form-input" />
                  </div>
                ))}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                    Site Description
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Sri Lanka's fastest-growing news and tech platform."
                    className="form-input resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'SEO' && (
              <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="border-b border-stone-100 pb-3 font-semibold dark:border-neutral-800">
                  SEO & Social
                </h2>
                {[
                  { label: 'Google Analytics ID', key: 'gaId', placeholder: 'G-XXXXXXXXXX' },
                  {
                    label: 'Google Search Console',
                    key: 'gsc',
                    placeholder: 'Verification meta tag content',
                  },
                  { label: 'Facebook App ID', key: 'fbId', placeholder: '1234567890' },
                  { label: 'Twitter Handle', key: 'twitter', placeholder: '@CeylonUpdates' },
                  {
                    label: 'AdSense Publisher ID',
                    key: 'adsense',
                    placeholder: 'ca-pub-XXXXXXXXXXXXXXXX',
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                      {f.label}
                    </label>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      className="form-input font-mono"
                    />
                  </div>
                ))}
                <div className="flex gap-3 border-t border-stone-100 pt-2 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => toast.success('sitemap.xml regenerated!')}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <FiRefreshCw size={13} /> Regenerate Sitemap
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success('Pinged Google!')}
                    className="btn-secondary inline-flex items-center gap-2 text-sm"
                  >
                    <FiSend size={13} /> Ping Google
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Integrations' && (
              <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="border-b border-stone-100 pb-3 font-semibold dark:border-neutral-800">
                  Third-Party Integrations
                </h2>
                {[
                  {
                    label: 'Appwrite Endpoint',
                    key: 'awEndpoint',
                    value: 'https://cloud.appwrite.io/v1',
                  },
                  { label: 'Appwrite Project ID', key: 'awProject', value: '••••••••••••' },
                  { label: 'Appwrite Database ID', key: 'awDb', value: 'ceylonupdates_db' },
                  {
                    label: 'Cloudinary Cloud Name',
                    key: 'cloudinary',
                    placeholder: 'your-cloud-name (optional)',
                  },
                  {
                    label: 'Mailgun API Key',
                    key: 'mailgun',
                    placeholder: 'key-XXXXXXXX (for newsletters)',
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                      {f.label}
                    </label>
                    <input
                      type="text"
                      defaultValue={f.value}
                      placeholder={f.placeholder}
                      className="form-input font-mono text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Email' && (
              <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="border-b border-stone-100 pb-3 font-semibold dark:border-neutral-800">
                  Email Configuration
                </h2>
                {[
                  { label: 'SMTP Host', key: 'smtpHost', placeholder: 'smtp.mailgun.org' },
                  { label: 'SMTP Port', key: 'smtpPort', placeholder: '587' },
                  {
                    label: 'SMTP Username',
                    key: 'smtpUser',
                    placeholder: 'postmaster@ceylonupdates.me',
                  },
                  { label: 'From Name', key: 'fromName', value: 'CeylonUpdates Newsletter' },
                  { label: 'From Email', key: 'fromEmail', value: 'newsletter@ceylonupdates.me' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                      {f.label}
                    </label>
                    <input
                      type="text"
                      defaultValue={f.value}
                      placeholder={f.placeholder}
                      className="form-input"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => toast.success('Test email sent!')}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <FiMail size={13} /> Send Test Email
                </button>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="border-b border-stone-100 pb-3 font-semibold dark:border-neutral-800">
                  Security Settings
                </h2>
                <div className="space-y-3">
                  {[
                    { label: 'Require email moderation for comments', defaultChecked: false },
                    { label: 'Enable spam filter for comments', defaultChecked: true },
                    { label: 'Block VPN/proxy registrations', defaultChecked: false },
                    { label: 'Enable rate limiting on API routes', defaultChecked: true },
                    { label: 'Log admin actions', defaultChecked: true },
                    { label: 'Force HTTPS redirects', defaultChecked: true },
                  ].map((s) => (
                    <label key={s.label} className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={s.defaultChecked}
                        className="h-4 w-4 accent-accent"
                      />
                      <span className="text-sm text-stone-700 dark:text-neutral-300">
                        {s.label}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-stone-100 pt-3 dark:border-neutral-800">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                    Admin IP Whitelist (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 203.0.113.1, 198.51.100.0/24"
                    className="form-input font-mono text-xs"
                  />
                  <p className="mt-1 text-xs text-stone-400 dark:text-neutral-600">
                    Comma-separated IPs/CIDRs. Leave blank to allow all.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Save sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{' '}
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={14} /> Save Settings
                  </>
                )}
              </button>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <h3 className="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
                <FiAlertTriangle size={14} /> Remember
              </h3>
              <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                API keys and secrets should be stored in your{' '}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">.env.local</code>{' '}
                file, not in the database. Settings here are for UI configuration only.
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-3 text-sm font-semibold text-stone-900 dark:text-neutral-100">
                System Info
              </h3>
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
