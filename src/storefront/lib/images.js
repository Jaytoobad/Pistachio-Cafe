import { LOCAL_IMAGE_FILES } from '../data/imageManifest';

const LOCAL_FILES = new Set(LOCAL_IMAGE_FILES);

// True when the photo really exists on the site.
//
// A path that starts with "/" is a file in /public: it is only used when the
// manifest says it is there. Anything else is a remote URL (photo storage, a
// CDN); the browser is left to load it and the component falls back to the
// tile if it fails.
export function imageExists(url) {
  if (!url) return false;
  if (!url.startsWith('/')) return true;
  return LOCAL_FILES.has(url.split('?')[0].split('#')[0]);
}

// True when a file under /public/images is really there.
export function localImageExists(path) {
  if (!path) return false;
  return LOCAL_FILES.has(path.split('?')[0].split('#')[0]);
}
