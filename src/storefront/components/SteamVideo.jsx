import { useRef, useEffect } from 'react';
import { HOME_STEAM_VIDEO } from '../data/content';

/* global IntersectionObserver */

export default function SteamVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      const rect = video.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) tryPlay();
    };

    const tryPlay = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.pause();
        return;
      }
      video.playbackRate = 1.35;
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
    observer.observe(video);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      observer.disconnect();
      video.removeEventListener('loadeddata', handleLoadedData);
    };
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
            poster="/images/home/cup-steam-branded-frame.jpg"
          >
            <source src="/videos/cup-steam-branded.webm" type="video/webm" />
            <source src="/videos/cup-steam-branded.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="steam-video-text-panel">
          <h2 className="steam-video-heading">{HOME_STEAM_VIDEO.heading}</h2>
          <p className="steam-video-body">{HOME_STEAM_VIDEO.body}</p>
        </div>
      </div>
    </section>
  );
}
