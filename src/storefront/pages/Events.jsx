import { Link } from 'react-router-dom';
import { BRAND } from '../config';
import { EVENTS_PAGE } from '../data/content';
import Seo from '../components/Seo';

export default function Events() {
  return (
    <div>
      <Seo
        title="Events | Pistachio Cafe"
        description="Discover upcoming gatherings and special evenings at Pistachio Cafe in Spintex, Accra."
      />

      <section className="section">
        <div className="container events-layout">
          <div className="events-intro">
            <p className="page-hero-eyebrow">{EVENTS_PAGE.eyebrow}</p>
            <h1 className="page-hero-title">{EVENTS_PAGE.heading}</h1>
            <p className="page-hero-desc">{EVENTS_PAGE.intro}</p>
          </div>

          <section className="events-empty" aria-labelledby="events-empty-title">
            <p className="events-empty-label">{BRAND.location}</p>
            <h2 id="events-empty-title">{EVENTS_PAGE.emptyHeading}</h2>
            <p>{EVENTS_PAGE.emptyBody}</p>
            <div className="events-actions">
              <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                {EVENTS_PAGE.instagramLabel}
              </a>
              <Link to="/visit" className="btn btn-outline">{EVENTS_PAGE.visitLabel}</Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
