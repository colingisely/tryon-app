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
</head>
<body style="margin:0;padding:0;background:#06050F;font-family:'DM Sans',Arial,sans-serif;color:#EDEBF5">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:40px 24px">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:40px">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#7C3AED,#C084FC);
                    border-radius:10px;width:38px;height:38px;text-align:center;
                    vertical-align:middle;font-size:18px;font-weight:800;color:#fff">R</td>
                  <td style="padding-left:10px;font-size:16px;font-weight:700;
                    letter-spacing:.18em;text-transform:uppercase;color:#EDEBF5">REFLEXY</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content card -->
          <tr>
            <td style="background:linear-gradient(145deg,rgba(124,58,237,.06) 0%,rgba(14,11,22,.9) 50%,rgba(192,132,252,.04) 100%);
              border:1px solid rgba(255,255,255,.07);border-radius:24px;
              padding:48px 48px 40px">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;
              font-size:12px;color:rgba(184,180,212,.4);line-height:1.6">
              Reflexy · <a href="https://reflexy.co" style="color:rgba(124,58,237,.7);text-decoration:none">reflexy.co</a>
              <br />
              <a href="https://reflexy.co/privacy" style="color:rgba(124,58,237,.5);text-decoration:none">Privacidade</a>
              &nbsp;·&nbsp;
              <a href="https://reflexy.co/terms" style="color:rgba(124,58,237,.5);text-decoration:none">Termos</a>
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

/** Boas-vindas após signup (plano Preview) */
export async function sendWelcomeEmail(to: string, storeName?: string) {
  const name = storeName || 'loja'
  const html = baseLayout(`
    <h1 style="font-size:28px;font-weight:200;letter-spacing:-.03em;
      color:#fff;margin:0 0 8px">Bem-vinda à Reflexy 👋</h1>
    <p style="font-size:15px;color:rgba(192,132,252,.9);margin:0 0 28px;
      font-style:italic">${name}</p>

    <p style="font-size:15px;color:rgba(184,180,212,.8);line-height:1.75;margin:0 0 20px">
      Sua conta está ativa com o plano <strong style="color:#C084FC">Preview</strong> —
      10 provas virtuais para você experimentar o Reflexy na sua loja Shopify.
    </p>

    <p style="font-size:15px;color:rgba(184,180,212,.8);line-height:1.75;margin:0 0 32px">
      Instale o plugin na sua loja e veja a experiência completa do provador virtual com IA.
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px">
      <tr>
        <td>${btn('Acessar o dashboard →', 'https://reflexy.co/dashboard')}</td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid rgba(255,255,255,.07);margin:0 0 24px" />

    <p style="font-size:13px;color:rgba(184,180,212,.45);margin:0;line-height:1.6">
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
      color:#fff;margin:0 0 8px">Assinatura confirmada 🎉</h1>
    <p style="font-size:15px;color:rgba(192,132,252,.9);margin:0 0 28px;
      font-style:italic">${name}</p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.2);
      border-radius:14px;margin-bottom:28px">
      <tr>
        <td style="padding:20px 24px">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:.12em;
            text-transform:uppercase;color:rgba(184,180,212,.4);
            font-family:'IBM Plex Mono',monospace">Plano ativo</p>
          <p style="margin:0;font-size:24px;font-weight:300;
            letter-spacing:-.02em;color:${planColor}">${planName}</p>
        </td>
      </tr>
    </table>

    <p style="font-size:15px;color:rgba(184,180,212,.8);line-height:1.75;margin:0 0 32px">
      Obrigada por assinar a Reflexy. Seu plano <strong style="color:${planColor}">${planName}</strong>
      já está ativo — acesse o dashboard para ver seus créditos e começar a usar.
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px">
      <tr>
        <td>${btn('Acessar o dashboard →', 'https://reflexy.co/dashboard')}</td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid rgba(255,255,255,.07);margin:0 0 24px" />

    <p style="font-size:13px;color:rgba(184,180,212,.45);margin:0;line-height:1.6">
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
