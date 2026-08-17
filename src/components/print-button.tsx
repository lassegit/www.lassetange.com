'use client';

import { useSyncExternalStore } from 'react';

/** No subscription: the value simply differs between the server snapshot and the client one. */
const noop = () => () => {};

/**
 * The only interactive element on the site, and the only JavaScript it ships. Printing is a browser
 * capability with no markup equivalent, so this hands the reader the print dialog — from which
 * “Save as PDF” produces the CV as a file.
 *
 * It renders nothing until it has hydrated, so a reader without JavaScript is never shown a button
 * that cannot do anything. The print stylesheet applies either way; only the shortcut is missing.
 */
export function PrintButton({ label }: { label: string }) {
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  if (!hydrated) return null;

  return (
    <button type="button" className="button" onClick={() => window.print()}>
      {label}
    </button>
  );
}
