import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../../lib/context/ToastContext';
import { PRODUCTS, findProduct, formatMoney, CATEGORIES } from '../data/products';
import '../old-static.css';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Brunch', value: 'brunch' },
  { label: 'Dessert', value: 'dessert' },
];

function capitalize(s){
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeAttr(s){
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export default function Menu() {
  const { add } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [activeFilter, setActiveFilter] = useState(category);
  const productGridRef = useRef(null);

  const renderProducts = useCallback((cat) => {
    const grid = productGridRef.current;
    if (!grid) return;
    const items = cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
    if (items.length === 0) {
      grid.innerHTML = '<p>No items in this category yet — check back soon.</p>';
      return;
    }
    grid.innerHTML = items.map(p => `
      <article class="old-product-card">
        <div class="old-product-card-media">
          <span class="old-product-tag">${capitalize(p.category)}</span>
          <img src="${p.image}" alt="${escapeAttr(p.name)}" loading="lazy"
            onerror="this.closest('.old-product-card-media').style.display='flex';this.closest('.old-product-card-media').style.alignItems='center';this.closest('.old-product-card-media').style.justifyContent='center';this.replaceWith(Object.assign(document.createElement('span'),{textContent:'Add photo: ${escapeAttr(p.image)}',style:'font-size:0.75rem;color:#8b8570;padding:0 1rem;text-align:center'}))">
        </div>
        <div class="old-product-card-body">
          <h3>${escapeAttr(p.name)}</h3>
          <p>${escapeAttr(p.desc)}</p>
          <div class="old-product-card-foot">
            <span class="old-price">${formatMoney(p.price)}</span>
            <button class="old-add-btn" data-add="${p.id}">Add to cart</button>
          </div>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('[data-add]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.add;
        add(findProduct(id), 1);
        const original = btn.textContent;
        btn.textContent = 'Added ✓';
        btn.classList.add('is-added');
        const product = findProduct(id);
        if (product) showToast(`${product.name} added to cart`);
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('is-added');
        }, 1200);
      });
    });
  }, [add, showToast]);

  useEffect(() => {
    renderProducts(category);
  }, [category, renderProducts]);

  const handleFilter = (value) => {
    setActiveFilter(value);
    setCategory(value);
    navigate(`?category=${value === 'all' ? '' : value}`, { replace: true });
  };

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
                  onClick={() => handleFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="old-card-grid" data-product-grid ref={productGridRef}>
              {category === 'all' ? PRODUCTS.map(p => (
                <article key={p.id} className="old-product-card">
                  <div className="old-product-card-media">
                    <span className="old-product-tag">{capitalize(p.category)}</span>
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        const media = e.currentTarget.closest('.old-product-card-media');
                        if (media) {
                          media.style.display = 'flex';
                          media.style.alignItems = 'center';
                          media.style.justifyContent = 'center';
                          const span = document.createElement('span');
                          span.textContent = 'Add photo: ' + p.image;
                          span.style.fontSize = '0.75rem';
                          span.style.color = '#8b8570';
                          span.style.padding = '0 1rem';
                          span.style.textAlign = 'center';
                          e.currentTarget.replaceWith(span);
                        }
                      }}
                    />
                  </div>
                  <div className="old-product-card-body">
                    <h3>{p.name}</h3>
                    <p>{p.desc}</p>
                    <div className="old-product-card-foot">
                      <span className="old-price">{formatMoney(p.price)}</span>
                      <button
                        className="old-add-btn"
                        onClick={() => {
                          add(p, 1);
                          showToast(`${p.name} added to cart`);
                        }}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              )) : PRODUCTS.filter(p => p.category === category).map(p => (
                <article key={p.id} className="old-product-card">
                  <div className="old-product-card-media">
                    <span className="old-product-tag">{capitalize(p.category)}</span>
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        const media = e.currentTarget.closest('.old-product-card-media');
                        if (media) {
                          media.style.display = 'flex';
                          media.style.alignItems = 'center';
                          media.style.justifyContent = 'center';
                          const span = document.createElement('span');
                          span.textContent = 'Add photo: ' + p.image;
                          span.style.fontSize = '0.75rem';
                          span.style.color = '#8b8570';
                          span.style.padding = '0 1rem';
                          span.style.textAlign = 'center';
                          e.currentTarget.replaceWith(span);
                        }
                      }}
                    />
                  </div>
                  <div className="old-product-card-body">
                    <h3>{p.name}</h3>
                    <p>{p.desc}</p>
                    <div className="old-product-card-foot">
                      <span className="old-price">{formatMoney(p.price)}</span>
                      <button
                        className="old-add-btn"
                        onClick={() => {
                          add(p, 1);
                          showToast(`${p.name} added to cart`);
                        }}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}