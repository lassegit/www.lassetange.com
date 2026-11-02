'use client';

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useActionState, useEffect, useRef, useState } from 'react';
import type { ContactFormCopy, Locale } from '../lib/i18n';
import { BUTTON } from './button';
import { submitContact, type ContactState } from './contact-form-action';

const initial: ContactState = { status: 'idle' };

/** Public by design; the secret is the Worker secret. */
const SITE_KEY = '0x4AAAAAAFwf63rzd5It60gV';

/** Shared by every field, so their fill, padding and borders cannot drift apart. */
const FIELD =
  'mt-1 w-full rounded-md border border-line bg-field px-2.5 py-1.5 text-base text-ink placeholder:text-muted hover:border-line-strong focus:border-accent';

export function ContactForm({ copy, email, locale }: { copy: ContactFormCopy; email: string; locale: Locale }) {
  const [state, formAction, pending] = useActionState(submitContact, initial);
  const [turnstileStatus, setTurnstileStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const turnstile = useRef<TurnstileInstance | null>(null);
  const status = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === 'error') {
      // The form reset clears Turnstile's hidden input; reset the widget for the next attempt.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTurnstileStatus('loading');
      turnstile.current?.reset();
    }

    if (state.status === 'success' || state.status === 'error') status.current?.focus();
  }, [state]);

  if (state.status === 'success') {
    return (
      <div ref={status} tabIndex={-1} role="status" className="rounded-md border border-line bg-surface p-4 text-sm">
        {copy.success}
      </div>
    );
  }

  const error = state.status === 'error' ? state : null;
  const withEmail = (text: string) => text.replace('{email}', email);
  const messageError = error?.fields?.message;

  return (
    <form action={formAction} aria-busy={pending} aria-labelledby="contact-form-title" className="relative space-y-5">
      {error && (
        <div ref={status} tabIndex={-1} role="alert" className="rounded-md border border-danger/40 px-3 py-2 text-sm text-danger">
          {error.message}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-ink">
            {copy.name}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            defaultValue={error?.values.name}
            placeholder="..."
            aria-invalid={error?.fields?.name ? true : undefined}
            aria-describedby={error?.fields?.name ? 'contact-name-error' : undefined}
            className={FIELD}
          />
          {error?.fields?.name && (
            <p id="contact-name-error" className="mt-1.5 text-sm text-danger">
              {error.fields.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-ink">
            {copy.email}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            required
            maxLength={254}
            defaultValue={error?.values.email}
            placeholder="..."
            aria-invalid={error?.fields?.email ? true : undefined}
            aria-describedby={error?.fields?.email ? 'contact-email-error' : undefined}
            className={FIELD}
          />
          {error?.fields?.email && (
            <p id="contact-email-error" className="mt-1.5 text-sm text-danger">
              {error.fields.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-ink">
          {copy.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={4}
          defaultValue={error?.values.message}
          placeholder={copy.messagePlaceholder}
          aria-invalid={messageError ? true : undefined}
          aria-describedby={messageError ? 'contact-message-error' : undefined}
          className={`${FIELD} resize-y`}
        />
        {messageError && (
          <p id="contact-message-error" className="mt-1.5 text-sm text-danger">
            {messageError}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people and screen readers, tempting to bots. */}
      <div aria-hidden="true" className="absolute -top-[9999px] left-0 h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <button type="submit" disabled={pending || turnstileStatus !== 'ready'} className={BUTTON}>
          {pending ? copy.sending : copy.send}
        </button>
      </div>

      <Turnstile
        ref={turnstile}
        siteKey={SITE_KEY}
        options={{
          theme: 'auto',
          size: 'flexible',
          language: locale,
          action: 'contact',
          appearance: 'interaction-only',
        }}
        scriptOptions={{ onError: () => setTurnstileStatus('error') }}
        onSuccess={() => setTurnstileStatus('ready')}
        onError={() => setTurnstileStatus('error')}
        onExpire={() => setTurnstileStatus('loading')}
        onTimeout={() => setTurnstileStatus('loading')}
        onUnsupported={() => setTurnstileStatus('error')}
      />

      {turnstileStatus === 'error' && (
        <p aria-live="polite" className="text-xs text-danger">
          {withEmail(copy.turnstileError)}
        </p>
      )}

      <noscript>
        <p className="text-sm text-muted">{withEmail(copy.noScript)}</p>
      </noscript>
    </form>
  );
}
