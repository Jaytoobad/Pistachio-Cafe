const TONES = {
  received: 'received',
  preparing: 'preparing',
  ready: 'ready',
  completed: 'completed',
  cancelled: 'cancelled',
  pending: 'pending',
  paid: 'paid',
  failed: 'failed',
};

export default function StatusPill({ status }) {
  return <span className={`pill ${TONES[status] || 'muted'}`}>{String(status || '-').charAt(0).toUpperCase() + String(status || '').slice(1)}</span>;
}
