import { useEffect } from 'react';

// Sets document.title for the browser tab while the component is mounted and
// restores the previous title on unmount. This keeps the "- Admin" suffix
// confined to /admin routes: the admin layout sets it, and when it unmounts
// (e.g. navigating back to the storefront) the old title comes back.
export default function useDocumentTitle(title = 'Pistachio Cafe') {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}