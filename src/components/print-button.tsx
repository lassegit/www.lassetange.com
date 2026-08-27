'use client';

import { useSyncExternalStore } from 'react';

/** No subscription: the value simply differs between the server snapshot and the client one. */
const noop = () => () => {};

/**
 * The only interactive element on the site, and the only JavaScript it ships. Printing is a browser
 * capability with no markup equivalent, so this hands the reader the print dialog — from which
 * “Save as PDF” produces the CV as a file.
 *
 * That file is named after `document.title`, and the CV's title is written for a browser tab rather
 * than a filesystem: “CV — Lasse Tange” would be saved as `CV — Lasse Tange.pdf`, em dash, spaces and
 * accents included. So the title is lent to `fileName` — extension omitted, the browser appends it —
 * across the call, and handed straight back.
 *
 * It renders nothing until it has hydrated, so a reader without JavaScript is never shown a button
 * that cannot do anything. The print stylesheet applies either way; only the shortcut is missing.
 */
export function PrintButton({ label, fileName }: { label: string; fileName: string }) {
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  if (!hydrated) return null;

  return (
    <button
      type="button"
      className="cursor-pointer rounded border border-accent bg-accent px-3.5 py-1.5 text-sm font-semibold text-canvas hover:border-accent-hover hover:bg-accent-hover"
      onClick={() => {
        // `print()` blocks until the dialog closes, so the two assignments straddle the whole of the
        // browser's chance to read a filename off the title.
        const pageTitle = document.title;
        document.title = fileName;
        window.print();
        document.title = pageTitle;
      }}
    >
      {label}
    </button>
  );
}
