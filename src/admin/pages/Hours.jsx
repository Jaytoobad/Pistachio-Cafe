import { useCallback, useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '../services/admin';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import { AdminErrorState } from '../components/States';
import Icon from '../components/Icon';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

export default function Hours() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const s = await fetchSettings();
      setSettings(s);
    } catch { setError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getHours = (day) => {
    const h = settings.hours;
    if (!h || typeof h !== 'object') return { open: '08:00', close: '23:00', closed: false };
    const d = h[day];
    if (!d) return { open: '08:00', close: '23:00', closed: false };
    return { open: d.open || '08:00', close: d.close || '23:00', closed: !!d.closed };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const hours = {};
      DAYS.forEach((day) => {
        hours[day] = { open: document.getElementById(`open-${day}`).value, close: document.getElementById(`close-${day}`).value, closed: document.getElementById(`closed-${day}`).checked };
      });
      await updateSettings({ hours, promo_banner: settings.promo_banner || '' });
      showToast('Hours saved');
      setDirty(false);
    } catch (err) { showToast(err?.message || 'Could not save hours.', 'error'); } finally { setSaving(false); }
  };

  const saveBanner = async () => {
    try {
      await updateSettings({ promo_banner: settings.promo_banner || '' });
      showToast('Banner saved');
      setDirty(false);
    } catch (err) { showToast(err?.message || 'Could not save banner.', 'error'); }
  };

  // Preview: compute open now
  const now = new Date();
  const accraDay = DAYS[now.getUTCDay()]; // approximate; Accra is UTC+0 so UTC day = local day
  const current = getHours(accraDay);
  const isOpenPreview = !current.closed;

  if (loading) return <PageLoader />;
  if (error) return (
    <div className="page page-shell"><div className="page-header"><h1>Opening hours</h1></div>
      <AdminErrorState message="Could not load settings." onRetry={load} /></div>
  );

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>Opening hours</h1>
          <p className="page-sub">Weekly hours and announcement banner</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || !dirty}>{saving ? 'Saving&hellip;' : 'Save changes'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Weekly opening hours</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            {DAYS.map((day) => {
              const h = getHours(day);
              return (
                <div key={day} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 10, background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{DAY_LABELS[day]}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" id={`closed-${day}`} checked={h.closed} onChange={() => setDirty(true)} />
                      <label style={{ margin: 0, fontSize: '0.8rem' }} htmlFor={`closed-${day}`}>Closed</label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input id={`open-${day}`} type="time" value={h.open} onChange={() => setDirty(true)} disabled={h.closed} className="field-input" style={{ flex: 1 }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>to</span>
                    <input id={`close-${day}`} type="time" value={h.close} onChange={() => setDirty(true)} disabled={h.closed} className="field-input" style={{ flex: 1 }} />
                  </div>
                </div>
              );
            })}
          </form>
        </div>
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Announcement banner</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={settings.promo_banner || ''} onChange={(e) => { setSettings({ ...settings, promo_banner: e.target.value }); setDirty(true); }} className="field-input" placeholder="e.g. Fresh waffles every weekend!" />
            <button className="btn btn-outline" onClick={saveBanner} disabled={saving || !dirty}>Save banner</button>
            <div style={{ marginTop: 14, padding: 12, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#F5F2EB', color: '#1A1A1A', fontWeight: 600 }}>
              {settings.promo_banner || '(banner preview)'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 14, background: '#fff' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Storefront preview (today)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
          <span style={{ fontWeight: 600 }}>{isOpenPreview ? 'Open now' : 'Closed'}</span>
          <span style={{ color: 'var(--color-text-muted)' }}>{accraDay} {current.open} â€“ {current.close}</span>
        </div>
      </div>
    </div>
  );
}

