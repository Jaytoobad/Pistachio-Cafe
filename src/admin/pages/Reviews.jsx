import { useCallback, useEffect, useState } from 'react';
import { fetchReviews, setReviewApproved, deleteReview } from '../../services/admin';
import { formatMoney } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import PageLoader from '../../components/PageLoader';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setReviews(await fetchReviews());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleApproved(r) {
    try {
      await setReviewApproved(r.id, !r.is_approved);
      setReviews(reviews.map((x) => x.id === r.id ? { ...x, is_approved: !x.is_approved } : x));
      showToast(r.is_approved ? 'Review unapproved' : 'Review approved');
    } catch (err) {
      showToast(err?.message || 'Could not update review.', 'error');
    }
  }

  function requestDelete(r) { setDeleteTarget(r); }
  async function doDelete() {
    if (!deleteTarget) return;
    try {
      await deleteReview(deleteTarget.id);
      showToast('Review deleted');
      setReviews(reviews.filter((x) => x.id !== deleteTarget.id));
    } catch (err) {
      showToast(err?.message || 'Could not delete review.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="page">
        <div className="page-header"><h1>Reviews</h1></div>
        <p className="empty-state">Could not load reviews. <button className="btn btn-outline" onClick={load}>Try again</button></p>
      </div>
    );
  }

  return (
    <div className="page reviews-page">
      <div className="page-header">
        <div>
          <h1>Reviews</h1>
          <p className="page-sub">Approve and manage customer reviews</p>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete review?"
        message={deleteTarget ? `Delete the review for &ldquo;${deleteTarget.product_name || 'an item'}&rdquo;?` : 'Delete review?'}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={doDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Customer</th><th>Product</th><th>Rating</th><th>Comment</th><th>Approved</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.customer_name || r.user_email || '—'}</td>
                <td className="cell-muted">{r.product_name || '—'}</td>
                <td>{'★'.repeat(r.rating || 0)}${'☆'.repeat(5 - (r.rating || 0))}</td>
                <td className="cell-muted" style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment || ''}</td>
                <td>
                  <button className={`btn btn-sm ${r.is_approved ? 'btn-outline' : 'btn-primary'}`} onClick={() => toggleApproved(r)}>
                    {r.is_approved ? 'Approved' : 'Approve'}
                  </button>
                </td>
                <td className="table-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => requestDelete(r)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reviews.length === 0 && <p className="empty-state">No reviews yet.</p>}
    </div>
  );
}
