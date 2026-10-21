import { useEffect } from 'react';
import { SITE_URL } from '../config';

export default function Seo({ title, description }) {
  useEffect(() => {
    if (title) document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    if (description) meta.content = description;
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
    canon.href = SITE_URL;
  }, [title, description]);
  return null;
}
