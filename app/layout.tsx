import type { Metadata } from "next";
import "./globals.css";
import '@/app/landing.css';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://reflexy.co'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: 'REFLEXY — O reflexo da sua conversão',
  description: 'Provador virtual com IA, geração de imagens profissionais e analytics comportamental para e-commerce de moda. Integração nativa Shopify.',
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Reflexy',
    title: 'REFLEXY — O reflexo da sua conversão',
    description: 'Provador virtual com IA, Studio Pro e Analytics comportamental para e-commerce de moda.',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'REFLEXY — O reflexo da sua conversão',
    description: 'Provador virtual com IA, Studio Pro e Analytics para e-commerce de moda no Shopify.',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=IBM+Plex+Mono:wght@400;500&display=swap" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
