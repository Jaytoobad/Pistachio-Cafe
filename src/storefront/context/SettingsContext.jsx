import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BRAND, CONTACT } from '../config';
import { MOCK_SETTINGS } from '../data/mockData';

const DEFAULTS = {
  cafe_name: BRAND.name,
  tagline: BRAND.tagline,
  address: CONTACT.address,
  instagram: BRAND.instagram,
  phone: CONTACT.phone,
  whatsapp: CONTACT.whatsapp,
  email: CONTACT.email,
  is_open: true,
  accepting_orders: true,
  busy_minutes: 0,
  promo_banner: '',
  hours: {},
};

const SettingsContext = createContext({ settings: DEFAULTS, loading: false });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    let active = true;
    if (!supabase) return () => { active = false; };
    supabase
      .from('site_settings')
      .select('key,value')
      .then(({ data }) => {
        if (!active || !Array.isArray(data)) return;
        const merged = { ...DEFAULTS };
        for (const row of data) {
          if (!row || row.key == null) continue;
          const v = row.value;
          if (v === '' || v === null || v === undefined) continue;
          if (typeof v === 'string' && v.trim() === '') continue;
          merged[row.key] = v;
        }
        if (active) setSettings(merged);
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.warn('SettingsContext: keeping defaults:', err);
      });
    return () => { active = false; };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading: false }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
