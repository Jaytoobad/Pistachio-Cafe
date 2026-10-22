import { useEffect } from 'react';
import { SITE_URL } from '../config';

export default function Seo({ title, description, noindex = false }) {
  useEffect(() => {
    if (title) document.title = title;

    let meta = document.querySelector('meta[name=\"description\"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    if (description) meta.content = description;

    let canon = document.querySelector('link[rel=\"canonical\"]');
    if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
    canon.href = SITE_URL;

    let ogUrl = document.querySelector('meta[property=\"og:url\"]');
    if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
    ogUrl.content = SITE_URL;

    let robots = document.querySelector('meta[name=\"robots\"]');
    if (noindex) {
      if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
      robots.content = 'noindex, nofollow';
    } else if (robots) {
      robots.remove();
    }
  }, [title, description, noindex]);
  return null;
}
