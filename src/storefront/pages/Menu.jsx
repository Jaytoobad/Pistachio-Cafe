import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { useDishes } from '../hooks/useDishes';
import { useMenus } from '../hooks/useMenus';
import { formatMoney } from '../../lib/format';
import { IMAGES } from '../config';
import DishCard from '../components/DishCard';
import DishDetailModal from '../components/DishDetailModal';
import '../../styles/storefront.css';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Brunch', value: 'brunch' },
  { label: 'Desserts', value: 'desserts' },
  { label: 'Shisha Combos', value: 'combos' },
];

function menuNameForDish(dish, menus) {
  if (dish.menu_name) return dish.menu_name;
  if (dish.menu && dish.menu.name) return dish.menu.name;
  const m = menus.find((x) => x.id === dish.menu_id);
  return m ? m.name : '';
}

export default function Menu() {
  const { add } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [activeFilter, setActiveFilter] = useState(category);
  const [quickView, setQuickView] = useState(null);

  const { dishes, loading } = useDishes(category !== 'all' ? category : null);
  const { menus } = useMenus();

  // Mock-first: dishes render immediately; never return null while loading.
  // useDishes already filters by menu_id when a category slug is passed.
  const filtered = dishes;

  return (
    <div className="old-container">
      <main id="main">
        <section className="old-page-hero">
          <div className="old-container">
            <p className="old-page-hero-eyebrow">The full spread</p>
            <h1>Breakfast, brunch &amp; dessert</h1>
            <p>Everything's made fresh in-house. Add whatever catches your eye — you can review your order before you pay.</p>
          </div>
        </section>

        <section className="old-section">
          <div className="old-container">
            <div className="old-filter-row">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  className="old-filter-pill"
                  aria-pressed={activeFilter === f.value}
                  onClick={() => {
                    setActiveFilter(f.value);
                    setCategory(f.value);
                    navigate(`?category=${f.value === 'all' ? '' : f.value}`, { replace: true });
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="old-card-grid">
              {filtered.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onAdd={(d, qty) => {
                    add({ id: d.id, name: d.name, price: d.price, image_url: d.image_url || null }, qty);
                    showToast(`${d.name} added to cart`);
                  }}
                  onQuickView={setQuickView}
                />
              ))}
              {filtered.length === 0 && (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', width: '100%' }}>
                  No items in this category yet — check back soon.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      {quickView && (
        <DishDetailModal
          open={!!quickView}
          dish={quickView}
          menuName={menuNameForDish(quickView, menus)}
          onClose={() => setQuickView(null)}
          onAdd={(d, qty) => {
            add({ id: d.id, name: d.name, price: d.price, image_url: d.image_url || null }, qty);
            showToast(`${d.name} added to cart`);
          }}
        />
      )}
    </div>
  );
}