import { SkeletonGrid } from './Skeleton';

export default function PageLoader() {
  return (
    <div className="page-loader" style={{ padding: '40px 20px', maxWidth: 'var(--container-width)', margin: '0 auto' }}>
      <SkeletonGrid count={6} />
    </div>
  );
}
