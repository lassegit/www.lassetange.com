'use client';

import type { ReactNode } from 'react';

/**
 * The header's burger disclosure, and the one thing markup alone cannot give it: closing itself when a
 * link inside it is followed.
 *
 * A `<details>` owns its open state, and rshono soft-navigates same-origin anchors — the document
 * survives the click, so a panel that was open before the link is still open on the page it led to.
 * Closing it here restores what a full page load used to do for free, which is also what still happens
 * before this module has hydrated: no interception, a new document, a closed menu. One handler on the
 * disclosure rather than one per link, so the marks inside a link count as the link, and no list has to
 * know it is in a menu.
 *
 * Everything visible is passed in and rendered on the server; the handler is all that ships.
 */
export function MobileMenu({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <details
      className={className}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest('a')) event.currentTarget.open = false;
      }}
    >
      {children}
    </details>
  );
}
