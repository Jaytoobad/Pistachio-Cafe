import { useRef, useEffect, useState } from 'react';
import { HOME_STEAM_VIDEO } from '../data/content';

/* global IntersectionObserver */

export default function SteamVideo() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (entry.isIntersecting && !prefersReduced) {
          video.play().catch(() => {});
          setPlaying(true);
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="home-section home-steam-video" aria-label={HOME_STEAM_VIDEO.heading}>
      <div className="steam-video-split">
        <div className="steam-video-panel" aria-hidden="true">
          <video
            ref={videoRef}
            className="steam-video"
            autoPlay={playing}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/home/cup-steam.jpg"
          >
            <source src="/videos/cup-steam.mp4" type="video/mp4" />
          </video>
          <div className="steam-video-logo">
            <img src="/images/brand/logo.svg" alt="" />
          </div>
        </div>
        <div className="steam-video-text-panel">
          <h2 className="steam-video-heading">{HOME_STEAM_VIDEO.heading}</h2>
          <p className="steam-video-body">{HOME_STEAM_VIDEO.body}</p>
        </div>
      </div>
    </section>
  );
}
