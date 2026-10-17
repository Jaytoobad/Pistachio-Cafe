import { useCallback, useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../../services/admin';
import { formatMoney } from '../../lib/format';
import { useToast } from '../../context/ToastContext';
import PageLoader from '../../components/PageLoader';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setSettings(await fetchSettings());
      setDirty(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fields = [
    { key: 'is_accepting_orders', label: 'Accepting orders', type: 'checkbox' },
    { key: 'delivery_enabled', label: 'Delivery enabled', type: 'checkbox' },
    { key: 'delivery_fee', label: 'Delivery fee', type: 'number', prefix: '₵' },
    { key: 'weekday_open', label: 'Weekday open', type: 'time' },
    { key: 'weekday_close', label: 'Weekday close', type: 'time' },
    { key: 'weekend_open', label: 'Weekend open', type: 'time' },
    { key: 'weekend_close', label: 'Weekend close', type: 'time' },
    { key: 'contact_phone', label: 'Contact phone', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'announcement_banner', label: 'Announcement banner', type: 'text' },
  ];

  async function handleSave(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = {};
      fields.forEach((f) => {
        if (f.type === 'checkbox') payload[f.key] = settings[f.key] === true;
        else payload[f.key] = settings[f.key] === undefined || settings[f.key] === null ? '' : settings[f.key];
      });
      await updateSettings(payload);
      showToast('Settings saved');
      setDirty(false);
    } catch (err) {
      showToast(err?.message || 'Could not save settings.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader />;
  if (error || !settings) {
    return (
      <div className="page">
        <div className="page-header"><h1>Settings</h1></div>
        <p className="empty-state">Could not load settings. <button className="btn btn-outline" onClick={load}>Try again</button></p>
      </div>
    );
  }

  return (
    <div className="page settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-sub">Shop settings and trading hours</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || !dirty}>{saving ? 'Saving&hellip;' : 'Save changes'}</button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {fields.map((f) => (
          <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label>{f.label}</label>
            {f.type === 'checkbox'
              ? <input type="checkbox" checked={settings[f.key] === true} onChange={(e) => { setSettings({ ...settings, [f.key]: e.target.checked }); setDirty(true); } } />
              : f.type === 'number'
                ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span>{f.prefix}</span><input type="number" value={settings[f.key] === '' ? '' : settings[f.key]} onChange={(e) => { setSettings({ ...settings, [f.key]: e.target.value }); setDirty(true); } } style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} /></div>
                : <input type={f.type} value={settings[f.key] || ''} onChange={(e) => { setSettings({ ...settings, [f.key]: e.target.value }); setDirty(true); } } style={{ padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />}
          </div>
        ))}
      </form>
      {dirty && <p className="empty-state" style={{ color: 'var(--color-accent)' }}>Unsaved changes.</p>}
    </div>
  );
}
