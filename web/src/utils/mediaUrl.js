/**
 * Utility for resolving media and asset URLs seamlessly across
 * local development and live production environments.
 */

export const getApiBaseUrl = () => {
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (isLocalhost) {
    return 'http://localhost:5000';
  }

  const env =
    (typeof import.meta !== 'undefined' && import.meta.env) ||
    (typeof process !== 'undefined' && process.env) ||
    {};

  const envUrl =
    env.VITE_IMAGE_URL ||
    env.VITE_BASE_URL ||
    env.VITE_API_BASE;

  if (
    envUrl &&
    !envUrl.includes('localhost') &&
    !envUrl.includes('127.0.0.1') &&
    !envUrl.includes('happy-life-sx03.onrender.com')
  ) {
    return envUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
  }

  return 'https://api.happylifeastro.school';
};

export const resolveMediaUrl = (url, fallback = '') => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '/herocard.png') return fallback;

  // Data URLs and Blob URLs are self-contained
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const baseUrl = getApiBaseUrl();
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  // Local static public assets in frontend (/courses/..., /gig_..., /digital_..., etc.)
  if (
    trimmed.startsWith('/courses/') ||
    trimmed.startsWith('/gig_') ||
    trimmed.startsWith('/digital_') ||
    trimmed.startsWith('/images/') ||
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('/news_placeholder') ||
    trimmed.startsWith('/HAPPY LIFE-Logo')
  ) {
    return trimmed;
  }

  // Normalize Windows backslashes
  let clean = trimmed.replace(/\\/g, '/');

  // Migrate any old references to the legacy Render host
  if (clean.includes('happy-life-sx03.onrender.com')) {
    clean = clean.replace('https://happy-life-sx03.onrender.com', baseUrl);
  }

  // If an asset in DB has localhost host but we are on live site, swap to production domain
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(clean)) {
    if (!isLocalhost) {
      clean = clean.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, baseUrl);
    }
  }

  // If it's already an absolute HTTP/HTTPS URL (e.g. Unsplash, Cloudinary, or prefixed baseUrl)
  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  // Ensure relative uploads path is clean and properly formatted
  clean = clean.replace(/^\/+/, '');
  if (!clean.startsWith('uploads/')) {
    clean = `uploads/${clean}`;
  }

  return `${baseUrl}/${clean}`;
};

export default resolveMediaUrl;
