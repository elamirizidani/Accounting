import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./MainLayout";
import { useAuthStore } from "../store/authStore";
import { lazy, Suspense, useEffect } from "react";

const Home = lazy(() => import('../Pages/Home'));
const Proforma = lazy(() => import('../Pages/Proforma'));
const Invoices = lazy(() => import('../Pages/Invoices'));
const Clients = lazy(() => import('../Pages/Clients'));
const Lpo = lazy(() => import('../Pages/Lpo'));
const Services = lazy(() => import('../Pages/Services'));
const Transactions = lazy(() => import('../Pages/Transactions'));
const Login = lazy(() => import("../Pages/Login"));

const RouteLoader = () => (
  <div className="app-route-loader" role="status" aria-live="polite">
    Loading workspace...
  </div>
);

export default function AppRouter() {
  const { initialize, isLoggedIn, loading } = useAuthStore();
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <RouteLoader />;
    }

    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="/Proforma" element={<Proforma />} />
          <Route path="/Invoices" element={<Invoices />} />
          <Route path="/Clients" element={<Clients />} />
          <Route path="/Lpo" element={<Lpo />} />
          <Route path="/Services" element={<Services />} />
          <Route path="/Transactions" element={<Transactions />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
