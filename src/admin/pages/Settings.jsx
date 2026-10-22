import { useCallback, useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../services/admin';
import { formatMoney } from '../../lib/format';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import { AdminErrorState } from '../components/States';
import Icon from '../components/Icon';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try { setSettings(await fetchSettings()); setDirty(false); }
    catch { setError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const quickFields = [
    { key: 'accepting_orders', label: 'Accepting online orders', type: 'checkbox' },
    { key: 'busy_minutes', label: 'Busy minutes (added to ETA)', type: 'number' },
    { key: 'is_open', label: 'Open / closed override', type: 'checkbox' },
  ];

  const generalFields = [
    { key: 'delivery_enabled', label: 'Delivery enabled', type: 'checkbox' },
    { key: 'delivery_fee', label: 'Delivery fee', type: 'number', prefix: 'GH\u20b5' },
    { key: 'contact_phone', label: 'Contact phone', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'cafe_name', label: 'Caf&eacute; name', type: 'text' },
  ];

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = {};
      [...quickFields, ...generalFields].forEach((f) => {
        const v = settings[f.key];
        if (f.type === 'checkbox') payload[f.key] = v === true;
        else if (f.type === 'number') payload[f.key] = v == null || v === '' ? '' : Number(v);
        else payload[f.key] = v == null ? '' : v;
      });
      await updateSettings(payload);
      showToast('Settings saved');
      setDirty(false);
    } catch (err) { showToast(err?.message || 'Could not save settings.', 'error'); } finally { setSaving(false); }
  }

  if (loading) return <PageLoader />;
  if (error || !settings) return (
    <div className="page page-shell"><div className="page-header"><h1>Settings</h1></div>
      <AdminErrorState message="Could not load settings." onRetry={load} /></div>
  );

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-sub">Shop settings and trading controls</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || !dirty}>{saving ? 'Saving&hellip;' : 'Save changes'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Quick controls</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quickFields.map((f) => (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-ink)' }}>{f.label}</label>
                {f.type === 'checkbox' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={settings[f.key] === true} onChange={(e) => { setSettings({ ...settings, [f.key]: e.target.checked }); setDirty(true); }} />
                  </div>
                ) : (
                  <input type="number" value={settings[f.key] == null ? '' : settings[f.key]} onChange={(e) => { setSettings({ ...settings, [f.key]: e.target.value }); setDirty(true); }} className="field-input" />
                )}
              </div>
            ))}
          </form>
        </div>
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>General settings</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
            {generalFields.map((f) => (
              <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label>{f.label}</label>
                {f.type === 'checkbox' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" checked={settings[f.key] === true} onChange={(e) => { setSettings({ ...settings, [f.key]: e.target.checked }); setDirty(true); }} />
                  </div>
                ) : f.type === 'number' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span>{f.prefix}</span><input type="number" value={settings[f.key] == null ? '' : settings[f.key]} onChange={(e) => { setSettings({ ...settings, [f.key]: e.target.value }); setDirty(true); }} style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} /></div>
                ) : (
                  <input type={f.type} value={settings[f.key] || ''} onChange={(e) => { setSettings({ ...settings, [f.key]: e.target.value }); setDirty(true); }} className="field-input" />
                )}
              </div>
            ))}
          </form>
        </div>
      </div>
      {dirty && <p className="empty-state" style={{ color: 'var(--color-accent)' }}>Unsaved changes.</p>}
    </div>
  );
}

