import { useCallback, useEffect, useState } from 'react';
import { fetchDishes, fetchDishAddons, saveDishAddon, deleteDishAddon } from '../services/admin';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import ConfirmDialog from '../../lib/components/ConfirmDialog';
import { AdminErrorState } from '../components/States';
import Icon from '../components/Icon';

export default function AddOns() {
  const [dishes, setDishes] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const [d, a] = await Promise.all([fetchDishes(), fetchDishAddons()]);
      setDishes(d || []);
      setAddons(a || []);
    } catch { setLoadError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const emptyAddon = { dish_id: '', name: '', price: '', is_available: true, sort_order: 0 };

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    const a = editing;
    if (!a.dish_id) { showToast('Dish is required.', 'error'); return; }
    if (!a.name) { showToast('Name is required.', 'error'); return; }
    setSaving(true);
    try {
      const payload = { dish_id: a.dish_id, name: a.name, price: Number(a.price || 0), is_available: a.is_available !== false, sort_order: Number(a.sort_order || 0) };
      await saveDishAddon(payload, a.id || null);
      showToast(a.id ? 'Add-on saved' : 'Add-on added');
      setEditing(null); load();
    } catch (err) { showToast(err?.message || 'Could not save add-on.', 'error'); } finally { setSaving(false); }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    try { await deleteDishAddon(deleteTarget.id); showToast('Add-on deleted'); load(); }
    catch (err) { showToast(err?.message || 'Could not delete add-on.', 'error'); }
    finally { setDeleteTarget(null); }
  }

  const dishName = (id) => dishes.find((d) => d.id === id)?.name || id;

  if (loading) return <PageLoader />;
  if (loadError) return (
    <div className="page page-shell"><div className="page-header"><h1>Add-ons</h1></div>
      <AdminErrorState message="Could not load add-ons." onRetry={load} /></div>
  );

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>Add-ons</h1>
          <p className="page-sub">Extra options per dish</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...emptyAddon })}><Icon name="plus" size="16" style={{ marginRight: 6 }} /> Add add-on</button>
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Delete add-on?" message={`Delete "${deleteTarget.name}"? This cannot be undone.`} confirmLabel="Delete" cancelLabel="Keep" onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>{editing.id ? 'Edit add-on' : 'New add-on'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Dish</label>
                <select required value={editing.dish_id || ''} onChange={(e) => setEditing({ ...editing, dish_id: e.target.value })} className="field-input">
                  <option value="">&mdash; Select dish &mdash;</option>
                  {dishes.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Name</label>
                <input required value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="field-input" />
              </div>
              <div style={{ grid: '1fr 1fr', gap: 12, display: 'grid' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label>Price</label>
                  <input type="number" step="0.01" value={editing.price === '' ? '' : editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="field-input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label>Sort order</label>
                  <input type="number" value={editing.sort_order === '' ? '' : editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} className="field-input" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={editing.is_available !== false} onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} />
                <label style={{ margin: 0 }}>Available</label>
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
          <thead><tr><th>Dish</th><th>Name</th><th>Price</th><th>Available</th><th>Actions</th></tr></thead>
          <tbody>
            {addons.map((a) => (
              <tr key={a.id}>
                <td className="cell-muted">{dishName(a.dish_id)}</td>
                <td className="cell-primary">{a.name}</td>
                <td>{Number(a.price).toFixed(2)}</td>
                <td><button className="btn btn-sm btn-outline" onClick={() => saveDishAddon({ ...a, is_available: !a.is_available }, a.id)}>{a.is_available ? 'Yes' : 'No'}</button></td>
                <td className="table-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => setEditing({ ...a })}>Edit</button>
                  <button className="btn btn-sm btn-outline" onClick={() => setDeleteTarget(a)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {addons.length === 0 && <p className="empty-state">No add-ons yet.</p>}
    </div>
  );
}
