import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import SplitView from '../components/SplitView';
import PlaceholderImage from '../components/PlaceholderImage';

export default function NotFound() {
  return (
    <div className="notfound-page">
      <Seo title="Page not found | Pistachio Cafe" description="The page you are looking for does not exist." />

      {/* Split view: placeholder image left, friendly 404 content right (desktop); stacked on mobile */}
      <SplitView
        imageSrc="/images/placeholder-cup-pistachios.jpg"
        imageAlt="Pistachio Cafe placeholder"
        imageCaption="We\u2019ll be right back"
        reverse={true}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: '0.75rem' }}>Page not found</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.7, fontSize: 'var(--text-lg)' }}>
            That page doesn\u2019t exist or has moved.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary link-nudge">Back home</Link>
            <Link to="/menu" className="btn btn-outline link-nudge">See the menu</Link>
          </div>
        </div>
      </SplitView>
    </div>
  );
}
