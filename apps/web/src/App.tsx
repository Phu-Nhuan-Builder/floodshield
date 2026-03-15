import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { AlertsPage } from "./pages/AlertsPage";
import { PayoutsPage } from "./pages/PayoutsPage";
import { VerifyPage } from "./pages/VerifyPage";
import { Layout } from "./components/common/Layout";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/payouts" element={<PayoutsPage />} />
        <Route path="/verify" element={<VerifyPage />} />
      </Route>
    </Routes>
  );
}
