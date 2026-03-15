import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Wallet connect button
import { Wallet, LogOut, Copy, ExternalLink } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { truncateAddress, formatSolAmount } from "@floodshield/shared";
export function WalletButton({ compact }) {
    const { address, balance, isConnected, isConnecting, error, connect, disconnect } = useWallet();
    const copyAddress = () => {
        if (address)
            navigator.clipboard.writeText(address);
    };
    if (!isConnected) {
        return (_jsxs("button", { onClick: connect, disabled: isConnecting, className: "btn-primary w-full text-xs", "aria-label": "K\u1EBFt n\u1ED1i v\u00ED Phantom", title: error ?? "Kết nối ví Phantom", children: [_jsx(Wallet, { className: "w-4 h-4 flex-shrink-0", "aria-hidden": true }), !compact && (_jsx("span", { children: isConnecting ? "Đang kết nối..." : "Kết nối ví" }))] }));
    }
    return (_jsxs("div", { className: "space-y-1", children: [!compact && (_jsxs("div", { className: "px-2 py-1 rounded-lg bg-gray-800 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between gap-1", children: [_jsx("span", { className: "text-gray-400 font-mono truncate", children: truncateAddress(address) }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: copyAddress, className: "p-1 hover:text-white", "aria-label": "Sao ch\u00E9p \u0111\u1ECBa ch\u1EC9", children: _jsx(Copy, { className: "w-3 h-3", "aria-hidden": true }) }), _jsx("a", { href: `https://explorer.solana.com/address/${address}?cluster=devnet`, target: "_blank", rel: "noreferrer", className: "p-1 hover:text-white", "aria-label": "Xem tr\u00EAn Solana Explorer", children: _jsx(ExternalLink, { className: "w-3 h-3", "aria-hidden": true }) })] })] }), balance !== null && (_jsx("div", { className: "text-green-400 font-mono mt-0.5", children: formatSolAmount(Number(balance)) }))] })), _jsxs("button", { onClick: disconnect, className: "btn-ghost w-full text-xs", "aria-label": "Ng\u1EAFt k\u1EBFt n\u1ED1i v\u00ED", children: [_jsx(LogOut, { className: "w-4 h-4 flex-shrink-0", "aria-hidden": true }), !compact && _jsx("span", { children: "Ng\u1EAFt k\u1EBFt n\u1ED1i" })] })] }));
}
//# sourceMappingURL=WalletButton.js.map