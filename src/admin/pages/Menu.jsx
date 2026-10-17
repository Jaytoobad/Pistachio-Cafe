import { useCallback, useEffect, useState } from 'react';
import { fetchCategories, fetchProducts, saveProduct, setProductAvailable, deleteProduct, uploadProductImage } from '../../services/admin';
import { compressImage } from '../../lib/imageCompression';
import { formatMoney, slugify } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import PageLoader from '../../components/PageLoader';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
      setCategories(cats);
      setProducts(prods);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const term = search.toLowerCase().trim();
  const visible = products.filter((p) => !term || p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term));

  const byCategory = {};
  (visible || []).forEach((p) => {
    const key = p.categories?.name || 'Uncategorized';
    (byCategory[key] = byCategory[key] || []).push(p);
  });

  const emptyProduct = { name: '', slug: '', category_id: '', description: '', price: '', image_url: '', is_available: true, is_featured: false, sort_order: 0 };

  useEffect(() => {
    setImagePreview(editing ? (editing.image_url || null) : null);
  }, [editing]);

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please select an image file.', 'error'); return; }
    if (file.size > 8 * 1024 * 1024) { showToast('Image is larger than 8MB.', 'error'); return; }
    setUploading(true);
    try {
      const compressed = await compressImage(file, { maxWidth: 1400, quality: 0.8 });
      const url = URL.createObjectURL(compressed);
      setImagePreview(url);
      setEditing((prev) => prev ? { ...prev, _imageFile: compressed, image_url: url } : prev);
    } catch {
      showToast('Could not process image.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    const p = editing;
    if (!p.name || !p.category_id || !p.slug) { showToast('Name, slug and category are required.', 'error'); return; }
    setSaving(true);
    try {
      let imageUrl = p.image_url && !p._imageFile ? p.image_url : null;
      let saved = p;
      if (p._imageFile) {
        if (!p.id) {
          saved = await saveProduct({ ...p, image_url: null });
        }
        const url = await uploadProductImage(p._imageFile, saved.id);
        imageUrl = url;
      }
      const payload = {
        name: p.name,
        slug: p.slug,
        category_id: p.category_id,
        description: p.description || '',
        price: Number(p.price || 0),
        image_url: imageUrl,
        is_available: Boolean(p.is_available),
        is_featured: Boolean(p.is_featured),
        sort_order: Number(p.sort_order || 0),
      };
      await saveProduct(payload, p.id || null);
      showToast(p.id ? 'Product updated' : 'Product added');
      setEditing(null);
      load();
    } catch (err) {
      showToast(err?.message || 'Could not save product.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailable(p) {
    try {
      await setProductAvailable(p.id, !p.is_available);
      load();
    } catch {
      showToast('Could not update availability.', 'error');
    }
  }

  async function removeProduct() {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      showToast('Product deleted');
      load();
    } catch (err) {
      if (err?.code === '23503') {
        await setProductAvailable(deleteTarget.id, false);
        load();
        showToast('Used in past orders — marked sold out instead of deleted.');
      } else {
        showToast(err?.message || 'Could not delete product.', 'error');
      }
    }
    setDeleteTarget(null);
  }

  if (loading) return <PageLoader />;
  if (loadError) {
    return (
      <div className="page">
        <div className="page-header"><h1>Menu</h1></div>
        <p className="empty-state">Could not load the menu. <button className="btn btn-outline" onClick={load}>Try again</button></p>
      </div>
    );
  }

  return (
    <div className="page menu-page">
      <div className="page-header">
        <div>
          <h1>Menu Manager</h1>
          <p className="page-sub">Products grouped by category</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="search" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', width: 240 }} />
          <button className="btn btn-primary" onClick={() => setEditing({ ...emptyProduct })}>+ Add product</button>
        </div>
      </div>

      {Object.keys(byCategory).map((catName) => (
        <section key={catName} style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-forest)' }}>{catName}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {byCategory[catName].map((p) => (
              <div key={p.id} className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.image_url && <img src={p.image_url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)', alignSelf: 'center' }} />}
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{p.description || '\u2014'}</div>
                <div style={{ fontWeight: 700, marginTop: 'auto' }}>{formatMoney(p.price)}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 'auto' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', margin: 0, cursor: 'pointer' }}>
                    <input type="checkbox" checked={p.is_available} onChange={() => toggleAvailable(p)} />
                    {p.is_available ? 'Available' : 'Sold out'}
                  </label>
                  {!p.is_available && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)' }}>86&rsquo;d</span>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing({ ...p })}>Edit</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setDeleteTarget(p)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      {Object.keys(byCategory).length === 0 && <p className="empty-state">No products yet.</p>}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product?"
        message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={removeProduct}
        onCancel={() => setDeleteTarget(null)}
      />

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>{editing.id ? 'Edit product' : 'New product'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Name</label>
                <input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Slug (auto-generated)</label>
                <input required value={editing.slug || slugify(editing.name)} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Category</label>
                <select required value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Description</label>
                <textarea rows={2} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Price (GHS)</label>
                <input type="number" step="0.01" required value={editing.price === '' ? '' : editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} style={{ padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                {uploading && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Processing&hellip;</span>}
                {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginTop: 6 }} />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                <input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} />
                <span>Featured</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                <input type="checkbox" checked={editing.is_available} onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} />
                <span>Available</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>Sort order</label>
                <input type="number" value={editing.sort_order === '' ? '' : editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || uploading}>{saving ? 'Saving&hellip;' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
