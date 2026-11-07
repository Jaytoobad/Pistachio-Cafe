import { useState } from 'react';

export default function PlaceholderImage({ label = 'Photo coming soon', className, aspect = '4/3' }) {
  return (
    <div
      className={`placeholder-image ${className || ''}`}
      style={{ aspectRatio: aspect }}
      aria-hidden="true"
    >
      <div className="placeholder-image-surface">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 3v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V3" />
          <path d="M7 13v2a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-2" />
          <path d="M17 3v4a3 3 0 0 0 3 3h0V3" />
        </svg>
        <p className="placeholder-image-label">{label}</p>
      </div>
    </div>
  );
}
