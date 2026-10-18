import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CART_KEY = 'pi_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((product, qty = 1, extras = [], notes = '') => {
    setItems((cur) => {
      const existing = cur.find((i) => i.dish_id === product.id);
      if (existing) {
        return cur.map((i) =>
          i.dish_id === product.id ? { ...i, qty: i.qty + qty, extras: extras || i.extras, notes: notes || i.notes } : i,
        );
      }
      return [
        ...cur,
        {
          dish_id: product.id,
          qty,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url || null,
          extras: extras || [],
          notes: notes || '',
        },
      ];
    });
  }, []);

  const updateQty = useCallback((dish_id, qty) => {
    setItems((cur) =>
      cur
        .map((i) => (i.dish_id === dish_id ? { ...i, qty: Math.max(1, qty) } : i))
        .filter((i) => i.qty > 0),
    );
  }, []);

  const remove = useCallback((dish_id) => {
    setItems((cur) => cur.filter((i) => i.dish_id !== dish_id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.price) * Number(i.qty), 0),
    [items],
  );

  const count = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.qty), 0),
    [items],
  );

  return (
    <CartContext.Provider value={{ items, add, updateQty, remove, clear, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}