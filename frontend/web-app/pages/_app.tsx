import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Layout from '../components/Layout';
import ReactQueryProvider from '../components/QueryProvider';
import { ToastProvider } from '../components/ui/Toast';
import { Inter } from 'next/font/google';
import { Noto_Sans_Thai } from 'next/font/google';
import AuthProvider from '../components/AuthProvider';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const notoThai = Noto_Sans_Thai({ subsets: ['thai'], display: 'swap' });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ReactQueryProvider>
      <ToastProvider>
        <AuthProvider>
          <div className={`${notoThai.className} ${inter.className}`}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </div>
        </AuthProvider>
      </ToastProvider>
    </ReactQueryProvider>
  );
}
