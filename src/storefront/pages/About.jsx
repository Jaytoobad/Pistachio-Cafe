import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND, CONTACT } from '../config';
import Seo from '../components/Seo';
import SplitView from '../components/SplitView';
import PlaceholderImage from '../components/PlaceholderImage';

export default function About() {
  return (
    <div className="about-page" style={{ minHeight: '100dvh' }}>
      <Seo title="Our story | Pistachio Cafe" description="The story of Pistachio Cafe in Spintex, Accra." />

      {/* Split view: story image left, story content right (desktop); stacked on mobile */}
      <SplitView
        imageSrc="/images/about/story.jpg"
        imageAlt="Interior of Pistachio Cafe, Spintex"
        imageCaption="Pistachio Caf\u00e9, Spintex, Accra"
        reverse={false}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '0.75rem' }}>Our story</h1>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: 'var(--text-lg)' }}>
            Pistachio Cafe is a neighborhood spot in {BRAND.location} serving coffee, desserts and shisha with care.
          </p>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: 'var(--text-lg)', marginTop: '1rem' }}>
            We focus on warm service and fresh, made-to-order treats. Find us in Spintex, Accra. You can order online for pickup or delivery.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/menu" className="btn btn-primary link-nudge">See the menu</Link>
            <Link to="/visit" className="btn btn-outline link-nudge">Visit us</Link>
          </div>
        </div>
      </SplitView>
    </div>
  );
}
