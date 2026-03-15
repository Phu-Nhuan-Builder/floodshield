import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import { AlertsPage } from "./pages/AlertsPage";
import { PayoutsPage } from "./pages/PayoutsPage";
import { VerifyPage } from "./pages/VerifyPage";
import { Layout } from "./components/common/Layout";
export default function App() {
    return (_jsx(Routes, { children: _jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/alerts", element: _jsx(AlertsPage, {}) }), _jsx(Route, { path: "/payouts", element: _jsx(PayoutsPage, {}) }), _jsx(Route, { path: "/verify", element: _jsx(VerifyPage, {}) })] }) }));
}
//# sourceMappingURL=App.js.map