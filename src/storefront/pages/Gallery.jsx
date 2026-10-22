import { Link } from 'react-router-dom';
import SafeImg from '../components/SafeImg';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';

const photos = [
  { src: '/images/hero/hero.jpg', alt: 'A table set with breakfast at Pistachio Cafe', caption: 'Breakfast, served all day' },
  { src: '/images/about-marble-bag.jpg', alt: 'Coffee and pastry on a marble counter', caption: 'Coffee and pastry' },
  { src: '/images/hero-coffee-beans.jpg', alt: 'Roasted coffee beans in a scoop', caption: 'Coffee we grind to order' },
  { src: '/images/hero-flatlay.jpg', alt: 'A flat lay of dishes from the kitchen', caption: 'Plates from the kitchen' },
  { src: '/images/menu-marble-closeup.jpg', alt: 'A close up of a dish on marble', caption: 'Close to the plate' },
  { src: '/images/poster-three-cups-wide.jpg', alt: 'Three cups of coffee on a table', caption: 'Three cups, one table' },
];

export default function Gallery() {
  useDocumentTitle('Gallery | Pistachio Caf\u00e9');

  return (
    <div className="container min-h-dvh py-6">
      <section className="page-hero">
        <div className="container">
          <p className="page-hero-eyebrow text-muted">Inside the cafe</p>
          <h1 className="page-hero-title text-charcoal font-serif">Gallery</h1>
          <p className="page-hero-desc text-muted">
            A look at the food, the coffee and the tables at {`Pistachio Caf\u00e9`}.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-2-sm grid-cols-3-md" style={{ gap: 'var(--space-4)' }}>
            {photos.map((photo) => (
              <figure key={photo.src} style={{ margin: 0 }}>
                <SafeImg
                  src={photo.src}
                  alt={photo.alt}
                  label={photo.alt}
                  loading="lazy"
                  className="w-full rounded-xl overflow-hidden aspect-4-3 object-cover"
                />
                <figcaption className="text-muted" style={{ fontSize: '0.85rem', marginTop: 8 }}>
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/menu" className="btn btn-accent">Order now</Link>
          <Link to="/visit" className="btn btn-outline">Plan a visit</Link>
        </div>
      </section>
    </div>
  );
}
