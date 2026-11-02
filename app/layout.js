import '@fontsource-variable/schibsted-grotesk';
import { SITE } from '@/lib/config';
import './globals.css';

export const metadata = {
  title: `${SITE.name}: pump.fun fees in any coin`,
  description: SITE.tagline,
  openGraph: { title: SITE.name, description: SITE.tagline },
  twitter: { card: 'summary_large_image', title: SITE.name, description: SITE.tagline },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#EEF1F5' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
