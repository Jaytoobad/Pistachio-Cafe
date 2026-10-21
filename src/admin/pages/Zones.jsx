import { useCallback, useEffect, useState } from 'react';
import { fetchDishes } from '../services/admin';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import ConfirmDialog from '../../lib/components/ConfirmDialog';
import { AdminErrorState } from '../components/States';
import Icon from '../components/Icon';

export default function Zones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const { data } = await supabaseFetch();
      setZones(data || []);
    } catch { setLoadError(true); } finally { setLoading(false); }
  }, []);

  async function supabaseFetch() {
    const { supabase } = await import('../../lib/supabase');
    return supabase.from('delivery_zones').select('*').order('sort_order');
  }

  useEffect(() => { load(); }, [load]);

  const emptyZone = { name: '', fee: '', est_minutes: '', is_active: true };

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    const z = editing;
    if (!z.name) { showToast('Name is required.', 'error'); return; }
    setSaving(true);
    try {
      const { supabase } = await import('../../lib/supabase');
      const payload = { name: z.name, fee: Number(z.fee || 0), estimated_minutes: Number(z.est_minutes || 0) || null, is_active: z.is_active !== false, sort_order: Number(z.sort_order || 0) };
      if (z.id) {
        const { error } = await supabase.from('delivery_zones').update(payload).eq('id', z.id);
        if (error) throw error;
        showToast('Zone saved');
      } else {
        const { error } = await supabase.from('delivery_zones').insert(payload);
        if (error) throw error;
        showToast('Zone added');
      }
      setEditing(null); load();
    } catch (err) { showToast(err?.message || 'Could not save zone.', 'error'); } finally { setSaving(false); }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    try {
      const { supabase } = await import('../../lib/supabase');
      const { error } = await supabase.from('delivery_zones').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      showToast('Zone deleted'); load();
    } catch (err) { showToast(err?.message || 'Could not delete zone.', 'error'); }
    finally { setDeleteTarget(null); }
  }

  if (loading) return <PageLoader />;
  if (loadError) return (
    <div className="page page-shell"><div className="page-header"><h1>Zones</h1></div>
      <AdminErrorState message="Could not load zones." onRetry={load} /></div>
  );

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>Zones</h1>
          <p className="page-sub">Delivery zones, fees and ETA</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...emptyZone })}><Icon name="plus" size="16" style={{ marginRight: 6 }} /> Add zone</button>
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Delete zone?" message={`Delete "${deleteTarget.name}"? This cannot be undone.`} confirmLabel="Delete" cancelLabel="Keep" onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>{editing.id ? 'Edit zone' : 'New zone'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Name</label>
                <input required value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="field-input" />
              </div>
              <div style={{ grid: '1fr 1fr', gap: 12, display: 'grid' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label>Fee</label>
                  <input type="number" step="0.01" value={editing.fee === '' ? '' : editing.fee} onChange={(e) => setEditing({ ...editing, fee: e.target.value })} className="field-input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label>ETA (minutes)</label>
                  <input type="number" value={editing.est_minutes === '' ? '' : editing.est_minutes} onChange={(e) => setEditing({ ...editing, est_minutes: e.target.value })} className="field-input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label>Sort order</label>
                  <input type="number" value={editing.sort_order === '' ? '' : editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} className="field-input" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                <label style={{ margin: 0 }}>Active</label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Fee</th><th>ETA</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id}>
                <td className="cell-primary">{z.name}</td>
                <td>{Number(z.fee).toFixed(2)}</td>
                <td>{z.estimated_minutes != null ? `${z.estimated_minutes} min` : '\u2014'}</td>
                <td><button className="btn btn-sm btn-outline" onClick={() => { const nz = { ...z, is_active: !z.is_active }; handleSaveZone(nz); }}>{z.is_active ? 'Yes' : 'No'}</button></td>
                <td className="table-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => setEditing(z)}>Edit</button>
                  <button className="btn btn-sm btn-outline" onClick={() => setDeleteTarget(z)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {zones.length === 0 && <p className="empty-state">No zones yet.</p>}
    </div>
  );

  async function handleSaveZone(z) {
    setSaving(true);
    try {
      const { supabase } = await import('../../lib/supabase');
      const { error } = await supabase.from('delivery_zones').update({ is_active: z.is_active }).eq('id', z.id);
      if (error) throw error;
      load();
    } catch (err) { showToast(err?.message || 'Could not update zone.', 'error'); } finally { setSaving(false); }
  }
}
