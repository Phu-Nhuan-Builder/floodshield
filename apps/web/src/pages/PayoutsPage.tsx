// Aid payouts page
import { useState } from "react";
import { CreditCard, ExternalLink, Loader2, Send } from "lucide-react";
import { usePayouts, useTriggerPayout, useFloodZones } from "../hooks/useFloodData";
import { useWallet } from "../hooks/useWallet";
import { timeAgo, truncateAddress, formatSolAmount } from "@floodshield/shared";
import type { AidPayout } from "@floodshield/shared";

const STATUS_LABELS: Record<AidPayout["status"], string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  confirmed: "Đã xác nhận",
  failed: "Thất bại",
};

const STATUS_COLORS: Record<AidPayout["status"], string> = {
  pending: "text-yellow-400",
  processing: "text-blue-400",
  confirmed: "text-green-400",
  failed: "text-red-400",
};

const AID_TYPES: Array<{ value: AidPayout["aidType"]; label: string }> = [
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
    aidType: "rice_voucher" as AidPayout["aidType"],
  });

  const handleTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !form.zoneId) return;

    trigger({
      zoneId: form.zoneId,
      recipientAddress: address,
      aidType: form.aidType,
    });
  };

  const highZones = zones?.filter(
    (z) => z.severity === "critical" || z.severity === "high",
  ) ?? [];

  return (
    <div className="p-4 max-w-4xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Phân phối viện trợ</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Smart contract Solana · Tự động khi chỉ số lũ vượt ngưỡng
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Trigger form */}
        <div className="card">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-400" aria-hidden />
            Kích hoạt viện trợ
          </h2>

          {!isConnected ? (
            <p className="text-sm text-gray-500">
              Kết nối ví Phantom để kích hoạt viện trợ.
            </p>
          ) : (
            <form onSubmit={handleTrigger} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block" htmlFor="zone-select">
                  Vùng lũ
                </label>
                <select
                  id="zone-select"
                  value={form.zoneId}
                  onChange={(e) => setForm((f) => ({ ...f, zoneId: e.target.value }))}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn vùng lũ...</option>
                  {highZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.district}, {z.province} — {z.severity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block" htmlFor="aid-type-select">
                  Loại viện trợ
                </label>
                <select
                  id="aid-type-select"
                  value={form.aidType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, aidType: e.target.value as AidPayout["aidType"] }))
                  }
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AID_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending || !form.zoneId}
                className="btn-primary w-full"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                ) : (
                  <CreditCard className="w-4 h-4" aria-hidden />
                )}
                {isPending ? "Đang xử lý..." : "Kích hoạt viện trợ"}
              </button>
            </form>
          )}
        </div>

        {/* Quick stats */}
        <div className="card">
          <h2 className="font-semibold mb-3">Thống kê viện trợ</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tổng đã kích hoạt</span>
              <span className="font-medium">{payouts?.length ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Đã xác nhận on-chain</span>
              <span className="font-medium text-green-400">
                {payouts?.filter((p) => p.status === "confirmed").length ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Đang xử lý</span>
              <span className="font-medium text-blue-400">
                {payouts?.filter((p) => p.status === "processing").length ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payouts table */}
      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-3">Lịch sử viện trợ</h2>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-10 w-full rounded" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm" aria-label="Bảng lịch sử viện trợ">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                <th className="pb-2 font-medium">Địa điểm</th>
                <th className="pb-2 font-medium">Loại viện trợ</th>
                <th className="pb-2 font-medium">Người nhận</th>
                <th className="pb-2 font-medium">Số tiền</th>
                <th className="pb-2 font-medium">Trạng thái</th>
                <th className="pb-2 font-medium">Thời gian</th>
                <th className="pb-2 font-medium">Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {payouts?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-2.5">{p.province}</td>
                  <td className="py-2.5 text-gray-400">
                    {AID_TYPES.find((t) => t.value === p.aidType)?.label ?? p.aidType}
                  </td>
                  <td className="py-2.5 font-mono text-xs text-gray-400">
                    {truncateAddress(p.recipientAddress)}
                  </td>
                  <td className="py-2.5">{formatSolAmount(p.amount)}</td>
                  <td className={`py-2.5 font-medium ${STATUS_COLORS[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </td>
                  <td className="py-2.5 text-gray-500 text-xs">
                    {timeAgo(p.triggeredAt)}
                  </td>
                  <td className="py-2.5">
                    {p.txSignature && (
                      <a
                        href={`https://explorer.solana.com/tx/${p.txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                        aria-label="Xem giao dịch trên Solana Explorer"
                      >
                        <ExternalLink className="w-3 h-3" aria-hidden />
                        Explorer
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && !payouts?.length && (
          <div className="text-center py-8 text-gray-600 text-sm">
            Chưa có giao dịch viện trợ nào
          </div>
        )}
      </div>
    </div>
  );
}
