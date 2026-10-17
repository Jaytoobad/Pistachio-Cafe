export function SkeletonCard() {
  return (
    <article className="sf-product-card">
      <div className="sf-product-media">
        <div className="sf-skeleton" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="sf-product-body">
        <div className="sf-skeleton" style={{ height: '20px', width: '70%', marginBottom: '8px' }} />
        <div className="sf-skeleton" style={{ height: '14px', width: '90%', marginBottom: '6px' }} />
        <div className="sf-skeleton" style={{ height: '14px', width: '80%' }} />
        <div className="sf-product-foot" style={{ marginTop: '16px' }}>
          <div className="sf-skeleton" style={{ height: '20px', width: '60px' }} />
          <div className="sf-skeleton" style={{ height: '36px', width: '90px', borderRadius: 'var(--radius-sm)' }} />
        </div>
      </div>
    </article>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="sf-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonText({ height = 16, width = '100%' }) {
  return <div className="sf-skeleton" style={{ height, width }} />;
}
