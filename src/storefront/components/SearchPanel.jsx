import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { useDishes } from '../hooks/useDishes';
import { useMenus } from '../hooks/useMenus';
import { formatMoney } from '../../lib/format';
import { IMAGES } from '../config';
import SafeImg from './SafeImg';
import { CLOSE_SVG } from './SiteHeader';

export default function SearchPanel({ open, onClose }) {
  const { add } = useCart();
  const { showToast } = useToast();
  const { dishes } = useDishes();
  const { menus } = useMenus();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  const menuById = useMemo(
    () => new Map(menus.map((m) => [m.id, m.name])),
    [menus],
  );

  const menuNameForDish = useCallback(
    (dish) => {
      if (dish.menu_name) return dish.menu_name;
      if (dish.menu && dish.menu.name) return dish.menu.name;
      return menuById.get(dish.menu_id) || '';
    },
    [menuById],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  const results = useMemo(() => {
    const q = debounced.toLowerCase().trim();
    if (!q) return [];
    return dishes
      .filter((dish) => {
        const haystack = `${dish.name || ''} ${dish.description || ''} ${menuNameForDish(dish)}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 6);
  }, [debounced, dishes, menuNameForDish]);

  const addResult = useCallback(
    (dish) => {
      add({ id: dish.id, name: dish.name, price: dish.price, image_url: dish.image_url || null }, 1);
      showToast(`${dish.name} added to cart`);
    },
    [add, showToast],
  );

  if (!open) return null;

  const hasQuery = query.trim().length > 0;

  return (
    <div className="sf-search-overlay" onClick={onClose}>
      <div className="sf-search-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sf-search-close" onClick={onClose} aria-label="Close search">
          {CLOSE_SVG}
        </button>
        <form className="sf-search-form" onSubmit={(e) => e.preventDefault()}>
          <input
            ref={inputRef}
            autoFocus
            type="search"
            placeholder="Search dishes, descriptions\u2026"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
        <div className="sf-search-results">
          {!hasQuery && (
            <p className="sf-search-hint">Search for a dish by name or description</p>
          )}
          {results.length === 0 ? (
            <p className="sf-search-none">No dishes found</p>
          ) : (
            results.map((dish) => (
              <article key={dish.id} className="sf-search-result">
                <SafeImg
                  src={dish.image_url}
                  label={dish.name || 'Dish'}
                  className="sf-search-result-img"
                  alt={dish.name || 'Dish'}
                  loading="lazy"
                />
                <div className="sf-search-result-body">
                  <div className="sf-search-result-name">{dish.name}</div>
                  <div className="sf-search-result-price">{formatMoney(dish.price)}</div>
                </div>
                <button
                  type="button"
                  className="sf-search-result-add"
                  aria-label={`Add ${dish.name} to cart`}
                  onClick={() => addResult(dish)}
                >
                  +
                </button>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
