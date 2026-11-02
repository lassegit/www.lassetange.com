'use server';

import { getRequestContext } from '@rshono/core/server';
import { PROFILE } from '../lib/data';
import { dictionary, localeFromPath } from '../lib/i18n';

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

type ContactEmailProps = {
  name: string;
  email: string;
  message: string;
  sentAt: string;
};

/** The table-based notification, kept in step with the react-email-starter template. */
function getContactEmailHTML({ name, email, message, sentAt }: ContactEmailProps): string {
  const fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>New message - lassetange.com</title>
  </head>
  <body style="background-color:#ffffff">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
      New message - lassetange.com
      <div>
        &nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;&nbsp;&zwnj;&#8203;
      </div>
    </div>
    <table
      align="center"
      width="100%"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="max-width:37.5em;padding-left:12px;padding-right:12px;margin:0 auto">
      <tbody>
        <tr style="width:100%">
          <td>
            <p
              style="font-size:14px;line-height:24px;margin:24px 0;color:#333;font-family:${fontFamily};margin-bottom:14px">
              <strong>Name:</strong> ${escapeHtml(name)}<br />
              <strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#2754C5;text-decoration-line:none;text-decoration:underline">${escapeHtml(email)}</a><br />
              <strong>Sent:</strong> ${escapeHtml(sentAt)}
            </p>
            <p
              style="font-size:14px;line-height:24px;margin:24px 0;color:#333;font-family:${fontFamily};margin-bottom:14px">
              Message:
            </p>
            <code
              style="display:inline-block;padding:16px 4.5%;margin-bottom:20px;width:90.5%;background-color:#f4f4f4;border-radius:5px;border:1px solid #eee;color:#333;white-space:pre-line;word-break:break-word"
              >${escapeHtml(message)}</code
            >
            <a
              href="${PROFILE.siteUrl}"
              style="color:#2754C5;text-decoration-line:none;font-family:${fontFamily};font-size:14px;text-decoration:underline;display:block;margin-bottom:16px"
              target="_blank"
              >Go to lassetange.com</a
            >
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
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

  const text = [`Name: ${values.name}`, `Email: ${values.email}`, `Sent: ${sentAt}`, '', 'Message:', values.message].join('\n');

  const html = getContactEmailHTML({
    name: values.name,
    email: values.email,
    message: values.message,
    sentAt,
  });

  try {
    await email.send({
      to: CONTACT_DESTINATION,
      from: { email: PROFILE.formEmail, name: 'Contact form' },
      replyTo: { email: values.email, name },
      subject: `[Contact] ${name}`,
      text,
      html,
    });
  } catch (error) {
    console.error('[contact] Email send failed', error);
    return { status: 'error', message: copy.error.replace('{email}', PROFILE.email), values };
  }

  return { status: 'success' };
}
