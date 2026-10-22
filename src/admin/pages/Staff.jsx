import { useCallback, useEffect, useState } from 'react';
import { fetchStaff, addStaff, updateStaff, removeStaff } from '../services/admin';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import ConfirmDialog from '../../lib/components/ConfirmDialog';
import { AdminErrorState } from '../components/States';
import Icon from '../components/Icon';

const ROLES = [
  { value: 'admin', label: 'Admin', desc: 'Full access: menus, dishes, settings, staff, riders, zones, reviews, subscribers and all order fields.' },
  { value: 'manager', label: 'Manager', desc: 'Can read orders and change status, rider and estimated minutes. Cannot edit menus, settings or staff.' },
  { value: 'kitchen', label: 'Kitchen', desc: 'Can read orders and change status, rider and estimated minutes. Focused on kitchen flow.' },
  { value: 'rider', label: 'Rider', desc: 'Can read orders and change status, rider and estimated minutes. Focused on deliveries.' },
];

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState('staff');
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editRole, setEditRole] = useState('staff');
  const [editActive, setEditActive] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try { setStaff(await fetchStaff()); }
    catch { setLoadError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const adminCount = staff.filter((s) => s.role === 'admin' && s.is_active !== false).length;

  async function handleAdd(e) {
    e.preventDefault();
    if (!newUserId || adding) return;
    setAdding(true);
    try {
      await addStaff({ userId: newUserId, role: newRole });
      showToast('Staff member added');
      setNewUserId(''); setNewRole('staff'); load();
    } catch (err) { showToast(err?.message || 'Could not add staff member.', 'error'); } finally { setAdding(false); }
  }

  function requestDelete(s) { setDeleteTarget(s); }
  async function doDelete() {
    if (!deleteTarget) return;
    try {
      await removeStaff(deleteTarget.id);
      showToast('Staff member removed');
      setStaff(staff.filter((x) => x.id !== deleteTarget.id)); load();
    } catch (err) { showToast(err?.message || 'Could not remove staff member.', 'error'); }
    finally { setDeleteTarget(null); }
  }

  const roleDesc = (role) => ROLES.find((r) => r.value === role)?.desc || '';

  if (loading) return <PageLoader />;
  if (loadError) return (
    <div className="page page-shell"><div className="page-header"><h1>Staff</h1></div>
      <AdminErrorState message="Could not load staff." onRetry={load} /></div>
  );

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>Staff</h1>
          <p className="page-sub">Admin access and roles</p>
        </div>
      </div>

      {adminCount <= 1 && (
        <div className="card" style={{ padding: 14, marginBottom: 16, border: '1px solid var(--color-error)', background: '#fffbfa' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-error)' }}>
            Last active admin: this account cannot be deactivated or removed. At least one active admin is required.
          </p>
        </div>
      )}

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Supabase Auth user ID</label>
          <input required value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder="user ID" style={{ flex: 1, minWidth: 260, padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <button type="submit" className="btn btn-primary" disabled={adding}>{adding ? 'Adding&hellip;' : 'Add staff'}</button>
        </form>
        <p className="form-hint">Add a staff row for each Supabase Auth account that should have admin access. Create the account first at /admin/login, then add its user ID here.</p>
      </div>

      <ConfirmDialog open={!!deleteTarget} title="Remove staff member?" message="Remove this staff member's admin access? They will no longer be able to sign in." confirmLabel="Remove" cancelLabel="Keep" onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />

      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>User ID</th><th>Role</th><th>What they can do</th><th>Active</th><th>Added</th><th>Actions</th></tr></thead>
          <tbody>
            {staff.map((s) => {
              const isAdmin = s.role === 'admin' && s.is_active !== false;
              const isLastAdmin = adminCount <= 1 && isAdmin;
              return (
                <tr key={s.id}>
                  <td className="cell-muted" style={{ fontSize: '0.85rem' }}>{s.user_id}</td>
                  <td className="cell-muted">{s.role || 'staff'}</td>
                  <td className="cell-muted" style={{ fontSize: '0.8rem', maxWidth: 260 }}>{roleDesc(s.role || 'staff')}</td>
                  <td>
                    {editingId === s.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />
                        <label style={{ margin: 0, fontSize: '0.8rem' }}>{editActive ? 'Active' : 'Deactivate'}</label>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem' }}>{s.is_active ? 'Yes' : 'No'}</span>
                    )}
                  </td>
                  <td className="cell-muted">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '\u2014'}</td>
                  <td className="table-actions">
                    {editingId === s.id ? (
                      <>
                        <select value={editRole} onChange={(e) => setEditRole(e.target.value)} style={{ padding: '4px 8px', fontSize: '0.8rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <button className="btn btn-sm btn-outline" onClick={() => {
                          if (!editActive && isLastAdmin) { showToast('Cannot deactivate the last active admin.', 'error'); return; }
                          updateStaff(s.id, { role: editRole, is_active: editActive }).then(() => { showToast('Staff updated'); setEditingId(null); load(); }).catch((err) => showToast(err?.message || 'Could not update staff.', 'error'));
                        }}>Save</button>
                        <button className="btn btn-sm btn-outline" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-sm btn-outline" onClick={() => { setEditingId(s.id); setEditRole(s.role || 'staff'); setEditActive(s.is_active !== false); }}>Edit</button>
                        <button className="btn btn-sm btn-outline" disabled={isLastAdmin} onClick={() => requestDelete(s)} title={isLastAdmin ? 'Cannot remove the last active admin' : 'Remove'}>Remove</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {staff.length === 0 && <p className="empty-state">No staff members yet.</p>}
    </div>
  );
}
