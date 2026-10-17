import { useEffect } from 'react';

// Sets document.title for the browser tab. Defaults to the site name so the
// admin panel never leaks a per-page "- Admin" suffix into the tab bar.
export default function useDocumentTitle(title = 'Pistachio Cafe') {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}