import '@fontsource-variable/funnel-display';
import '@fontsource-variable/funnel-sans';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SITE } from '@/lib/config';
import './globals.css';

export const metadata = {
  title: { default: `${SITE.name}: pump.fun fees in any coin`, template: `%s | ${SITE.name}` },
  description: SITE.tagline,
  openGraph: { title: SITE.name, description: SITE.tagline },
  twitter: { card: 'summary_large_image', title: SITE.name, description: SITE.tagline },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0A0D12' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
