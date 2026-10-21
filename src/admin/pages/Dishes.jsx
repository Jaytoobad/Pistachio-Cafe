import { useCallback, useEffect, useState } from 'react';
import { fetchMenu, fetchDishes, saveDish, deleteDish, setDishAvailable, uploadDishImage, reorderDishes } from '../services/admin';
import { slugify } from '../../lib/format';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import { AdminErrorState } from '../components/States';
import ConfirmDialog from '../../lib/components/ConfirmDialog';
import Icon from '../components/Icon';

const emptyDish = { name: '', slug: '', menu_id: '', description: '', price: '', image_url: '', is_available: true, is_featured: false, is_hidden: false, sort_order: 0, tags: '' };

export default function Dishes() {
  const [menus, setMenus] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const [m, d] = await Promise.all([fetchMenu(), fetchDishes()]);
      setMenus((m || []).slice().sort((a, b) => a.sort_order - b.sort_order));
      setDishes((d || []).slice().sort((a, b) => a.sort_order - b.sort_order));
    } catch { setLoadError(true); } finally { setLoading(false); }
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
        name: d.name, slug: d.slug || slugify(d.name), menu_id: d.menu_id,
        description: d.description || null, price: Number(d.price || 0),
        image_url: d.image_url || null, is_available: d.is_available !== false,
        is_featured: !!d.is_featured, is_hidden: !!d.is_hidden,
        sort_order: Number(d.sort_order || 0),
        tags: d.tags ? d.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      await saveDish(payload, d.id || null);
      showToast(d.id ? 'Dish saved' : 'Dish added');
      setEditing(null); load();
    } catch (err) {
      showToast(err?.message || 'Could not save dish.', 'error');
    } finally { setSaving(false); }
  }

  async function doDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDish(deleteTarget.id);
      showToast('Dish deleted'); load();
    } catch (err) { showToast(err?.message || 'Could not delete dish.', 'error'); }
    finally { setDeleteTarget(null); }
  }

  async function handleImage(e, dish) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(dish.id);
    try {
      const url = await uploadDishImage(file, dish.id);
      await saveDish({ ...dish, image_url: url }, dish.id);
      showToast('Photo uploaded');
      load();
    } catch (err) {
      showToast(err?.message || 'Could not upload photo.', 'error');
    } finally { setUploading(null); }
  }

  const menuName = (id) => menus.find((m) => m.id === id)?.name || id;

  if (loading) return <PageLoader />;
  if (loadError) {
    return (
      <div className="page page-shell"><div className="page-header"><h1>Dishes</h1></div>
        <AdminErrorState message="Could not load dishes." onRetry={load} /></div>
    );
  }

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>Dishes</h1>
          <p className="page-sub">Add, edit and remove dishes per menu section</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({ ...emptyDish })}><Icon name="plus" size="16" style={{ marginRight: 6 }} /> Add dish</button>
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Delete dish?" message={`Delete "${deleteTarget.name}"? This cannot be undone.`} confirmLabel="Delete" cancelLabel="Keep" onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, width: '100%' }}>
            <h3 style={{ marginBottom: 16 }}>{editing.id ? 'Edit dish' : 'New dish'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Name</label>
                <input required value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="field-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Section</label>
                <select required value={editing.menu_id || ''} onChange={(e) => setEditing({ ...editing, menu_id: e.target.value })} className="field-input">
                  <option value="">â€” Select section â€”</option>
                  {menus.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Slug</label>
                <input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="field-input" />
                <span className="field-note">Auto-generated from the name if left blank.</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Description</label>
                <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="field-input" />
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Image</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="image-preview" style={{ width: 120, height: 120 }}>
                    {editing.image_url ? <img src={editing.image_url} alt="preview" /> : <span className="image-preview-empty">No image</span>}
                  </div>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImage(e, editing)} disabled={uploading === editing.id} />
                  {uploading === editing.id && <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Uploadingâ€¦</span>}
                </div>
                <input value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="field-input" placeholder="or image URL" />
                <span className="field-note">JPG, PNG or WEBP, max 5 MB. Auto-resized to 1200px.</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Tags (comma separated)</label>
                <input value={editing.tags || ''} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} className="field-input" />
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={editing.is_available !== false} onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} /> Available</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={!!editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Featured</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked={!!editing.is_hidden} onChange={(e) => setEditing({ ...editing, is_hidden: e.target.checked })} /> Hidden</label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Savingâ€¦' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Section</th><th>Price</th><th>Available</th><th>Featured</th><th>Photo</th><th>Actions</th></tr></thead>
          <tbody>
            {dishes.map((d) => (
              <tr key={d.id}>
                <td className="cell-primary">{d.name}</td>
                <td className="cell-muted">{menuName(d.menu_id)}</td>
                <td>{Number(d.price).toFixed(2)}</td>
                <td><button className="btn btn-sm btn-outline" onClick={() => setDishAvailable(d.id, !d.is_available)}>{d.is_available ? 'Yes' : 'No'}</button></td>
                <td>{d.is_featured ? 'Yes' : 'No'}</td>
                <td><img src={d.image_url || '/images/placeholder-cup-pistachios.jpg'} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} /></td>
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
    </div>
  );
}

