import { useCallback, useEffect, useState } from 'react';
import { fetchMenu, fetchDishes, saveDish, deleteDish } from '../services/admin';
import { slugify } from '../../lib/format';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import ConfirmDialog from '../../lib/components/ConfirmDialog';

const emptyDish = { name: '', slug: '', menu_id: '', description: '', price: '', image_url: '', is_available: true, is_featured: false, is_hidden: false, sort_order: 0, tags: '' };

export default function Dishes() {
  const [menus, setMenus] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [m, d] = await Promise.all([fetchMenu(), fetchDishes()]);
      setMenus((m || []).slice().sort((a, b) => a.sort_order - b.sort_order));
      setDishes((d || []).slice().sort((a, b) => a.sort_order - b.sort_order));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    const d = editing;
    if (!d.name) { showToast('Name is required.', 'error'); return; }
    if (!d.menu_id) { showToast('Section is required.', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        name: d.name,
        slug: d.slug || slugify(d.name),
        menu_id: d.menu_id,
        description: d.description || null,
        price: Number(d.price || 0),
        image_url: d.image_url || null,
        is_available: d.is_available !== false,
        is_featured: !!d.is_featured,
        is_hidden: !!d.is_hidden,
        sort_order: Number(d.sort_order || 0),
        tags: d.tags ? d.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      await saveDish(payload, d.id || null);
      showToast(d.id ? 'Dish updated' : 'Dish added');
      setEditing(null);
      load();
    } catch (err) {
      showToast(err?.message || 'Could not save dish.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDish(deleteTarget.id);
      showToast('Dish deleted');
      load();
    } catch (err) {
      showToast(err?.message || 'Could not delete dish.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  const menuName = (id) => menus.find((m) => m.id === id)?.name || id;

  if (loading) return <PageLoader />;
  if (loadError) {
    return (
      <div className="page">
        <div className="page-header"><h1>Dishes</h1></div>
        <p className="empty-state">Could not load dishes. <button className="btn btn-outline" onClick={load}>Try again</button></p>
      </div>
    );
  }

  return (
    <div className="page dishes-page">
      <div className="page-header">
        <div>
          <h1>Dishes</h1>
          <p className="page-sub">Add, edit and remove dishes per menu section</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...emptyDish })}>+ Add dish</button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Section</th><th>Price</th><th>Available</th><th>Featured</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {dishes.map((d) => (
              <tr key={d.id}>
                <td className="cell-primary">{d.name}</td>
                <td className="cell-muted">{menuName(d.menu_id)}</td>
                <td>{Number(d.price).toFixed(2)}</td>
                <td>{d.is_available ? 'Yes' : 'No'}</td>
                <td>{d.is_featured ? 'Yes' : 'No'}</td>
                <td className="table-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => setEditing({ ...d, tags: Array.isArray(d.tags) ? d.tags.join(', ') : (d.tags || '') })}>Edit</button>
                  <button className="btn btn-sm btn-outline" onClick={() => setDeleteTarget(d)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dishes.length === 0 && <p className="empty-state">No dishes yet.</p>}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete dish?"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={doDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560, width: '100%' }}>
            <h3 style={{ marginBottom: 16 }}>{editing.id ? 'Edit dish' : 'New dish'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Name</label>
                <input required value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Section</label>
                <select required value={editing.menu_id || ''} onChange={(e) => setEditing({ ...editing, menu_id: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <option value="">— Select section —</option>
                  {menus.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Slug</label>
                <input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                <span className="form-hint">Auto-generated from the name if left blank.</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Description</label>
                <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label>Price</label>
                  <input type="number" step="0.01" value={editing.price === '' ? '' : editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label>Sort order</label>
                  <input type="number" value={editing.sort_order === '' ? '' : editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Image URL</label>
                <input value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="/images/products/dish.jpg" style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Tags (comma separated)</label>
                <input value={editing.tags || ''} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={editing.is_available !== false} onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} /> Available</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={!!editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Featured</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={!!editing.is_hidden} onChange={(e) => setEditing({ ...editing, is_hidden: e.target.checked })} /> Hidden</label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}