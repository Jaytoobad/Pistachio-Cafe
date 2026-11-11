import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../config';
import { ABOUT_HERO, ABOUT_STORY } from '../data/content';
import Seo from '../components/Seo';

export default function About() {
  return (
    <div>
      <Seo title="Our story | Pistachio Cafe" description="The story of Pistachio Cafe in Spintex, Accra." />

      <section className="section">
        <div className="container about-hero-grid">
          <div className="about-copy">
            <p className="page-hero-eyebrow">{ABOUT_HERO.eyebrow}</p>
            <h1 className="page-hero-title">{ABOUT_HERO.heading}</h1>
            <p className="page-hero-desc">{ABOUT_HERO.body}</p>
            <div className="about-actions">
              <Link to="/menu" className="btn btn-primary">See the menu</Link>
              <Link to="/visit" className="btn btn-outline">Visit us</Link>
            </div>
          </div>
          <figure className="about-photo">
            <img src={IMAGES.story} alt="Pistachio Cafe coffee cups served with a cookie and pistachios." loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container about-story-copy">
          <h2>{ABOUT_STORY.title}</h2>
          <p>{ABOUT_STORY.body}</p>
          <p>{ABOUT_STORY.body2}</p>
          <p>{ABOUT_STORY.body3}</p>
          <p>{ABOUT_STORY.body4}</p>
          <Link to="/events" className="btn btn-outline">See cafe events</Link>
        </div>
      </section>
    </div>
  );
}
