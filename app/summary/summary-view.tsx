"use client";

import { daysSince, formatBaht, orderTotal } from "@/lib/format";
import { useOrders } from "@/lib/orders-store";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "shipped", "paid"];

const STATUS_BAR: Record<OrderStatus, string> = {
  pending: "bg-amber-400",
  shipped: "bg-sky-500",
  paid: "bg-emerald-500",
};

export default function SummaryView() {
  const orders = useOrders();
  if (!orders) return <p className="text-slate-500">กำลังโหลดข้อมูล...</p>;

  const totalSales = orders.reduce((sum, o) => sum + orderTotal(o), 0);
  const unpaid = orders.filter((o) => o.status !== "paid");
  const unpaidTotal = unpaid.reduce((sum, o) => sum + orderTotal(o), 0);
  const overdue = unpaid.filter((o) => daysSince(o.orderDate) > 30);
  const overdueTotal = overdue.reduce((sum, o) => sum + orderTotal(o), 0);

  const byStatus = STATUSES.map((status) => {
    const list = orders.filter((o) => o.status === status);
    return {
      status,
      count: list.length,
      amount: list.reduce((sum, o) => sum + orderTotal(o), 0),
    };
  });
  const maxStatusCount = Math.max(1, ...byStatus.map((s) => s.count));

  const shopTotals = new Map<string, number>();
  for (const o of orders) {
    shopTotals.set(o.shopName, (shopTotals.get(o.shopName) ?? 0) + orderTotal(o));
  }
  const topShops = [...shopTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));
  const maxShop = Math.max(1, ...topShops.map((s) => s.amount));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">สรุปยอด</h1>
        <p className="mt-1 text-sm text-slate-500">คำนวณจากคำสั่งซื้อทั้งหมด {orders.length} รายการ</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="ยอดขายรวม" value={formatBaht(totalSales)} note={`${orders.length} คำสั่งซื้อ`} />
        <StatCard
          label="ยอดค้างชำระรวม"
          value={formatBaht(unpaidTotal)}
          note={
            overdue.length > 0
              ? `${unpaid.length} คำสั่งซื้อ · เกิน 30 วัน ${overdue.length} รายการ รวม ${formatBaht(overdueTotal)}`
              : `${unpaid.length} คำสั่งซื้อ`
          }
          alert={overdue.length > 0}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {byStatus.map((s) => (
          <StatCard
            key={s.status}
            label={STATUS_LABEL[s.status]}
            value={`${s.count.toLocaleString("th-TH")} รายการ`}
            note={formatBaht(s.amount)}
            small
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-medium">ร้านที่มียอดสั่งซื้อสูงสุด 5 อันดับ</h2>
          <ol className="mt-4 space-y-4">
            {topShops.map((shop, i) => (
              <li key={shop.name}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    <span className="mr-2 text-slate-400 tabular-nums">{i + 1}.</span>
                    {shop.name}
                  </span>
                  <span className="font-medium tabular-nums whitespace-nowrap">{formatBaht(shop.amount)}</span>
                </div>
                <div className="h-3 rounded-sm bg-slate-100">
                  <div
                    className="h-3 rounded-sm bg-brand"
                    style={{ width: `${(shop.amount / maxShop) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-medium">จำนวนคำสั่งซื้อแยกตามสถานะ</h2>
          <div className="mt-4 flex h-48 items-end gap-6 border-b border-slate-200 px-2">
            {byStatus.map((s) => (
              <div key={s.status} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-sm font-medium tabular-nums">{s.count}</span>
                <div
                  className={`w-full max-w-16 rounded-t-sm ${STATUS_BAR[s.status]}`}
                  style={{ height: `${(s.count / maxStatusCount) * 85}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-6 px-2">
            {byStatus.map((s) => (
              <div key={s.status} className="flex-1 text-center text-sm text-slate-600">
                {STATUS_LABEL[s.status]}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  alert = false,
  small = false,
}: {
  label: string;
  value: string;
  note?: string;
  alert?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-5 ${alert ? "border-red-200" : "border-slate-200"}`}
    >
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-1 font-semibold tabular-nums ${small ? "text-xl" : "text-3xl"}`}>{value}</div>
      {note && (
        <div className={`mt-1 text-sm ${alert ? "text-red-700" : "text-slate-500"}`}>{note}</div>
      )}
    </div>
  );
}
