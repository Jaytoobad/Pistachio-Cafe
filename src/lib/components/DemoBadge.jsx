import { isSupabaseConfigured } from '../supabase';

export default function DemoBadge() {
  if (import.meta.env.PROD) return null;
  if (!isSupabaseConfigured) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          zIndex: 1000,
          background: 'rgba(127,163,86,0.95)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
        aria-label="Demo mode active"
      >
        Demo mode
      </div>
    );
  }
  return null;
}
