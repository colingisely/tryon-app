// @ts-check
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    STRIPE_PRICE_STARTER: process.env.STRIPE_PRICE_STARTER,
    STRIPE_PRICE_GROWTH: process.env.STRIPE_PRICE_GROWTH,
    STRIPE_PRICE_PRO: process.env.STRIPE_PRICE_PRO,
  },
}

module.exports = withSentryConfig(nextConfig, {
  org: 'reflexy',
  project: 'javascript-nextjs',

  // Upload source maps silenciosamente
  silent: !process.env.CI,

  // Desativa source maps no bundle do cliente (não expõe código fonte)
  widenClientFileUpload: true,

  // Esconde source maps do bundle final
  hideSourceMaps: true,

  // Desativa logger do Sentry no browser
  disableLogger: true,

  // Tunneling para evitar bloqueio de ad-blockers
  tunnelRoute: '/monitoring',

  // Auto-instrumentação de rotas
  automaticVercelMonitors: true,
})
