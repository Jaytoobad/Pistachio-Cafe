import { useCallback, useEffect, useState } from 'react';
import { fetchSubscribers, deleteSubscriber } from '../services/admin';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import ConfirmDialog from '../../lib/components/ConfirmDialog';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setSubscribers(await fetchSubscribers());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function requestDelete(s) { setDeleteTarget(s); }
  async function doDelete() {
    if (!deleteTarget) return;
    try {
      await deleteSubscriber(deleteTarget.id);
      showToast('Subscriber removed');
      setSubscribers(subscribers.filter((x) => x.id !== deleteTarget.id));
    } catch (err) {
      showToast(err?.message || 'Could not remove subscriber.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="page">
        <div className="page-header"><h1>Subscribers</h1></div>
        <p className="empty-state">Could not load subscribers. <button className="btn btn-outline" onClick={load}>Try again</button></p>
      </div>
    );
  }

  return (
    <div className="page subscribers-page">
      <div className="page-header">
        <div>
          <h1>Subscribers</h1>
          <p className="page-sub">Newsletter mailing list</p>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove subscriber?"
        message={deleteTarget ? `Remove &ldquo;${deleteTarget.email || 'this subscriber'}&rdquo; from the mailing list?` : 'Remove subscriber?'}
        confirmLabel="Remove"
        cancelLabel="Keep"
        onConfirm={doDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Email</th><th>Subscribed</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td className="cell-muted">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                <td className="table-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => requestDelete(s)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {subscribers.length === 0 && <p className="empty-state">No subscribers yet.</p>}
    </div>
  );
}
