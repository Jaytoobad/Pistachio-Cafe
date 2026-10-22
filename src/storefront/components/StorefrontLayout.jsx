import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import AnnouncementBar from './AnnouncementBar';
import SiteHeader from './SiteHeader';
import HamburgerDrawer from './HamburgerDrawer';
import CartDrawer from './CartDrawer';
import FloatingWhatsapp from './FloatingWhatsapp';
import SiteFooter from './SiteFooter';

import { useCart } from '../context/CartContext';

export default function StorefrontLayout() {
  const { count } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (cartOpen) setCartOpen(false);
      else if (menuOpen) setMenuOpen(false);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cartOpen, menuOpen]);

  const closeAll = () => {
    setMenuOpen(false);
    setCartOpen(false);
  };

  return (
    <div className="sf-root">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <AnnouncementBar />

      <SiteHeader
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((value) => !value)}
        onToggleCart={() => setCartOpen((value) => !value)}
        cartCount={count}
      />

      <HamburgerDrawer open={menuOpen} onClose={closeAll} />
      <CartDrawer open={cartOpen} onClose={closeAll} />

      <FloatingWhatsapp />

      <main id="main" className="site-main">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
