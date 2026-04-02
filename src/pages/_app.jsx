import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { SWRConfig } from 'swr';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';

const SWR_CONFIG = {
  fetcher: (url) => fetch(url).then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json(); }),
  revalidateOnFocus: false,
  dedupingInterval: 30000,
  errorRetryCount: 2,
};

export default function App({ Component, pageProps }) {
  return (
    <SWRConfig value={SWR_CONFIG}>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
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
