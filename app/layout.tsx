import type { Metadata } from "next";
import "./globals.css";
import '@/app/landing.css';

export const metadata: Metadata = {
  title: 'REFLEXY — O reflexo da sua conversão',
  description: 'Provador virtual com IA, geração de imagens profissionais e analytics comportamental para e-commerce de moda. Integração nativa Shopify.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logos/symbol-dark.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: { url: '/logos/symbol-dark.png', sizes: '180x180' },
    shortcut: '/logos/symbol-dark.png',
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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&family=IBM+Plex+Mono:wght@300;400;500&display=swap" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
