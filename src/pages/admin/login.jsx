import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/admin');
  }, [user, loading]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.replace('/admin');
    } catch {
      toast.error('Invalid credentials. Please try again.');
    }
    setSubmitting(false);
  }

  return (
    <>
      <Head>
        <title>Admin Login | CeylonUpdates</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4 dark:bg-neutral-950">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <span className="font-head text-3xl font-black text-accent">Ceylon</span>
            <span className="font-head text-3xl font-black text-stone-900 dark:text-neutral-100">
              Updates
            </span>
            <p className="mt-2 text-sm text-stone-500 dark:text-neutral-500">Admin CMS — Sign In</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ceylonupdates.me"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-neutral-500">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-accent py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-stone-400 dark:text-neutral-600">
            Powered by Appwrite JWT Auth · CeylonUpdates CMS
          </p>
        </div>
      </div>
    </>
  );
}
