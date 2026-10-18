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

  const filtered = dishes;

  return (
    <div className="old-container min-h-dvh px-4 py-6">
      <main id="main">
        <section className="old-page-hero page-hero">
          <div className="old-container">
            <p className="old-page-hero-eyebrow page-hero-eyebrow text-muted">The full spread</p>
            <h1 className="page-hero-title text-charcoal font-serif">Breakfast, brunch &amp; dessert</h1>
            <p className="page-hero-desc text-muted">Everything's made fresh in-house. Add whatever catches your eye — you can review your order before you pay.</p>
          </div>
        </section>

        <section className="old-section py-6">
          <div className="old-container">
            <div className="old-filter-row">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  className="old-filter-pill filter-pill"
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
            <div className="grid-cols-2" data-menu-grid>
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
                <p className="text-muted text-sm" style={{ gridColumn: '1 / -1', textAlign: 'center', width: '100%' }}>
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
