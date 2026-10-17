import { lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PageLoader from './components/PageLoader';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

const AdminLogin = lazy(() => import('./admin/pages/Login'));
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'));
const AdminOrders = lazy(() => import('./admin/pages/Orders'));
const AdminOrderDetail = lazy(() => import('./admin/pages/OrderDetail'));
const AdminMenu = lazy(() => import('./admin/pages/Menu'));
const AdminCategories = lazy(() => import('./admin/pages/Categories'));
const AdminReviews = lazy(() => import('./admin/pages/Reviews'));
const AdminSubscribers = lazy(() => import('./admin/pages/Subscribers'));
const AdminSettings = lazy(() => import('./admin/pages/Settings'));
const AdminStaff = lazy(() => import('./admin/pages/Staff'));

export default function App() {
  const location = useLocation();

  const from = useCallback(() => {
    const fromState = location.state?.from;
    return fromState || { pathname: '/' };
  }, [location]);

  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="menu" element={<AdminMenu />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="subscribers" element={<AdminSubscribers />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="staff" element={<AdminStaff />} />
            </Route>
            <Route path="*" element={<Navigate to={from().pathname} replace />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}
