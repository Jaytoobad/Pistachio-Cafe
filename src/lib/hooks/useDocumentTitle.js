import { useEffect } from 'react';

const DEFAULT_TITLE = 'Pistachio Caf\u00e9 \u2014 Elegance you can taste';

// Sets document.title for the browser tab while the component is mounted and
// restores the previous title on unmount. Storefront pages set their own
// "<Page> | Pistachio Cafe" title; the home page keeps the default.
export default function useDocumentTitle(title = DEFAULT_TITLE) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}
