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
      <div className="min-h-screen bg-stone-100 dark:bg-neutral-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="font-head text-3xl font-black text-accent">Ceylon</span>
            <span className="font-head text-3xl font-black text-stone-900 dark:text-neutral-100">Updates</span>
            <p className="text-stone-500 dark:text-neutral-500 text-sm mt-2">Admin CMS — Sign In</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ceylonupdates.com"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider text-stone-500 dark:text-neutral-500 uppercase mb-1.5">Password</label>
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
              className="w-full py-2.5 bg-accent text-white rounded font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-xs text-stone-400 dark:text-neutral-600 mt-4">
            Powered by Appwrite JWT Auth · CeylonUpdates CMS
          </p>
        </div>
      </div>
    </>
  );
}
