import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Footer } from '@/components/Footer';
import Navbar from '@/components/Navbar/Navbar';
import { ToastContainer } from 'react-toastify';
import StoreProvider from '@/components/StoreProvider';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HireMe | Find your dream job',
  description: 'Discover your dream job with HireMe',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}