'use server';

import { getRequestContext } from '@rshono/core/server';
import { PROFILE } from '../lib/data';
import { LOCALE_NAMES, dictionary, localeFromPath } from '../lib/i18n';

export type ContactValues = {
  name: string;
  email: string;
  message: string;
};

export type ContactState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error';
      message: string;
      values: ContactValues;
      fields?: Partial<Record<keyof ContactValues, string>>;
    };

/** The two Cloudflare bindings this action uses. Only the parts we call are typed. */
type ContactEnv = {
  Bindings: {
    EMAIL?: {
      send(message: {
        to?: string;
        from: string | { email: string; name?: string };
        replyTo?: string | { email: string; name?: string };
        subject: string;
        text?: string;
        html?: string;
      }): Promise<{ messageId: string }>;
    };
    TURNSTILE_SECRET_KEY?: string;
  };
};

/** The binding in `wrangler.jsonc` restricts sends to the same address. */
const CONTACT_DESTINATION = 'lassetange@gmail.com';

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (character) => entities[character] ?? character);
}

/** `FormData` values can be files; this action only ever reads text fields. */
function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export async function submitContact(_previous: ContactState, form: FormData): Promise<ContactState> {
  const ctx = getRequestContext<ContactEnv>();
  const locale = localeFromPath(ctx.url.pathname);
  const copy = dictionary(locale).contactForm;

  const values: ContactValues = {
    name: field(form, 'name'),
    email: field(form, 'email'),
    message: field(form, 'message'),
  };

  /** A bot fills the hidden field; a person never sees it. Pretend it worked. */
  if (field(form, 'website') !== '') return { status: 'success' };

  const fields: Partial<Record<keyof ContactValues, string>> = {};
  if (values.name.length < 2 || values.name.length > 100) fields.name = copy.invalidName;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) || values.email.length > 254) fields.email = copy.invalidEmail;
  if (values.message.length < 10 || values.message.length > 5000) fields.message = copy.invalidMessage;

  if (Object.keys(fields).length > 0) {
    return { status: 'error', message: copy.invalidSummary, fields, values };
  }

  const token = form.get('cf-turnstile-response');
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return { status: 'error', message: copy.verification.replace('{email}', PROFILE.email), values };
  }

  const secret = ctx.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('[contact] TURNSTILE_SECRET_KEY is not configured');
    return { status: 'error', message: copy.error.replace('{email}', PROFILE.email), values };
  }

  try {
    const body = new FormData();
    body.set('secret', secret);
    body.set('response', token);
    const remoteIp = ctx.req.header('cf-connecting-ip');
    if (remoteIp) body.set('remoteip', remoteIp);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    });
    const result = (await response.json()) as {
      success: boolean;
      action?: string;
      'error-codes'?: string[];
    };

    if (!response.ok || !result.success || (result.action !== undefined && result.action !== 'contact')) {
      console.warn('[contact] Turnstile rejected the token', result['error-codes']);
      return { status: 'error', message: copy.verification.replace('{email}', PROFILE.email), values };
    }
  } catch (error) {
    console.error('[contact] Turnstile verification failed', error);
    return { status: 'error', message: copy.verification.replace('{email}', PROFILE.email), values };
  }

  const email = ctx.env.EMAIL;
  if (!email) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[contact] EMAIL binding is unavailable in rshono dev; the message was not sent.', values);
      return { status: 'success' };
    }

    console.error('[contact] EMAIL binding is missing');
    return { status: 'error', message: copy.error.replace('{email}', PROFILE.email), values };
  }

  /** Header values may not contain line breaks. */
  const name = values.name.replace(/[\r\n\t]+/g, ' ').trim();
  const sentAt = new Date().toISOString();

  const text = [
    `Navn: ${values.name}`,
    `E-mail: ${values.email}`,
    `Sprog: ${LOCALE_NAMES[locale]}`,
    `Sendt: ${sentAt}`,
    `Side: ${ctx.url.href}`,
    '',
    'Besked:',
    values.message,
  ].join('\n');

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; color: #1b1b1b;">
      <h1 style="font-size: 18px; margin: 0 0 12px;">Ny besked fra kontaktformularen</h1>
      <p style="margin: 0 0 4px;"><strong>Navn:</strong> ${escapeHtml(values.name)}</p>
      <p style="margin: 0 0 4px;"><strong>E-mail:</strong> <a href="mailto:${escapeHtml(values.email)}">${escapeHtml(values.email)}</a></p>
      <p style="margin: 0 0 4px;"><strong>Sprog:</strong> ${escapeHtml(LOCALE_NAMES[locale])}</p>
      <p style="margin: 0 0 4px;"><strong>Sendt:</strong> ${escapeHtml(sentAt)}</p>
      <p style="margin: 0 0 16px;"><strong>Side:</strong> ${escapeHtml(ctx.url.href)}</p>
      <div style="border-top: 1px solid #e3e3df; padding-top: 12px; white-space: pre-wrap; word-break: break-word;">${escapeHtml(values.message)}</div>
    </div>
  `;

  try {
    await email.send({
      to: CONTACT_DESTINATION,
      from: { email: PROFILE.formEmail, name: 'Kontaktformular' },
      replyTo: { email: values.email, name },
      subject: `[Kontakt] ${name}`,
      text,
      html,
    });
  } catch (error) {
    console.error('[contact] Email send failed', error);
    return { status: 'error', message: copy.error.replace('{email}', PROFILE.email), values };
  }

  return { status: 'success' };
}
