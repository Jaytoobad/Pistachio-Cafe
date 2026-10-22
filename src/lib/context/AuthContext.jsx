import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMembership(u) {
    if (!u) { setMembership(null); return; }
    try {
      const { data } = await supabase.from('staff').select('user_id, role, is_active').eq('user_id', u.id).maybeSingle();
      setMembership(data || null);
    } catch {
      setMembership(null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadMembership(session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadMembership(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const isStaff = Boolean(membership);
  const isAdmin = Boolean(membership && membership.role === 'admin' && membership.is_active !== false);

  return (
    <AuthContext.Provider value={{ user, membership, isStaff, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
