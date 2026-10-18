import { useCallback, useEffect, useState } from 'react';
import { fetchStaff, addStaff, removeStaff } from '../services/admin';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import ConfirmDialog from '../../lib/components/ConfirmDialog';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
];

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState('staff');
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setStaff(await fetchStaff());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newUserId || adding) return;
    setAdding(true);
    try {
      await addStaff(newUserId, newRole);
      showToast('Staff member added');
      setNewUserId('');
      setNewRole('staff');
      load();
    } catch (err) {
      showToast(err?.message || 'Could not add staff member.', 'error');
    } finally {
      setAdding(false);
    }
  }

  function requestDelete(s) { setDeleteTarget(s); }
  async function doDelete() {
    if (!deleteTarget) return;
    try {
      await removeStaff(deleteTarget.id);
      showToast('Staff member removed');
      setStaff(staff.filter((x) => x.id !== deleteTarget.id));
    } catch (err) {
      showToast(err?.message || 'Could not remove staff member.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <div className="page">
        <div className="page-header"><h1>Staff</h1></div>
        <p className="empty-state">Could not load staff. <button className="btn btn-outline" onClick={load}>Try again</button></p>
      </div>
    );
  }

  return (
    <div className="page staff-page">
      <div className="page-header">
        <div>
          <h1>Staff</h1>
          <p className="page-sub">Admin access allowlist</p>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove staff member?"
        message={deleteTarget ? 'Remove this staff member&rsquo;s admin access? They will no longer be able to sign in.' : 'Remove staff member?'}
        confirmLabel="Remove"
        cancelLabel="Keep"
        onConfirm={doDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-muted)' }}>Supabase Auth user ID</label>
          <input
            required
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            style={{ flex: 1, minWidth: 260, padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
          >
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <button type="submit" className="btn btn-primary" disabled={adding}>{adding ? 'Adding&hellip;' : 'Add staff'}</button>
        </form>
        <p className="form-hint">Add a staff row for each Supabase Auth account that should have admin access. Create the account first at /admin/login, then add its user ID here.</p>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>User ID</th><th>Role</th><th>Active</th><th>Added</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td className="cell-muted" style={{ fontSize: '0.85rem' }}>{s.user_id}</td>
                <td className="cell-muted">{s.role || 'staff'}</td>
                <td>{s.is_active ? '✓' : '—'}</td>
                <td className="cell-muted">{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                <td className="table-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => requestDelete(s)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {staff.length === 0 && <p className="empty-state">No staff members yet.</p>}
    </div>
  );
}
