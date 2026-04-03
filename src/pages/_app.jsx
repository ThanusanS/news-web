import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { SWRConfig } from 'swr';
import { Toaster } from 'react-hot-toast';
import { DefaultSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';
import 'react-image-crop/dist/ReactCrop.css';
import SEO from '../../next-seo.config';

const SWR_CONFIG = {
  fetcher: (url) =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    }),
  revalidateOnFocus: false,
  dedupingInterval: 30000,
  errorRetryCount: 2,
};

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');
  const [routeLoading, setRouteLoading] = useState(false);
  const delayRef = useRef(null);

  useEffect(() => {
    const onStart = () => {
      // Avoid flicker on instant transitions.
      delayRef.current = window.setTimeout(() => setRouteLoading(true), 120);
    };
    const onDone = () => {
      if (delayRef.current) {
        window.clearTimeout(delayRef.current);
        delayRef.current = null;
      }
      setRouteLoading(false);
    };

    router.events.on('routeChangeStart', onStart);
    router.events.on('routeChangeComplete', onDone);
    router.events.on('routeChangeError', onDone);

    return () => {
      router.events.off('routeChangeStart', onStart);
      router.events.off('routeChangeComplete', onDone);
      router.events.off('routeChangeError', onDone);
      if (delayRef.current) {
        window.clearTimeout(delayRef.current);
      }
    };
  }, [router.events]);

  return (
    <SWRConfig value={SWR_CONFIG}>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            {routeLoading && <div className="route-progress" aria-hidden="true" />}
            <DefaultSeo
              {...SEO}
              noindex={isAdminRoute}
              nofollow={isAdminRoute}
            />
            <Component {...pageProps} />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: { fontSize: '14px' },
                success: { iconTheme: { primary: '#C8102E', secondary: '#fff' } },
              }}
            />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}
