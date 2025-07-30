import { Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout";
import Home from '../Pages/Home'
import Proforma from '../Pages/Proforma'
import Invoices from '../Pages/Invoices'
import Transactions from '../Pages/Transactions'

export default function AppRouter() {

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/Proforma" element={<Proforma />} />
        <Route path="/Invoices" element={<Invoices />} />
        <Route path="/Transactions" element={<Transactions />} />
      </Route>
    </Routes>
  );
}