const TONES = {
  received: 'received',
  confirmed: 'confirmed',
  preparing: 'preparing',
  ready: 'ready',
  out_for_delivery: 'delivery',
  delivered: 'delivered',
  completed: 'completed',
  cancelled: 'cancelled',
  pending: 'pending',
  pending_payment: 'pending',
  paid: 'paid',
  failed: 'failed',
  refunded: 'failed',
};

function label(status) {
  const map = {
    received: 'Received',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    out_for_delivery: 'Out for delivery',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    pending_payment: 'Pending payment',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  return map[status] || String(status || '-').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusPill({ status }) {
  return <span className={`pill ${TONES[status] || 'muted'}`}>{label(status)}</span>;
}
