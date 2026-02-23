import { renderBaseEmailHtml } from './email.template';
import type { SendTemplatedEmailInput } from './email.types';
import nodemailer, { type Transporter } from 'nodemailer';

let cachedTransporter: Transporter | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} no está configurado`);
  return value;
}

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

function getSmtpTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = getRequiredEnv('EMAIL_SMTP_HOST');
  const port = Number(process.env.EMAIL_SMTP_PORT ?? '587');
  const secure = parseBool(process.env.EMAIL_SMTP_SECURE, port === 465);
  const user = getRequiredEnv('EMAIL_SMTP_USER');
  const pass = getRequiredEnv('EMAIL_SMTP_PASS');

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function sendTemplatedEmail(input: SendTemplatedEmailInput) {
  const transporter = getSmtpTransporter();

  const html = renderBaseEmailHtml({
    subject: input.subject,
    contentText: input.contentText,
    recipientName: input.recipientName,
    theme: input.theme,
    action: input.action,
  });

  const fromName = process.env.EMAIL_FROM_NAME || 'MyApp Admin';
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_SMTP_USER;
  if (!fromAddress) throw new Error('EMAIL_FROM_ADDRESS o EMAIL_SMTP_USER no está configurado');

  await transporter.sendMail({
    from: `${fromName} <${fromAddress}>`,
    to: input.to,
    subject: input.subject,
    text: input.contentText,
    html,
  });
}

