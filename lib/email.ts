import { Resend } from 'resend'

const FROM = 'Reflexy <ola@reflexy.co>'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY not set')
  return new Resend(key)
}

// ── Templates ──────────────────────────────────────────────────────────────

function baseLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reflexy</title>
  <style>
    @media (prefers-color-scheme: light) {
      body, table, td { background-color: #06050F !important; color: #EDEBF5 !important; }
    }
  </style>
</head>
<body bgcolor="#06050F" style="margin:0;padding:0;background-color:#06050F;font-family:'DM Sans',Arial,sans-serif;color:#EDEBF5">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#06050F">
    <tr>
      <td align="center" bgcolor="#06050F" style="padding:40px 24px;background-color:#06050F">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%">

          <!-- Logo -->
          <tr>
            <td align="center" bgcolor="#06050F" style="padding-bottom:40px;background-color:#06050F">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle">
                    <img src="https://reflexy.co/reflexy-gem.svg" width="36" height="36" alt="Reflexy" style="display:block" />
                  </td>
                  <td style="padding-left:10px;font-size:16px;font-weight:700;
                    letter-spacing:.18em;text-transform:uppercase;color:#EDEBF5;vertical-align:middle">REFLEXY</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content card -->
          <tr>
            <td bgcolor="#100E1A" style="background-color:#100E1A;
              border:1px solid #2A2440;border-radius:24px;
              padding:48px 48px 40px">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="#06050F" style="padding-top:32px;background-color:#06050F;
              font-size:12px;color:#6B6490;line-height:1.6">
              Reflexy · <a href="https://reflexy.co" style="color:#7C3AED;text-decoration:none">reflexy.co</a>
              <br />
              <a href="https://reflexy.co/privacy" style="color:#6B3FA0;text-decoration:none">Privacidade</a>
              &nbsp;·&nbsp;
              <a href="https://reflexy.co/terms" style="color:#6B3FA0;text-decoration:none">Termos</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function btn(text: string, href: string) {
  return `
  <a href="${href}"
    style="display:inline-block;padding:14px 36px;background:#7C3AED;
    color:#fff;border-radius:100px;font-size:15px;font-weight:400;
    text-decoration:none;letter-spacing:-.01em;
    box-shadow:0 0 28px rgba(124,58,237,.4)">
    ${text}
  </a>`
}

// ── Emails ─────────────────────────────────────────────────────────────────

/** Boas-vindas após signup (plano Free) */
export async function sendWelcomeEmail(to: string, storeName?: string) {
  const name = storeName || 'loja'
  const html = baseLayout(`
    <h1 style="font-size:28px;font-weight:200;letter-spacing:-.03em;
      color:#EDEBF5;margin:0 0 8px">Bem-vinda à Reflexy 👋</h1>
    <p style="font-size:15px;color:#C084FC;margin:0 0 28px;
      font-style:italic">${name}</p>

    <p style="font-size:15px;color:#B8B4D4;line-height:1.75;margin:0 0 20px">
      Sua conta está ativa com o plano <strong style="color:#C084FC">Free</strong> —
      10 créditos para você experimentar o Reflexy na sua loja.
    </p>

    <p style="font-size:15px;color:#B8B4D4;line-height:1.75;margin:0 0 32px">
      Instale o widget na sua loja e veja a experiência completa do provador virtual com IA.
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px">
      <tr>
        <td>${btn('Acessar o dashboard →', 'https://reflexy.co/login')}</td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid #2A2440;margin:0 0 24px" />

    <p style="font-size:13px;color:#5E5880;margin:0;line-height:1.6">
      Alguma dúvida? Responda este email que a gente responde pessoalmente.
    </p>
  `)

  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Bem-vinda à Reflexy — sua conta está ativa ✨',
    html,
  })
}

/** Confirmação de assinatura após pagamento */
export async function sendSubscriptionEmail(
  to: string,
  planName: string,
  storeName?: string
) {
  const name = storeName || 'loja'
  const planColor = planName === 'Pro' ? '#C084FC' : planName === 'Growth' ? '#7C3AED' : '#B8AEDD'

  const html = baseLayout(`
    <h1 style="font-size:28px;font-weight:200;letter-spacing:-.03em;
      color:#EDEBF5;margin:0 0 8px">Assinatura confirmada 🎉</h1>
    <p style="font-size:15px;color:#C084FC;margin:0 0 28px;
      font-style:italic">${name}</p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      bgcolor="#1A1530" style="background-color:#1A1530;border:1px solid #3D2E6B;
      border-radius:14px;margin-bottom:28px">
      <tr>
        <td style="padding:20px 24px">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:.12em;
            text-transform:uppercase;color:#5E5880;
            font-family:'IBM Plex Mono',monospace">Plano ativo</p>
          <p style="margin:0;font-size:24px;font-weight:300;
            letter-spacing:-.02em;color:${planColor}">${planName}</p>
        </td>
      </tr>
    </table>

    <p style="font-size:15px;color:#B8B4D4;line-height:1.75;margin:0 0 32px">
      Obrigada por assinar a Reflexy. Seu plano <strong style="color:${planColor}">${planName}</strong>
      já está ativo — acesse o dashboard para ver seus créditos e começar a usar.
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px">
      <tr>
        <td>${btn('Acessar o dashboard →', 'https://reflexy.co/login')}</td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid #2A2440;margin:0 0 24px" />

    <p style="font-size:13px;color:#5E5880;margin:0;line-height:1.6">
      Alguma dúvida sobre a sua assinatura? Responda este email.
    </p>
  `)

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Plano ${planName} ativo na Reflexy ✓`,
    html,
  })
}

/** Notificação interna — lead enterprise recebido */
export async function sendEnterpriseInquiry(data: {
  name: string
  email: string
  store: string
  volume: string
  message?: string
}) {
  const html = baseLayout(`
    <h1 style="font-size:24px;font-weight:200;letter-spacing:-.03em;color:#fff;margin:0 0 24px">
      Novo lead Enterprise 🏢
    </h1>

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      bgcolor="#1A1530" style="background-color:#1A1530;border:1px solid #3D2E6B;
      border-radius:14px;margin-bottom:24px">
      <tr><td style="padding:24px 28px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${[
            ['Nome', data.name],
            ['Email', data.email],
            ['Loja', data.store],
            ['Volume estimado', data.volume],
          ].map(([label, value]) => `
            <tr>
              <td style="padding:6px 0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
                color:#5E5880;font-family:'IBM Plex Mono',monospace;width:140px;
                vertical-align:top">${label}</td>
              <td style="padding:6px 0;font-size:14px;color:#EDEBF5;vertical-align:top">${value}</td>
            </tr>`).join('')}
          ${data.message ? `
            <tr>
              <td style="padding:12px 0 6px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
                color:#5E5880;font-family:'IBM Plex Mono',monospace;vertical-align:top"
                colspan="2">Mensagem</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:0 0 6px;font-size:14px;color:#EDEBF5;line-height:1.65">
                ${data.message}
              </td>
            </tr>` : ''}
        </table>
      </td></tr>
    </table>

    <p style="font-size:13px;color:#5E5880;margin:0;line-height:1.6">
      Responda diretamente para <strong style="color:#C084FC">${data.email}</strong>
    </p>
  `)

  return getResend().emails.send({
    from: FROM,
    to: 'enterprise@reflexy.co',
    replyTo: data.email,
    subject: `[Enterprise] ${data.name} · ${data.store} · ${data.volume}`,
    html,
  })
}

/** Auto-reply para o prospect enterprise */
export async function sendEnterpriseAutoReply(data: {
  name: string
  email: string
}) {
  const html = baseLayout(`
    <h1 style="font-size:28px;font-weight:200;letter-spacing:-.03em;color:#EDEBF5;margin:0 0 8px">
      Mensagem recebida ✓
    </h1>
    <p style="font-size:15px;color:#C084FC;margin:0 0 28px;font-style:italic">
      ${data.name}
    </p>

    <p style="font-size:15px;color:#B8B4D4;line-height:1.75;margin:0 0 20px">
      Obrigada pelo interesse no plano Enterprise da Reflexy.
      Nossa equipe recebeu sua mensagem e entrará em contato em <strong style="color:#C084FC">até 24 horas</strong>.
    </p>

    <p style="font-size:15px;color:#B8B4D4;line-height:1.75;margin:0 0 32px">
      Enquanto isso, você pode explorar a loja demo para ver a experiência completa do provador virtual —
      exatamente como seus clientes vão vivenciar.
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px">
      <tr>
        <td>${btn('Ver loja demo →', 'https://tryonapp-2.myshopify.com/')}</td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid #2A2440;margin:0 0 24px" />

    <p style="font-size:13px;color:#5E5880;margin:0;line-height:1.6">
      Alguma dúvida urgente? Responda este email diretamente.
    </p>
  `)

  return getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: 'Recebemos sua mensagem · Reflexy Enterprise',
    html,
  })
}

/** Notificação interna — contato geral (CTA da landing) */
export async function sendContactInquiry(data: {
  name: string
  email: string
  subject: string
  message?: string
}) {
  const html = baseLayout(`
    <h1 style="font-size:24px;font-weight:200;letter-spacing:-.03em;color:#EDEBF5;margin:0 0 24px">
      Nova mensagem de contato 💬
    </h1>

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      bgcolor="#1A1530" style="background-color:#1A1530;border:1px solid #3D2E6B;
      border-radius:14px;margin-bottom:24px">
      <tr><td style="padding:24px 28px">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${[
            ['Nome', data.name],
            ['Email', data.email],
            ['Assunto', data.subject],
          ].map(([label, value]) => `
            <tr>
              <td style="padding:6px 0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
                color:#5E5880;font-family:'IBM Plex Mono',monospace;width:100px;
                vertical-align:top">${label}</td>
              <td style="padding:6px 0;font-size:14px;color:#EDEBF5;vertical-align:top">${value}</td>
            </tr>`).join('')}
          ${data.message ? `
            <tr>
              <td style="padding:12px 0 6px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
                color:#5E5880;font-family:'IBM Plex Mono',monospace;vertical-align:top"
                colspan="2">Mensagem</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:0 0 6px;font-size:14px;color:#EDEBF5;line-height:1.65">
                ${data.message}
              </td>
            </tr>` : ''}
        </table>
      </td></tr>
    </table>

    <p style="font-size:13px;color:#5E5880;margin:0;line-height:1.6">
      Responda diretamente para <strong style="color:#C084FC">${data.email}</strong>
    </p>
  `)

  return getResend().emails.send({
    from: FROM,
    to: 'oi@reflexy.co',
    replyTo: data.email,
    subject: `[Contato] ${data.subject} · ${data.name}`,
    html,
  })
}

/** Auto-reply para contato geral */
export async function sendContactAutoReply(data: {
  name: string
  email: string
}) {
  const html = baseLayout(`
    <h1 style="font-size:28px;font-weight:200;letter-spacing:-.03em;color:#EDEBF5;margin:0 0 8px">
      Mensagem recebida ✓
    </h1>
    <p style="font-size:15px;color:#C084FC;margin:0 0 28px;font-style:italic">
      ${data.name}
    </p>

    <p style="font-size:15px;color:#B8B4D4;line-height:1.75;margin:0 0 20px">
      Recebemos sua mensagem e entraremos em contato em breve.
    </p>

    <p style="font-size:15px;color:#B8B4D4;line-height:1.75;margin:0 0 32px">
      Enquanto isso, você pode explorar a plataforma e ver como o Reflexy funciona na prática.
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px">
      <tr>
        <td>${btn('Conhecer a Reflexy →', 'https://reflexy.co')}</td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid #2A2440;margin:0 0 24px" />

    <p style="font-size:13px;color:#5E5880;margin:0;line-height:1.6">
      Alguma dúvida urgente? Responda este email diretamente.
    </p>
  `)

  return getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: 'Recebemos sua mensagem · Reflexy',
    html,
  })
}

/** Confirmação de cancelamento */
export async function sendCancellationEmail(to: string, planName: string, accessUntilDate: string) {
  const html = baseLayout(`
    <tr>
      <td style="padding:32px 28px 0">
        <h1 style="margin:0 0 10px;font-family:'Bricolage Grotesque',sans-serif;font-size:22px;font-weight:700;color:#EDEBF5">
          Cancelamento confirmado
        </h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#B8B4D4">
          Seu plano <strong style="color:#EDEBF5">${planName}</strong> foi cancelado.
          Você ainda tem acesso completo até <strong style="color:#EDEBF5">${accessUntilDate}</strong>.
        </p>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#9490B8">
          Após essa data, sua conta será movida para o plano Free com créditos zerados.
          Você pode reativar a qualquer momento.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 28px 32px">
        <a href="https://www.reflexy.co/settings" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#2B1250 0%,#7050A0 100%);color:#EDEBF5;text-decoration:none;font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif;border-radius:2px">
          Reativar plano
        </a>
      </td>
    </tr>
  `);

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Cancelamento confirmado — Reflexy`,
    html,
  });
}

/** Notificação de falha no pagamento */
export async function sendPaymentFailedEmail(to: string, planName: string) {
  const html = baseLayout(`
    <tr>
      <td style="padding:32px 28px 0">
        <h1 style="margin:0 0 10px;font-family:'Bricolage Grotesque',sans-serif;font-size:22px;font-weight:700;color:#EDEBF5">
          Falha no pagamento
        </h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#B8B4D4">
          Não foi possível processar o pagamento do seu plano <strong style="color:#EDEBF5">${planName}</strong>.
        </p>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#9490B8">
          Atualize seu método de pagamento para evitar a suspensão da sua conta.
          Tentaremos cobrar novamente nos próximos dias.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 28px 32px">
        <a href="https://www.reflexy.co/settings" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#2B1250 0%,#7050A0 100%);color:#EDEBF5;text-decoration:none;font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif;border-radius:2px">
          Atualizar pagamento
        </a>
      </td>
    </tr>
  `);

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `⚠️ Falha no pagamento — ${planName} · Reflexy`,
    html,
  });
}
