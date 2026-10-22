import { useCallback, useEffect, useState } from 'react';
import { fetchDishes, fetchMenus, setDishAvailable, saveMenu } from '../services/admin';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import { AdminErrorState } from '../components/States';
import Icon from '../components/Icon';

export default function EightySix() {
  const [dishes, setDishes] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(new Set());
  const [hideMenuId, setHideMenuId] = useState(null);
  const [hideSaving, setHideSaving] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const [d, m] = await Promise.all([fetchDishes(), fetchMenus()]);
      setDishes(d || []);
      setMenus(m || []);
    } catch { setLoadError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const term = search.toLowerCase();
  const filtered = dishes.filter((d) => d.name.toLowerCase().includes(term));

  const handleToggle = async (dish) => {
    setSaving((s) => new Set([...s, dish.id]));
    try {
      await setDishAvailable(dish.id, !dish.is_available);
      setDishes(dishes.map((d) => d.id === dish.id ? { ...d, is_available: !d.is_available } : d));
      showToast(`${dish.name} ${!dish.is_available ? 'returned' : '86\'d'}`);
    } catch (err) { showToast(err?.message || 'Could not update availability.', 'error'); }
    finally { setSaving((s) => { const n = new Set(s); n.delete(dish.id); return n; }); }
  };

  const handleHideMenu = async (menuId) => {
    const menu = menus.find((m) => m.id === menuId);
    if (!menu) return;
    setHideSaving(true);
    try {
      await saveMenu({ ...menu, is_visible: false }, menuId);
      showToast(`Menu "${menu.name}" hidden`);
      setHideMenuId(null);
    } catch (err) { showToast(err?.message || 'Could not hide menu.', 'error'); }
    finally { setHideSaving(false); }
  };

  if (loading) return <PageLoader />;
  if (loadError) return (
    <div className="page page-shell"><div className="page-header"><h1>86 list</h1></div>
      <AdminErrorState message="Could not load dishes." onRetry={load} /></div>
  );

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>86 list</h1>
          <p className="page-sub">Toggle dish availability in one tap</p>
        </div>
        <input type="text" placeholder="Search dishes" value={search} onChange={(e) => setSearch(e.target.value)} className="field-input" style={{ width: 260 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
        {filtered.map((d) => (
          <div key={d.id} className={`eighty-six-card ${!d.is_available ? 'unavailable' : ''}`}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}><span>{d.name}</span><span>{!d.is_available ? '86\'d' : 'Available'}</span></div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{d.is_available ? 'Tap to 86' : 'Tap to restore'}</div>
            </div>
            <div className="eighty-six-toggle" onClick={() => handleToggle(d)} aria-pressed={!d.is_available} />
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: 20 }}>No dishes match.</div>}
      </div>

      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 16, background: '#fff' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Bulk hide a menu section</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>Hiding a menu removes all its dishes from the storefront.</p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={hideMenuId || ''} onChange={(e) => setHideMenuId(e.target.value || null)} className="field-input" style={{ minWidth: 200 }}>
            <option value="">&mdash; Select menu &mdash;</option>
            {menus.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button className="btn btn-danger btn-sm" onClick={() => handleHideMenu(hideMenuId)} disabled={!hideMenuId || hideSaving}>{hideSaving ? 'Hiding\u2026' : 'Hide menu'}</button>
        </div>
      </div>
    </div>
  );
}

