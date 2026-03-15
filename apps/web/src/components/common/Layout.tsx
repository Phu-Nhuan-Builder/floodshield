// Common Layout component
import { Outlet, NavLink } from "react-router-dom";
import { AlertTriangle, Map, CreditCard, CheckSquare, Shield, Menu, X } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import { useAlerts } from "../../hooks/useFloodData";
import { WalletButton } from "./WalletButton";
import { AlertBanner } from "../alert/AlertBanner";
import { DemoModeBanner } from "./DemoModeBanner";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Bản đồ lũ", icon: Map, ariaLabel: "Trang bản đồ lũ" },
  { to: "/alerts", label: "Cảnh báo", icon: AlertTriangle, ariaLabel: "Danh sách cảnh báo" },
  { to: "/payouts", label: "Viện trợ", icon: CreditCard, ariaLabel: "Phân phối viện trợ" },
  { to: "/verify", label: "Xác nhận", icon: CheckSquare, ariaLabel: "Xác nhận cộng đồng" },
] as const;

export function Layout() {
  const { sidebarOpen, setSidebarOpen, isDemoMode, activeAlerts } = useAppStore();
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");

  // Subscribe to realtime alerts
  useAlerts(true);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          flex-shrink-0 flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300
          ${sidebarOpen ? "w-56" : "w-16"}
        `}
        aria-label="Điều hướng chính"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" aria-hidden />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">FloodShield VN</div>
              <div className="text-xs text-gray-500 truncate">ĐBSCL</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1 rounded hover:bg-gray-800 transition-colors"
            aria-label={sidebarOpen ? "Thu gọn menu" : "Mở rộng menu"}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 space-y-1 px-2" role="navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon, ariaLabel }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={ariaLabel}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors min-h-[44px]
                ${isActive ? "bg-blue-700 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Wallet button at bottom */}
        <div className="p-3 border-t border-gray-800">
          <WalletButton compact={!sidebarOpen} />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top alerts */}
        {criticalAlerts.length > 0 && <AlertBanner alert={criticalAlerts[0]!} />}
        {isDemoMode && <DemoModeBanner />}

        {/* Page content */}
        <main className="flex-1 overflow-auto" role="main" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
