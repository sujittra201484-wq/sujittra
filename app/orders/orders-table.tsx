"use client";

import Link from "next/link";
import { useState } from "react";
import StatusBadge from "@/components/status-badge";
import { daysSince, formatBaht, formatThaiDate, orderQuantity, orderTotal } from "@/lib/format";
import {
  advanceOrderStatus,
  nextStatus,
  sortOrders,
  getRecentlyAddedId,
  useOrders,
} from "@/lib/orders-store";
import { STATUS_LABEL, type Order, type OrderStatus } from "@/lib/types";

const OVERDUE_DAYS = 30;

const FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending", label: STATUS_LABEL.pending },
  { value: "shipped", label: STATUS_LABEL.shipped },
  { value: "paid", label: STATUS_LABEL.paid },
];

const ACTION_LABEL: Record<OrderStatus, string> = {
  pending: "บันทึกว่าส่งแล้ว",
  shipped: "บันทึกว่าชำระแล้ว",
  paid: "",
};

function isOverdue(order: Order) {
  return order.status !== "paid" && daysSince(order.orderDate) > OVERDUE_DAYS;
}

export default function OrdersTable() {
  const orders = useOrders();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [justAddedId] = useState(getRecentlyAddedId);

  if (!orders) {
    return <p className="text-slate-500">กำลังโหลดข้อมูล...</p>;
  }

  const keyword = search.trim();
  const rows = sortOrders(orders).filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      (keyword === "" ||
        o.shopName.includes(keyword) ||
        o.number.includes(keyword) ||
        o.items.some((i) => i.bookTitle.includes(keyword))),
  );
  const justAdded = orders.find((o) => o.id === justAddedId);
  const overdueCount = orders.filter(isOverdue).length;

  function handleAdvance(order: Order) {
    const next = nextStatus(order.status);
    if (!next) return;
    const ok = window.confirm(
      `เปลี่ยนสถานะคำสั่งซื้อ ${order.number} (${order.shopName})\nจาก "${STATUS_LABEL[order.status]}" เป็น "${STATUS_LABEL[next]}" ใช่หรือไม่`,
    );
    if (ok) advanceOrderStatus(order.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">รายการคำสั่งซื้อ</h1>
          <p className="mt-1 text-sm text-slate-500">
            ทั้งหมด {orders.length} รายการ
            {overdueCount > 0 && (
              <span className="text-red-700">
                {" "}· ค้างชำระเกิน {OVERDUE_DAYS} วัน {overdueCount} รายการ
              </span>
            )}
          </p>
        </div>
        <Link
          href="/orders/new"
          className="inline-flex justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          เพิ่มคำสั่งซื้อ
        </Link>
      </div>

      {justAdded && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          บันทึกคำสั่งซื้อ {justAdded.number} ของ{justAdded.shopName} เรียบร้อยแล้ว
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                filter === f.value
                  ? "bg-white font-medium text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อร้าน ชื่อหนังสือ หรือเลขที่"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm sm:w-72"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">เลขที่</th>
              <th className="px-4 py-3 font-medium">ร้าน</th>
              <th className="px-4 py-3 font-medium">หนังสือ</th>
              <th className="px-4 py-3 text-right font-medium">จำนวน</th>
              <th className="px-4 py-3 text-right font-medium">ยอดเงิน</th>
              <th className="px-4 py-3 font-medium">วันที่สั่ง</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">ดำเนินการ</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((order) => {
              const overdue = isOverdue(order);
              const next = nextStatus(order.status);
              return (
                <tr
                  key={order.id}
                  className={
                    overdue
                      ? "bg-red-50 text-red-900"
                      : order.id === justAddedId
                        ? "bg-emerald-50/60"
                        : undefined
                  }
                >
                  <td className={`px-4 py-3 align-top font-medium whitespace-nowrap ${overdue ? "border-l-4 border-red-600" : "border-l-4 border-transparent"}`}>
                    {order.number}
                  </td>
                  <td className="px-4 py-3 align-top">{order.shopName}</td>
                  <td className="px-4 py-3 align-top">
                    <ul className="space-y-0.5">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.bookTitle}
                          <span className={overdue ? "text-red-700" : "text-slate-500"}>
                            {" "}× {item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-right align-top tabular-nums whitespace-nowrap">
                    {orderQuantity(order).toLocaleString("th-TH")} เล่ม
                  </td>
                  <td className="px-4 py-3 text-right align-top font-medium tabular-nums whitespace-nowrap">
                    {formatBaht(orderTotal(order))}
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    {formatThaiDate(order.orderDate)}
                    {overdue && (
                      <div className="text-xs font-medium text-red-700">
                        ค้างชำระ {daysSince(order.orderDate)} วัน
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    {next && (
                      <button
                        type="button"
                        onClick={() => handleAdvance(order)}
                        className="whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {ACTION_LABEL[order.status]}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
