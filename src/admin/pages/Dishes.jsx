import { useCallback, useEffect, useState } from 'react';
import { fetchMenus, fetchDishes, saveDish, deleteDish, setDishAvailable, uploadDishImage } from '../services/admin';
import { slugify } from '../../lib/format';
import { useToast } from '../../lib/context/ToastContext';
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
      const [m, d] = await Promise.all([fetchMenus(), fetchDishes()]);
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
    if (!d.menu_id) { showToast('Menu is required.', 'error'); return; }
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

  if (loading) return (
    <div className="page page-shell">
      <div className="page-header"><h1>Dishes</h1><p className="page-sub">Add, edit and remove dishes per menu</p></div>
      <div style={{ padding: 40 }}><div className="sk-text" style={{ width: 120, height: 16 }} /></div>
    </div>
  );
  if (loadError) return (
    <div className="page page-shell">
      <div className="page-header"><h1>Dishes</h1><p className="page-sub">Add, edit and remove dishes per menu</p></div>
      <AdminErrorState message="Could not load dishes." onRetry={load} />
    </div>
  );

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div><h1>Dishes</h1><p className="page-sub">Add, edit and remove dishes per menu</p></div>
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
                <label>Menu</label>
                <select required value={editing.menu_id || ''} onChange={(e) => setEditing({ ...editing, menu_id: e.target.value })} className="field-input">
                  <option value="">&mdash; Select menu &mdash;</option>
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
                  {uploading === editing.id && <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Uploading\u2026</span>}
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
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving\u2026' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 12 }}>
        {dishes.map((d) => (
          <div key={d.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
            <div className="dish-media" style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', background: 'var(--color-pistachio-tint)' }}>
              {d.image_url ? <img src={d.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="dish-photo-missing" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="dishes" size="24" style={{ color: 'var(--color-sage)' }} /></div>}
              {!d.is_available && <span className="soldout-badge" style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(168, 67, 75, 0.9)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}>Sold out</span>}
              {d.is_featured && <span className="featured-badge" style={{ position: 'absolute', top: 8, right: 8, background: 'var(--color-ochre)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}>Featured</span>}
            </div>
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-ink)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 2 }}>{menuName(d.menu_id)}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{Number(d.price).toFixed(2)}</div>
              </div>
              {d.tags && d.tags.length && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {d.tags.map((t) => (
                  <span key={t} style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '100px' }}>{t}</span>
                ))}
              </div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button className="btn btn-sm btn-outline" onClick={() => setDishAvailable(d.id, !d.is_available)}>{d.is_available ? 'Mark sold out' : 'Mark available'}</button>
                {d.is_hidden ? <button className="btn btn-sm btn-outline" onClick={() => setDishAvailable(d.id, d.is_available)}>Unhide</button> : <button className="btn btn-sm btn-outline" onClick={() => setDishAvailable(d.id, d.is_available)}>Hide</button>}
                <button className="btn btn-sm btn-outline" onClick={() => setEditing({ ...d, tags: Array.isArray(d.tags) ? d.tags.join(', ') : (d.tags || '') })}>Edit</button>
                <button className="btn btn-sm btn-outline" onClick={() => setDeleteTarget(d)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {dishes.length === 0 && <div style={{ gridColumn: '1 / -1' }}><AdminEmptyState title="No dishes yet" description="Add your first dish." /></div>}
      </div>
    </div>
  );
}
