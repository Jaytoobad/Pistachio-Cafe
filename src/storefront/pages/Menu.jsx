import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../../lib/hooks/useDocumentTitle';
import { fetchMenu, fetchAvailableDishes } from '../services/dishes.index';
import DishCard from '../components/DishCard';
import DishModal from '../components/DishModal';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { formatMoney } from '../../lib/format';
import { SkeletonGrid } from '../../lib/components/Skeleton';

export default function Menu() {
  const [menus, setMenus] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { add, count, subtotal } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  useDocumentTitle('Menu | Pistachio Café');

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [sections, items] = await Promise.all([fetchMenu(), fetchAvailableDishes()]);
      setMenus(sections);
      setDishes(items);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = activeMenu ? dishes.filter((d) => d.menu_id === activeMenu) : dishes;

  if (loading) {
    return (
      <div className="sf-container">
        <div className="sf-section">
          <div className="sf-section-head"><div><h2>Menu</h2></div></div>
          <Skeleton count={6} />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="sf-container">
        <div className="sf-section">
          <div className="sf-error">Could not load the menu. <button className="sf-btn sf-btn-primary" style={{ marginTop: 12 }} onClick={load}>Try again</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="sf-container">
      <section className="sf-section">
        <div className="sf-section-head">
          <div>
            <h2>Our menu</h2>
            <p>Available for pickup and delivery today.</p>
          </div>
        </div>

        <div className="sf-tabs" role="tablist">
          <button
            type="button"
            className={`sf-tab ${activeMenu === null ? 'active' : ''}`}
            onClick={() => setActiveMenu(null)}
          >
            All
          </button>
          {menus.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`sf-tab ${activeMenu === c.id ? 'active' : ''}`}
              onClick={() => setActiveMenu(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="sf-empty">
            <h3>Nothing available right now</h3>
            <p>Check back soon — we restock the menu daily.</p>
          </div>
        ) : (
          <div className="sf-grid">
            {filtered.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onAdd={(dish, qty) => {
                  add(dish, qty);
                  showToast(`${dish.name} added to cart`);
                }}
                onQuickView={(dish) => {
                  setSelectedDish(dish);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {count > 0 && (
        <div className="sf-sticky-cart-bar">
          <div className="sf-sticky-info">
            <span className="sf-sticky-items">{count} item{count === 1 ? '' : 's'} in cart</span>
            <span className="sf-sticky-total">{formatMoney(subtotal)}</span>
          </div>
          <button
            type="button"
            className="sf-btn sf-btn-primary"
            onClick={() => navigate('/cart')}
          >
            View cart
          </button>
        </div>
      )}

      <DishModal
        dish={selectedDish}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(dish, qty) => {
          add(dish, qty);
          showToast(`${dish.name} added to cart`);
        }}
      />
    </div>
  );
}