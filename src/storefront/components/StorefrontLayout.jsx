import React, { useEffect, useState } from 'react';

import { Link, Outlet } from 'react-router-dom';

import '../../styles/storefront.css';

import '../../styles/old-static.css';

import AnnouncementBar from './AnnouncementBar';

import SiteHeader from './SiteHeader';

import HamburgerDrawer from './HamburgerDrawer';

import SearchPanel from './SearchPanel';

import CartDrawer from './CartDrawer';

import FavouritesDrawer from './FavouritesDrawer';

import FloatingWhatsapp from './FloatingWhatsapp';

import { useCart } from '../context/CartContext';

import { useFavourites } from '../context/FavouritesContext';

import { BRAND, CONTACT, HAS_PHONE, HAS_WHATSAPP, HAS_EMAIL, IMAGES } from '../config';

import SafeImg from './SafeImg';


export default function StorefrontLayout() {

  const { count } = useCart();

  const { count: favCount } = useFavourites();

  const [menuOpen, setMenuOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);

  const [favOpen, setFavOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);


  useEffect(() => {

    const onScroll = () => setScrolled(window.scrollY > 0);

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);

  }, []);


  useEffect(() => {

    const onKey = (e) => {

      if (e.key !== 'Escape') return;

      if (searchOpen) { setSearchOpen(false); return; }

      if (cartOpen) { setCartOpen(false); return; }

      if (favOpen) { setFavOpen(false); return; }

      if (menuOpen) setMenuOpen(false);

    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);

  }, [searchOpen, cartOpen, favOpen, menuOpen]);


  useEffect(() => {

    document.body.style.overflow = menuOpen ? 'hidden' : '';

    return () => { document.body.style.overflow = ''; };

  }, [menuOpen]);


  const closeAll = () => {

    setMenuOpen(false);

    setSearchOpen(false);

    setCartOpen(false);

    setFavOpen(false);

  };


  return (

    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

      <a href="#main" className="skip-link">Skip to content</a>


      <AnnouncementBar />


      <SiteHeader

        menuOpen={menuOpen}

        scrolled={scrolled}

        onToggleMenu={() => setMenuOpen((v) => !v)}

        onToggleSearch={() => setSearchOpen((v) => !v)}

        onToggleFavourites={() => setFavOpen((v) => !v)}

        onToggleCart={() => setCartOpen((v) => !v)}

        cartCount={count}

        favCount={favCount}

      />


      <HamburgerDrawer open={menuOpen} onClose={closeAll} />

      <SearchPanel open={searchOpen} onClose={closeAll} />

      <CartDrawer open={cartOpen} onClose={closeAll} />

      <FavouritesDrawer open={favOpen} onClose={closeAll} />

      <FloatingWhatsapp />


      <main id="main" style={{ flex: 1 }}>

        <Outlet />

      </main>


      <footer className="site-footer" id="contact">

        <div className="container">

          <div className="footer-grid">

            <div>

              <SafeImg src={IMAGES.logo} label="Pistachio Café" alt="Pistachio Café" style={{ height: '32px', width: 'auto', marginBottom: '0.75rem' }} />

              <p>Handmade breakfast, brunch, and desserts in {BRAND.location}. Open every day.</p>

              <div className="social-row">

                <a href={BRAND.instagramUrl} aria-label="Instagram" target="_blank" rel="noopener noreferrer">

                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">

                    <rect x="2" y="2" width="20" height="20" rx="5"/>

                    <circle cx="12" cy="12" r="4"/>

                    <circle cx="17.5" cy="6.5" r="1"/>

                  </svg>

                </a>

                {HAS_WHATSAPP && CONTACT.whatsapp && String(CONTACT.whatsapp).replace(/\D/g,'') !== '233000000000' && !/^0+$/.test(String(CONTACT.whatsapp).replace(/\D/g,'')) && (

                  <a href={`https://wa.me/${CONTACT.whatsapp}`} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">

                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">

                      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.7 14.2c-.24.7-1.4 1.3-2 1.4-.5.1-1.2.2-3.6-.75-3-1.2-4.9-4.2-5-4.4-.15-.2-1.2-1.6-1.2-3.1 0-1.4.75-2.1 1-2.4 .25-.3.6-.35.8-.35h.55c.2 0 .45 0 .65.5 .24.6.8 2 .87 2.15 .07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.2-.3.4-.45.5-.15.15-.3.3-.13.6 .15.3.7 1.2 1.5 1.95 1.05 1 1.9 1.3 2.2 1.45 .3 .15 .5 .13 .68-.08 .2-.2 .75-.85 .95-1.15 .2-.3 .4-.25 .65-.15 .25.1 1.6 .75 1.9 .9 .3 .15 .5 .2 .55 .35 .07 .15 .07 .85-.17 1.55z"/>

                    </svg>

                  </a>

                )}

              </div>

            </div>

            <div>

              <h4>Explore</h4>

              <ul className="footer-links">

                <li><Link to="/menu">Full menu</Link></li>

                <li><Link to="/about">Our story</Link></li>

                <li><Link to="/cart">Your cart</Link></li>

                <li><Link to="/track">Track an order</Link></li>

              </ul>

            </div>

            <div>

              <h4>Visit</h4>

              <ul className="footer-links">

                <li>{CONTACT.address}</li>

                {HAS_PHONE && CONTACT.phone && String(CONTACT.phone).replace(/\D/g,'') !== '233000000000' && !/^0+$/.test(String(CONTACT.phone).replace(/\D/g,'')) && <li><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></li>}

                {HAS_WHATSAPP && CONTACT.whatsapp && String(CONTACT.whatsapp).replace(/\D/g,'') !== '233000000000' && !/^0+$/.test(String(CONTACT.whatsapp).replace(/\D/g,'')) && <li><a href={`https://wa.me/${CONTACT.whatsapp}`}>WhatsApp</a></li>}

                {HAS_EMAIL && CONTACT.email && CONTACT.email !== 'hello@pistachio.cafe' && <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>}

                <li>Mon\u2013Fri 8AM\u201311PM \u00b7 Sat\u2013Sun 8AM\u201312AM</li>

              </ul>

            </div>

            <div>

              <h4>Stay in the loop</h4>

              <p>New seasonal dishes, first \u2026 straight to your inbox.</p>

              <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); }}>

                <input type="email" placeholder="you@email.com" required />

                <button type="submit">Join</button>

              </form>

            </div>

          </div>

          <div className="footer-bottom" style={{flexDirection:"column", alignItems:"center", textAlign:"center", gap:"8px"}}>

            <div style={{display:"flex", flexWrap:"wrap", gap:"12px", alignItems:"center", justifyContent:"center"}}>

              <span>© 2026 Pistachio Café. All rights reserved.</span>

              <a href="/privacy">Privacy</a>

              <a href="/terms">Terms</a>

              <a href="/delivery-info">Delivery info</a>

            </div>

            <span>Made with care, one plate at a time.</span>

          </div>

        </div>

      </footer>

    </div>

  );

}
