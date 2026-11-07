export default function SplitView({ imageSrc, imageAlt, imageCaption, children, className, reverse = false }) {
  return (
    <section className={`split-view ${className || ''}`} aria-label={imageCaption || undefined}>
      <div className="split-view-wrap">
        <div className={`split-view-panel split-view-image ${reverse ? 'split-view-panel--second' : 'split-view-panel--first'}`}>
          <div className="split-view-image-wrap">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="split-view-image"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            {imageCaption && (
              <p className="split-view-image-caption">{imageCaption}</p>
            )}
          </div>
        </div>
        <div className={`split-view-panel split-view-content ${reverse ? 'split-view-panel--first' : 'split-view-panel--second'}`}>
          <div className="split-view-content-inner">{children}</div>
        </div>
      </div>
    </section>
  );
}
