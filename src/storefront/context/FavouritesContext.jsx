import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const FAV_KEY = 'pi_favs';

function loadFavs() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

const FavouritesContext = createContext(null);

export function FavouritesProvider({ children }) {
  const [favs, setFavs] = useState(loadFavs);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  }, [favs]);

  const toggle = useCallback((id) => {
    setFavs((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }, []);

  const isFav = useCallback((id) => favs.includes(id), [favs]);

  return (
    <FavouritesContext.Provider value={{ favs, toggle, isFav, count: favs.length }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider');
  return ctx;
}
