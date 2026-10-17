import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, fetchAvailableProducts } from '../services/products';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../lib/format';

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { add } = useCart();
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [cats, prods] = await Promise.all([fetchCategories(), fetchAvailableProducts()]);
      setCategories(cats);
      setProducts(prods);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = activeCat ? products.filter((p) => p.category_id === activeCat) : products;

  if (loading) {
    return (
      <div className="sf-container">
        <div className="sf-section">
          <div className="sf-section-head"><div><h2>Menu</h2></div></div>
          <div className="sf-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 280, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
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
            className={`sf-tab ${activeCat === null ? 'active' : ''}`}
            onClick={() => setActiveCat(null)}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`sf-tab ${activeCat === c.id ? 'active' : ''}`}
              onClick={() => setActiveCat(c.id)}
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
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={(product, qty) => {
                  add(product, qty);
                  showToast(`${product.name} added to cart`);
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}