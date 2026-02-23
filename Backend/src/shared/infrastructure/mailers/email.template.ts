import type { EmailTheme } from './email.types';

const LOGO_LIGHT = 'https://finanzas-app.com/logo.png';
const LOGO_DARK = 'https://finanzas-app.com/logo.png';
const HERO_BG = 'https://miApp.com/images/hero-background.png';

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textToHtml(text: string): string {
  // Normalizamos saltos de línea
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return '';

  const paragraphs = normalized.split(/\n{2,}/g);
  return paragraphs
    .map((p: string) => `<p class="p">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}

export function renderBaseEmailHtml(params: {
  subject: string;
  contentText: string;
  recipientName?: string;
  theme?: EmailTheme;
  action?: { title: string; url: string };
}): string {
  const { subject, contentText, recipientName, action } = params;
  const theme: EmailTheme = params.theme ?? 'auto';

  const preheader = `${subject}`.slice(0, 90);
  const greeting = recipientName ? `Hola ${recipientName},` : 'Hola';

  const actionTitle = action?.title?.trim();
  const actionUrl = action?.url?.trim();
  const actionHtml =
    actionTitle && actionUrl
      ? `
                  <div class="cta-container">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                      <tr>
                        <td align="center" bgcolor="#22a85f" style="border-radius: 10px; mso-padding-alt: 14px 32px;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${escapeHtml(actionUrl)}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="20%" stroke="f" fillcolor="#22a85f">
                            <w:anchorlock/>
                            <center style="color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:600;">
                              ${escapeHtml(actionTitle)}
                            </center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-- -->
                          <a
                            class="cta-button"
                            href="${escapeHtml(actionUrl)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="display:inline-block;background:#22a85f;color:#ffffff !important;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;line-height:1;mso-line-height-rule:exactly;box-shadow:0 4px 14px rgba(34, 168, 95, 0.35);"
                          >${escapeHtml(actionTitle)}</a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                  </div>`
      : '';

  // Permite insertar el botón dentro del texto con un marcador.
  // Ejemplo en contentText:
  //  "Linea 1\n\n{{ACTION_BUTTON}}\n\nLinea 2"
  const ACTION_MARKER = '{{ACTION_BUTTON}}';
  const normalizedContent = contentText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let contentHtmlWithAction = '';
  if (actionHtml && normalizedContent.includes(ACTION_MARKER)) {
    const idx = normalizedContent.indexOf(ACTION_MARKER);
    const before = normalizedContent.slice(0, idx).trimEnd();
    const after = normalizedContent.slice(idx + ACTION_MARKER.length).trimStart();
    contentHtmlWithAction = [textToHtml(before), actionHtml, textToHtml(after)].filter(Boolean).join('\n');
  } else {
    const cleaned = normalizedContent.replace(ACTION_MARKER, '').trim();
    contentHtmlWithAction = textToHtml(cleaned);
    if (actionHtml) contentHtmlWithAction = [contentHtmlWithAction, actionHtml].filter(Boolean).join('\n');
  }
  const year = new Date().getFullYear();

  // Nota: no todos los clientes respetan prefers-color-scheme, pero es el estándar más soportado.
  // En los que no, se verá el estilo light.
  return `
  <!doctype html>
<html lang="es" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${escapeHtml(subject)}</title>
    <style>
      /* Reset compatible con email */
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
      table { border-collapse: collapse !important; }
      body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }

      :root {
        --bg: #f7f8fa;
        --card: #ffffff;
        --text: #111827;
        --muted: #6b7280;
        --border: #e5e7eb;
        --accent: #16a34a;
        --accent-2: #22c55e;
        --shadow: 0 10px 24px rgba(17, 24, 39, 0.10);
      }

      body[data-theme="dark"] {
        --bg: #0b0f14;
        --card: #0f172a;
        --text: #e5e7eb;
        --muted: #9ca3af;
        --border: rgba(255,255,255,0.10);
        --shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
      }

      @media (prefers-color-scheme: dark) {
        body[data-theme="auto"] {
          --bg: #0b0f14;
          --card: #0f172a;
          --text: #e5e7eb;
          --muted: #9ca3af;
          --border: rgba(255,255,255,0.10);
          --shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
        }
        .logo-light { display: none !important; }
        .logo-dark { display: inline-block !important; }
      }

      .wrapper {
        background: var(--bg);
        padding: 32px 16px;
        background-image:
          radial-gradient(circle at 10% 10%, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0) 45%),
          radial-gradient(circle at 90% 20%, rgba(22,163,74,0.08) 0%, rgba(22,163,74,0) 45%),
          radial-gradient(circle at 50% 100%, rgba(34,197,94,0.06) 0%, rgba(34,197,94,0) 50%);
      }

      .container { width: 100%; max-width: 600px; margin: 0 auto; }
      
      .card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow);
        overflow: hidden;
      }

      /* Hero header (estilo corporativo tipo landing) */
      .hero {
        background-color: #0f2320; /* fallback si la imagen no carga */
        background-image: url('${HERO_BG}');
        background-size: cover;
        background-position: center;
      }

      .hero-inner {
        padding: 44px 32px;
        background: linear-gradient(135deg, rgba(15, 35, 30, 0.86) 0%, rgba(20, 45, 40, 0.86) 100%);
        text-align: center;
        border-bottom: 1px solid var(--border);
      }

      .hero-logo {
        width: 90px;
        height: 90px;
        margin: 0 auto 14px;
        display: block;
        object-fit: contain;
      }

      .brandNameHero {
        margin: 0 0 6px 0;
        font-size: 22px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .brandTaglineHero {
        margin: 0;
        font-size: 13px;
        color: rgba(255,255,255,0.82);
        font-weight: 500;
      }

      .logo-container {
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
        border-radius: 16px;
        line-height: 64px;
        font-size: 28px;
        color: white;
      }

      .brandName { 
        margin: 0 0 4px 0; 
        font-size: 18px; 
        font-weight: 700; 
        color: var(--text); 
        letter-spacing: 0.5px; 
      }

      .brandTagline { 
        margin: 0; 
        font-size: 13px; 
        color: var(--muted);
        font-weight: 500;
      }

      .logo { max-width: 180px; height: auto; display: block; margin: 0 auto 12px; }
      .logo-dark { display: none; }

      .body { padding: 32px; }

      .h1 { 
        margin: 0 0 8px 0; 
        font-size: 26px; 
        font-weight: 800; 
        color: var(--text);
        line-height: 1.3;
      }

      .greeting { 
        margin: 0 0 24px 0; 
        font-size: 15px; 
        color: var(--muted); 
      }

      .divider { 
        height: 1px; 
        background: linear-gradient(90deg, transparent, var(--border), transparent);
        margin: 0 0 24px 0; 
      }

      .p { 
        margin: 0 0 16px 0; 
        font-size: 15px; 
        line-height: 1.7; 
        color: var(--text); 
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      a {
        color: var(--accent);
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .list {
        margin: 0 0 20px 0;
        padding-left: 20px;
      }

      .list li {
        margin-bottom: 8px;
        color: var(--text);
        line-height: 1.6;
      }

      .cta-container {
        text-align: center;
        margin: 28px 0;
      }

      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
        color: #ffffff !important;
        padding: 14px 32px;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        font-size: 15px;
        box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35);
      }

      .signature {
        margin-top: 24px !important;
        padding-top: 20px;
        border-top: 1px dashed var(--border);
      }

      .footer {
        padding: 24px 32px;
        border-top: 1px solid var(--border);
        background: #1a2332;
      }

      .footer-text {
        margin: 0 0 12px 0;
        font-size: 13px;
        color: rgba(255,255,255,0.82);
        line-height: 1.6;
      }

      .footer-text b { color: #ffffff; }

      .footer-links {
        text-align: center;
        margin: 18px 0 14px 0;
      }

      .footer-link {
        display: inline-block;
        margin: 0 10px 8px 10px;
        font-size: 12px;
        color: rgba(255,255,255,0.72) !important;
        text-decoration: none;
      }

      .footer-link:hover { color: #22c55e !important; }

      .footer-copyright {
        margin: 0;
        font-size: 12px;
        color: rgba(255,255,255,0.55);
        text-align: center;
      }

      .preheader {
        display: none !important;
        visibility: hidden;
        mso-hide: all;
        font-size: 1px;
        line-height: 1px;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      }

      @media screen and (max-width: 620px) {
        .wrapper { padding: 20px 12px; }
        .body, .footer { padding-left: 20px !important; padding-right: 20px !important; }
        .hero-inner { padding-left: 20px !important; padding-right: 20px !important; }
        .h1 { font-size: 22px !important; }
        .hero-logo { width: 78px; height: 78px; }
      }
    </style>
  </head>
  <body data-theme="${theme}">
    <span class="preheader">${escapeHtml(preheader)}</span>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td class="wrapper" align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container">
            <tr>
              <td class="card">
                <div class="hero">
                  <div class="hero-inner">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <img class="hero-logo" src="${LOGO_DARK}" alt="Finanzas App" />
                          <div class="brandNameHero">Finanzas App</div>
                          <div class="brandTaglineHero">Plantilla de gestión financiera</div>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>

                <div class="body">
                  <h1 class="h1">${escapeHtml(subject)}</h1>
                  <p class="greeting">${escapeHtml(greeting)}</p>
                  <div class="divider"></div>
                  ${contentHtmlWithAction}
                </div>

                <div class="footer">
                  <p class="footer-text"><b>Finanzas App</b> — Gestiona ingresos, gastos y metas financieras desde una sola plataforma.</p>

                  <div class="footer-links">
                    <a class="footer-link" href="https://finanzas-app.com">finanzas-app.com</a>
                    <a class="footer-link" href="https://youtube.com">YouTube</a>
                    <a class="footer-link" href="https://facebook.com">Facebook</a>
                    <a class="footer-link" href="https://instagram.com">Instagram</a>
                  </div>

                  <p class="footer-copyright">© ${year} Finanzas App. Este es un correo automático, por favor no respondas a este mensaje.</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

