import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Aid payouts page
import { useState } from "react";
import { CreditCard, ExternalLink, Loader2, Send } from "lucide-react";
import { usePayouts, useTriggerPayout, useFloodZones } from "../hooks/useFloodData";
import { useWallet } from "../hooks/useWallet";
import { timeAgo, truncateAddress, formatSolAmount } from "@floodshield/shared";
const STATUS_LABELS = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    confirmed: "Đã xác nhận",
    failed: "Thất bại",
};
const STATUS_COLORS = {
    pending: "text-yellow-400",
    processing: "text-blue-400",
    confirmed: "text-green-400",
    failed: "text-red-400",
};
const AID_TYPES = [
    { value: "rice_voucher", label: "Voucher gạo (50kg)" },
    { value: "fertilizer_voucher", label: "Voucher phân bón (20kg)" },
    { value: "cash", label: "Tiền mặt (SOL)" },
];
export function PayoutsPage() {
    const { data: payouts, isLoading } = usePayouts();
    const { data: zones } = useFloodZones();
    const { mutate: trigger, isPending } = useTriggerPayout();
    const { address, isConnected } = useWallet();
    const [form, setForm] = useState({
        zoneId: "",
        aidType: "rice_voucher",
    });
    const handleTrigger = (e) => {
        e.preventDefault();
        if (!address || !form.zoneId)
            return;
        trigger({
            zoneId: form.zoneId,
            recipientAddress: address,
            aidType: form.aidType,
        });
    };
    const highZones = zones?.filter((z) => z.severity === "critical" || z.severity === "high") ?? [];
    return (_jsxs("div", { className: "p-4 max-w-4xl", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h1", { className: "text-xl font-bold", children: "Ph\u00E2n ph\u1ED1i vi\u1EC7n tr\u1EE3" }), _jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: "Smart contract Solana \u00B7 T\u1EF1 \u0111\u1ED9ng khi ch\u1EC9 s\u1ED1 l\u0169 v\u01B0\u1EE3t ng\u01B0\u1EE1ng" })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4 mb-6", children: [_jsxs("div", { className: "card", children: [_jsxs("h2", { className: "font-semibold mb-3 flex items-center gap-2", children: [_jsx(Send, { className: "w-4 h-4 text-blue-400", "aria-hidden": true }), "K\u00EDch ho\u1EA1t vi\u1EC7n tr\u1EE3"] }), !isConnected ? (_jsx("p", { className: "text-sm text-gray-500", children: "K\u1EBFt n\u1ED1i v\u00ED Phantom \u0111\u1EC3 k\u00EDch ho\u1EA1t vi\u1EC7n tr\u1EE3." })) : (_jsxs("form", { onSubmit: handleTrigger, className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs text-gray-400 mb-1 block", htmlFor: "zone-select", children: "V\u00F9ng l\u0169" }), _jsxs("select", { id: "zone-select", value: form.zoneId, onChange: (e) => setForm((f) => ({ ...f, zoneId: e.target.value })), className: "w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500", required: true, children: [_jsx("option", { value: "", children: "Ch\u1ECDn v\u00F9ng l\u0169..." }), highZones.map((z) => (_jsxs("option", { value: z.id, children: [z.district, ", ", z.province, " \u2014 ", z.severity] }, z.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-gray-400 mb-1 block", htmlFor: "aid-type-select", children: "Lo\u1EA1i vi\u1EC7n tr\u1EE3" }), _jsx("select", { id: "aid-type-select", value: form.aidType, onChange: (e) => setForm((f) => ({ ...f, aidType: e.target.value })), className: "w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500", children: AID_TYPES.map(({ value, label }) => (_jsx("option", { value: value, children: label }, value))) })] }), _jsxs("button", { type: "submit", disabled: isPending || !form.zoneId, className: "btn-primary w-full", children: [isPending ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin", "aria-hidden": true })) : (_jsx(CreditCard, { className: "w-4 h-4", "aria-hidden": true })), isPending ? "Đang xử lý..." : "Kích hoạt viện trợ"] })] }))] }), _jsxs("div", { className: "card", children: [_jsx("h2", { className: "font-semibold mb-3", children: "Th\u1ED1ng k\u00EA vi\u1EC7n tr\u1EE3" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500", children: "T\u1ED5ng \u0111\u00E3 k\u00EDch ho\u1EA1t" }), _jsx("span", { className: "font-medium", children: payouts?.length ?? 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500", children: "\u0110\u00E3 x\u00E1c nh\u1EADn on-chain" }), _jsx("span", { className: "font-medium text-green-400", children: payouts?.filter((p) => p.status === "confirmed").length ?? 0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500", children: "\u0110ang x\u1EED l\u00FD" }), _jsx("span", { className: "font-medium text-blue-400", children: payouts?.filter((p) => p.status === "processing").length ?? 0 })] })] })] })] }), _jsxs("div", { className: "card overflow-x-auto", children: [_jsx("h2", { className: "font-semibold mb-3", children: "L\u1ECBch s\u1EED vi\u1EC7n tr\u1EE3" }), isLoading ? (_jsx("div", { className: "space-y-2", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "skeleton h-10 w-full rounded" }, i))) })) : (_jsxs("table", { className: "w-full text-sm", "aria-label": "B\u1EA3ng l\u1ECBch s\u1EED vi\u1EC7n tr\u1EE3", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-xs text-gray-500 border-b border-gray-800", children: [_jsx("th", { className: "pb-2 font-medium", children: "\u0110\u1ECBa \u0111i\u1EC3m" }), _jsx("th", { className: "pb-2 font-medium", children: "Lo\u1EA1i vi\u1EC7n tr\u1EE3" }), _jsx("th", { className: "pb-2 font-medium", children: "Ng\u01B0\u1EDDi nh\u1EADn" }), _jsx("th", { className: "pb-2 font-medium", children: "S\u1ED1 ti\u1EC1n" }), _jsx("th", { className: "pb-2 font-medium", children: "Tr\u1EA1ng th\u00E1i" }), _jsx("th", { className: "pb-2 font-medium", children: "Th\u1EDDi gian" }), _jsx("th", { className: "pb-2 font-medium", children: "Tx" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-800/50", children: payouts?.map((p) => (_jsxs("tr", { className: "hover:bg-gray-800/30 transition-colors", children: [_jsx("td", { className: "py-2.5", children: p.province }), _jsx("td", { className: "py-2.5 text-gray-400", children: AID_TYPES.find((t) => t.value === p.aidType)?.label ?? p.aidType }), _jsx("td", { className: "py-2.5 font-mono text-xs text-gray-400", children: truncateAddress(p.recipientAddress) }), _jsx("td", { className: "py-2.5", children: formatSolAmount(p.amount) }), _jsx("td", { className: `py-2.5 font-medium ${STATUS_COLORS[p.status]}`, children: STATUS_LABELS[p.status] }), _jsx("td", { className: "py-2.5 text-gray-500 text-xs", children: timeAgo(p.triggeredAt) }), _jsx("td", { className: "py-2.5", children: p.txSignature && (_jsxs("a", { href: `https://explorer.solana.com/tx/${p.txSignature}?cluster=devnet`, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs", "aria-label": "Xem giao d\u1ECBch tr\u00EAn Solana Explorer", children: [_jsx(ExternalLink, { className: "w-3 h-3", "aria-hidden": true }), "Explorer"] })) })] }, p.id))) })] })), !isLoading && !payouts?.length && (_jsx("div", { className: "text-center py-8 text-gray-600 text-sm", children: "Ch\u01B0a c\u00F3 giao d\u1ECBch vi\u1EC7n tr\u1EE3 n\u00E0o" }))] })] }));
}
//# sourceMappingURL=PayoutsPage.js.map