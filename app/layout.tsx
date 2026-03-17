import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REFLEXY — O reflexo da sua conversão",
  description: "Provador virtual com IA, geração de imagens profissionais e analytics comportamental para e-commerce de moda. Integração nativa Shopify.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
