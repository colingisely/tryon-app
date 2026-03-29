import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Captura 10% das sessões para replay (aumentar após lançamento)
  replaysSessionSampleRate: 0.1,
  // Captura 100% das sessões com erro
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
  ],

  // 10% dos traces em produção
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Mostra erros no console só em dev
  debug: false,
})
