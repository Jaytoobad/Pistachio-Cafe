import { lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './lib/components/ErrorBoundary';
import { AuthProvider } from './lib/context/AuthContext';
import { ToastProvider } from './lib/context/ToastContext';
import { CartProvider } from './storefront/context/CartContext';
import { FavouritesProvider } from './storefront/context/FavouritesContext';
import { SettingsProvider } from './storefront/context/SettingsContext';
import PageLoader from './lib/components/PageLoader';
import ProtectedAdminRoute from './lib/components/ProtectedAdminRoute';
import StorefrontLayout from './storefront/components/StorefrontLayout';

// Admin
const AdminLogin = lazy(() => import('./admin/pages/Login'));
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'));
const AdminToday = lazy(() => import('./admin/pages/Today'));
const AdminOrders = lazy(() => import('./admin/pages/Orders'));
const AdminOrderDetail = lazy(() => import('./admin/pages/OrderDetail'));
const AdminMenuSections = lazy(() => import('./admin/pages/MenuSections'));
const AdminDishes = lazy(() => import('./admin/pages/Dishes'));
const AdminAddOns = lazy(() => import('./admin/pages/AddOns'));
const AdminRiders = lazy(() => import('./admin/pages/Riders'));
const AdminZones = lazy(() => import('./admin/pages/Zones'));
const AdminCustomers = lazy(() => import('./admin/pages/Customers'));
const AdminReviews = lazy(() => import('./admin/pages/Reviews'));
const AdminSubscribers = lazy(() => import('./admin/pages/Subscribers'));
const AdminSettings = lazy(() => import('./admin/pages/Settings'));
const AdminStaff = lazy(() => import('./admin/pages/Staff'));
const AdminHours = lazy(() => import('./admin/pages/Hours'));
const AdminReport = lazy(() => import('./admin/pages/Report'));
const AdminEightySix = lazy(() => import('./admin/pages/EightySix'));

// Storefront (customer-facing)
const StoreHome = lazy(() => import('./storefront/pages/Home'));
const StoreMenu = lazy(() => import('./storefront/pages/Menu'));
const StoreCart = lazy(() => import('./storefront/pages/Cart'));
const StoreCheckout = lazy(() => import('./storefront/pages/Checkout'));
const StoreTrack = lazy(() => import('./storefront/pages/Track'));
const StoreVisit = lazy(() => import('./storefront/pages/Visit'));
const StoreGallery = lazy(() => import('./storefront/pages/Gallery'));
const StoreReviews = lazy(() => import('./storefront/pages/Reviews'));
const StoreContact = lazy(() => import('./storefront/pages/Contact'));
const StoreNotFound = lazy(() => import('./storefront/pages/NotFound'));
const StoreAbout = lazy(() => import('./storefront/pages/About'));

export default function App() {
  const location = useLocation();

  const from = useCallback(() => {
    const fromState = location.state?.from;
    return fromState || { pathname: '/' };
  }, [location]);

return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Suspense fallback={<PageLoader />}>
            <ErrorBoundary>
              <Routes>
                {/* Admin routes — unchanged */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <AdminLayout />
                    </ProtectedAdminRoute>
                  }
                >
                  <Route index element={<AdminToday />} />
                  <Route path="today" element={<Navigate to="/admin" replace />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrderDetail />} />
                  <Route path="menu" element={<AdminMenuSections />} />
                  <Route path="dishes" element={<AdminDishes />} />
                  <Route path="addons" element={<AdminAddOns />} />
                  <Route path="riders" element={<AdminRiders />} />
                  <Route path="zones" element={<AdminZones />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="subscribers" element={<AdminSubscribers />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="staff" element={<AdminStaff />} />
                  <Route path="hours" element={<AdminHours />} />
                  <Route path="report" element={<AdminReport />} />
                  <Route path="86" element={<AdminEightySix />} />
                  <Route path="*" element={
                    <ProtectedAdminRoute>
                      <Navigate to="/admin" replace />
                    </ProtectedAdminRoute>
                  } />
                </Route>

                {/* Storefront routes inside the shared storefront layout */}
                <Route element={<SettingsProvider><FavouritesProvider><StorefrontLayout /></FavouritesProvider></SettingsProvider>}>
                  <Route index element={<StoreHome />} />
                  <Route path="menu" element={<StoreMenu />} />
                  <Route path="cart" element={<StoreCart />} />
                  <Route path="checkout" element={<StoreCheckout />} />
                  <Route path="track" element={<StoreTrack />} />
                  <Route path="track/:code" element={<StoreTrack />} />
                  <Route path="about" element={<StoreAbout />} />
                  <Route path="visit" element={<StoreVisit />} />
                  <Route path="gallery" element={<StoreGallery />} />
                  <Route path="reviews" element={<StoreReviews />} />
                  <Route path="contact" element={<StoreContact />} />
                  <Route path="*" element={<StoreNotFound />} />
                </Route>
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}




