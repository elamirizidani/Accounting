import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./MainLayout";
import Home from '../Pages/Home'
import Proforma from '../Pages/Proforma'
import Invoices from '../Pages/Invoices'
import Clients from '../Pages/Clients'
import Lpo from '../Pages/Lpo'

import Transactions from '../Pages/Transactions'
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import Login from "../Pages/Login";

export default function AppRouter() {
  const { initialize, isLoggedIn } = useAuthStore();
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
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
        
        <Route path="/Transactions" element={<Transactions />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}