import { useRef, useEffect } from 'react';
import { HOME_STEAM_VIDEO } from '../data/content';

/* global IntersectionObserver */

export default function SteamVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.pause();
        return;
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          tryPlay();
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(video);
    video.addEventListener('loadeddata', () => {
      const rect = video.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) tryPlay();
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="home-section home-steam-video" aria-label={HOME_STEAM_VIDEO.heading}>
      <div className="steam-video-split">
        <div className="steam-video-panel" aria-hidden="true">
          <video
            ref={videoRef}
            className="steam-video"
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/home/cup-steam.jpg"
          >
            <source src="/videos/cup-steam.webm" type="video/webm" />
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
