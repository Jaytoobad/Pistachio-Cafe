import React, { useState } from 'react';
import { IMAGES } from '../config';

/**
 * Renders an <img> that falls back to a soft placeholder when the source
 * fails to load. The placeholder shows the dish/brand name (or a supplied
 * fallback label) on a muted background - never a broken-image icon.
 *
 * Usage:
 *   <SafeImg src={dish.image_url} alt={dish.name} label={dish.name} />
 *
 * All props are passed through to the underlying <img> except `label`,
 * which is only used for the fallback card.
 */
export default function SafeImg({ src, label, fallbackSrc, ...rest }) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div className="dish-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', background: '#EFE8D6', color: 'var(--color-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '0.5rem' }}>
        <span style={{ display: 'block', marginBottom: '0.35rem' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 3v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V3" />
            <path d="M7 13v2a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-2" />
            <path d="M17 3v4a3 3 0 0 0 3 3h0V3" />
          </svg>
        </span>
        <span>{label || 'Photo coming soon'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}