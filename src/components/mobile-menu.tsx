'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * The header's burger disclosure, and the two things markup alone cannot give it: closing when a link
 * inside it is followed, and closing when the next tap lands somewhere else.
 *
 * A `<details>` owns its open state, and rshono soft-navigates same-origin anchors — the document
 * survives the click, so a panel that was open before the link is still open on the page it led to.
 * Closing it restores what a full page load used to do for free, which is also what still happens before
 * this module has hydrated: no interception, a new document, a closed menu. One handler on the disclosure
 * rather than one per link, so the marks inside a link count as the link, and no list has to know it is
 * in a menu.
 *
 * Dismissing listens for `pointerdown` rather than `click`, because the panel hangs over the page: the
 * gesture that dismisses it is usually the one reaching for what is underneath or starting a scroll, and
 * both read better answered as the finger lands than a mouseup later. It is also the document's listener
 * rather than a backdrop element, so nothing is laid over the page to catch the tap and the reader's own
 * click still goes where they aimed it.
 *
 * What happens inside the disclosure stays the disclosure's business: `contains` hands the burger and the
 * panel back to it, so a tap on the burger closes the menu once rather than closing and reopening it. A
 * keyboard never raises `pointerdown`, so a menu opened with the keyboard is closed the way it was opened.
 *
 * Everything visible is passed in and rendered on the server; these two behaviours are all that ships.
 */
export function MobileMenu({ className, children }: { className?: string; children: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function dismiss(event: PointerEvent) {
      const details = menu.current;
      if (details?.open && event.target instanceof Node && !details.contains(event.target)) details.open = false;
    }

    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);

  return (
    <details
      className={className}
      ref={menu}
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest('a')) event.currentTarget.open = false;
      }}
    >
      {children}
    </details>
  );
}
