import { useCallback, useEffect, useState } from 'react';

import { fetchMenu, saveMenuSection, deleteMenuSection, reorderMenuSections, fetchDishes } from '../services/admin';

import { slugify } from '../../lib/format';

import { useToast } from '../../lib/context/ToastContext';

import PageLoader from '../../lib/components/PageLoader';

import ConfirmDialog from '../../lib/components/ConfirmDialog';



export default function MenuSections() {

  const [menus, setMenus] = useState([]);
  const [dishCounts, setDishCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState(false);

  const [editing, setEditing] = useState(null);

  const [saving, setSaving] = useState(false);

  const [reordering, setReordering] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [blockedTarget, setBlockedTarget] = useState(null);

  const { showToast } = useToast();



  const load = useCallback(async () => {

    setLoading(true);

    setLoadError(false);

    try {

const [cats, prods] = await Promise.all([fetchMenu(), fetchDishes()]);
      setMenus(cats.slice().sort((a, b) => a.sort_order - b.sort_order));
      const counts = {};
      (prods || []).forEach((p) => { counts[p.menu_id] = (counts[p.menu_id] || 0) + 1; });
      setDishCounts(counts);
    } catch {

      setLoadError(true);

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => { load(); }, [load]);



  const emptyMenu = { name: '', slug: '', sort_order: 0, is_visible: true };



async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    const c = editing;
    if (!c.name) { showToast('Name is required.', 'error'); return; }
    setSaving(true);
    try {
      await saveMenuSection({
        name: c.name,
        slug: c.slug || slugify(c.name),
        sort_order: Number(c.sort_order || 0),
        is_visible: c.is_visible !== false,
      }, c.id || null);
      showToast(c.id ? 'Menu updated' : 'Menu added');
      setEditing(null);
      load();
    } catch (err) {
      showToast(err?.message || 'Could not save menu.', 'error');
    } finally {
      setSaving(false);
    }
  }


  function moveMenu(c, dir) {

    const list = [...menus];

    const i = list.findIndex((x) => x.id === c.id);

    const j = dir === 'up' ? i - 1 : i + 1;

    if (j < 0 || j >= list.length) return;

    [list[i], list[j]] = [list[j], list[i]];

    setMenus(list);

    setReordering(true);

    reorderMenuSections(list.map((x) => x.id))

      .then(() => load())
      .catch(() => { showToast('Could not reorder categories.', 'error'); load(); })
      .finally(() => setReordering(false));



  }



  function requestDelete(c) {

    const count = dishCounts[c.id] || 0;

    if (count > 0) {

      setBlockedTarget(c);

      return;

    }

    setDeleteTarget(c);

  }



  async function doDelete() {

    if (!deleteTarget) return;

    try {

      await deleteMenuSection(deleteTarget.id);

      showToast('Menu deleted');

      load();

    } catch (err) {

      showToast(err?.message || 'Could not delete category.', 'error');



      setDeleteTarget(null);

    }

  }



  if (loading) return <PageLoader />;

  if (loadError) {

    return (

      <div className="page">

        <div className="page-header"><h1>Menus</h1></div>

        <p className="empty-state">Could not load categories. <button className="btn btn-outline" onClick={load}>Try again</button></p>

      </div>

    );

  }



  return (

    <div className="page categories-page">

      <div className="page-header">

        <div>

          <h1>Menus</h1>

          <p className="page-sub">Add, rename and reorder menu categories</p>

        </div>

        <button className="btn btn-primary" onClick={() => setEditing({ ...emptyMenu })}>+ Add category</button>

      </div>



      {blockedTarget && (

        <div className="card" style={{ padding: 14, marginBottom: 16 }}>

          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-error)' }}>

            Cannot delete &ldquo;${blockedTarget.name}&rdquo; â€” it has ${dishCounts[blockedTarget.id] || 0} dish(s). Move those dishes to another category first.

          </p>

          <button className="btn btn-outline btn-sm" onClick={() => setBlockedTarget(null)}>OK</button>

        </div>

      )}



      <ConfirmDialog

        open={!!deleteTarget}

        title="Delete category?"

        message={`Delete "${deleteTarget.name}"? This cannot be undone.`}

        confirmLabel="Delete"

        cancelLabel="Keep"

        onConfirm={doDelete}

        onCancel={() => setDeleteTarget(null)}

      />



      <div className="data-table-wrap">

        <table className="data-table">

          <thead>

            <tr><th>#</th><th>Name</th><th>Slug</th><th>Dishes</th><th>Actions</th></tr>

          </thead>

          <tbody>

            {categories.map((c, index) => (

              <tr key={c.id}>

                  <td style={{ width: 52 }}>

                  <span className="cell-muted">{c.sort_order}</span>

                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>

                    <button className="btn btn-xs btn-outline" onClick={() => moveMenu(c, 'up')} disabled={index === 0 || reordering}>&uarr;</button>

                    <button className="btn btn-xs btn-outline" onClick={() => moveMenu(c, 'down')} disabled={index === categories.length - 1 || reordering}>&darr;</button>

                  </div>

                </td>

                <td className="cell-primary">{c.name}</td>

                <td className="cell-muted">{c.slug}</td>

                <td>{dishCounts[c.id] || 0}</td>

                <td className="table-actions">

                  <button className="btn btn-sm btn-outline" onClick={() => setEditing(c)}>Edit</button>

                  <button className="btn btn-sm btn-outline" onClick={() => requestDelete(c)}>Delete</button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {categories.length === 0 && <p className="empty-state">No categories yet.</p>}



      {editing && (

        <div className="modal-overlay" onClick={() => setEditing(null)}>

          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <h3 style={{ marginBottom: 16 }}>{editing.id ? 'Edit category' : 'New category'}</h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

                <label>Name</label>

                <input required value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />

              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

                <label>Slug</label>

                <input required value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />

                <span className="form-hint">Auto-generated from the name if left blank.</span>

              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

                <label>Sort order</label>

                <input type="number" value={editing.sort_order === '' ? '' : editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />

              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>

                <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>

                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving&hellip;' : 'Save'}</button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}









