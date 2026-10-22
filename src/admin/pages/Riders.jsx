import { useCallback, useEffect, useState } from 'react';
import { fetchRiders, saveRider, deleteRider, fetchOrders } from '../services/admin';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import ConfirmDialog from '../../lib/components/ConfirmDialog';
import { AdminErrorState } from '../components/States';
import Icon from '../components/Icon';

export default function Riders() {
  const [riders, setRiders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const [r, o] = await Promise.all([fetchRiders(), fetchOrders()]);
      setRiders(r || []);
      setOrders(o || []);
    } catch { setLoadError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const emptyRider = { name: '', phone: '', is_active: true };
  const activeDeliveries = (riderId) => (orders || []).filter((o) => o.rider_id === riderId && o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'delivered');

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    const r = editing;
    if (!r.name) { showToast('Name is required.', 'error'); return; }
    setSaving(true);
    try {
      await saveRider({ name: r.name, phone: r.phone || null, is_active: r.is_active !== false }, r.id || null);
      showToast(r.id ? 'Rider saved' : 'Rider added');
      setEditing(null); load();
    } catch (err) { showToast(err?.message || 'Could not save rider.', 'error'); } finally { setSaving(false); }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    try { await deleteRider(deleteTarget.id); showToast('Rider deleted'); load(); }
    catch (err) { showToast(err?.message || 'Could not delete rider.', 'error'); }
    finally { setDeleteTarget(null); }
  }

  if (loading) return <PageLoader />;
  if (loadError) return (
    <div className="page page-shell"><div className="page-header"><h1>Riders</h1></div>
      <AdminErrorState message="Could not load riders." onRetry={load} /></div>
  );

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>Riders</h1>
          <p className="page-sub">Delivery riders and their active deliveries</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...emptyRider })}><Icon name="plus" size="16" style={{ marginRight: 6 }} /> Add rider</button>
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Delete rider?" message={`Delete "${deleteTarget.name}"? This cannot be undone.`} confirmLabel="Delete" cancelLabel="Keep" onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>{editing.id ? 'Edit rider' : 'New rider'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Name</label>
                <input required value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="field-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Phone</label>
                <input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="field-input" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                <label style={{ margin: 0 }}>Active</label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving\u2026' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Active</th><th>Active deliveries</th><th>Actions</th></tr></thead>
          <tbody>
            {riders.map((r) => {
              const dels = activeDeliveries(r.id);
              return (
                <tr key={r.id}>
                  <td className="cell-primary">{r.name}</td>
                  <td className="cell-muted">{r.phone || '\u2014'}</td>
                  <td>{r.is_active ? 'Yes' : 'No'}</td>
                  <td>{dels.length}</td>
                  <td className="table-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => setEditing(r)}>Edit</button>
                    {dels.length > 0 && r.phone && /[1-9]/.test(String(r.phone).replace(/\D/g, '')) && (
                      <a href={`https://wa.me/${String(r.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${r.name}, here are your active deliveries: ${dels.map((o) => o.order_code).join(', ')}`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">Send to rider</a>
                    )}
                    <button className="btn btn-sm btn-outline" onClick={() => setDeleteTarget(r)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {riders.length === 0 && <p className="empty-state">No riders yet.</p>}
    </div>
  );
}
