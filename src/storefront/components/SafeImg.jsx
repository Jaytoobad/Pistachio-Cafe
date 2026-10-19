import React, { useState } from 'react';
import { IMAGES } from '../config';

/**
 * Renders an <img> that falls back to a soft placeholder when the source
 * fails to load. The placeholder shows the dish/brand name (or a supplied
 * fallback label) on a muted background — never a broken-image icon.
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
        <span style={{ fontSize: '1.25rem', lineHeight: 1, display: 'block', marginBottom: '0.25rem' }}>🍽️</span>
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