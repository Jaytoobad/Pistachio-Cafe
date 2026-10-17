import React, { useEffect, useState } from 'react';
import { fetchMenu, fetchAvailableDishes } from '../services/dishes';
import DishCard from '../components/DishCard';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { formatMoney } from '../../lib/format';
import DishDetailModal from '../components/DishDetailModal';

export default function Menu() {
  const [menuSections, setMenuSections] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { add } = useCart();
  const { showToast } = useToast();

  

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [sections, items] = await Promise.all([fetchMenu(), fetchAvailableDishes()]);
      setCategories(sections);
      setProducts(items);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = activeSection ? dishes.filter((d) => d.menu_id === activeSection) : dishes;

      if (error) {
    return (
      <div className="sf-container">
        <div className="sf-section">
          <div className="sf-error" role="alert">
            <h3>Something went wrong</h3>
            <p>We couldn't load the menu. Please try again.</p>
            <button className="sf-btn sf-btn-primary" style={{ marginTop: 12 }} onClick={load}>Try again</button>
          </div>
        </div>
      </div>
    );
  }

if (loading) {
    return (
      <div className="sf-container">
        <div className="sf-section">
          <div className="sf-section-head"><div><h2>Menu</h2></div></div>
          <SkeletonGrid count={6} />
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
            className={`sf-tab ${activeSection === null ? 'active' : ''}`}
            onClick={() => setActiveSection(null)}
          >
            All
          </button>
          {menuSections.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`sf-tab ${activeSection === c.id ? 'active' : ''}`}
              onClick={() => setActiveSection(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="sf-empty">
            <h3>Nothing available right now</h3>
            <p>Check back soon ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â we restock the menu daily.</p>
          </div>
        ) : (
          <div className="sf-grid">
            {filtered.map((p) => (
              <DishCard
                key={p.id}
                dish={p}
                onAdd={(product, qty) => {
                  add(product, qty);
                  showToast(`${product.name} added to cart`);
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
        onAdd={(product, qty) => {
          add(product, qty);
          showToast(`${product.name} added to cart`);
        }}
      />
    </div>
  );
}

















