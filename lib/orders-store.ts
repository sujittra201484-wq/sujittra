"use client";

// ชั้นจัดการข้อมูลคำสั่งซื้อ
// รอบนี้เก็บใน localStorage ของเบราว์เซอร์ ตอนต่อ Supabase ให้แก้เฉพาะไฟล์นี้

import { useSyncExternalStore } from "react";
import { createSeedOrders, formatOrderNumber } from "./seed";
import type { NewOrderInput, Order, OrderStatus } from "./types";

const STORAGE_KEY = "amata-orders-v1";

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: "shipped",
  shipped: "paid",
  paid: null,
};

const listeners = new Set<() => void>();
let memory: Order[] | null = null;

function load(): Order[] {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memory = JSON.parse(raw) as Order[];
      return memory;
    }
  } catch {
    // อ่านไม่ได้ ให้ใช้ข้อมูลตัวอย่างแทน
  }
  memory = createSeedOrders(new Date());
  save(memory);
  return memory;
}

function save(orders: Order[]) {
  memory = orders;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // บันทึกไม่ได้ (เช่นโหมดส่วนตัว) ข้อมูลยังอยู่ในหน่วยความจำจนปิดหน้า
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      memory = null;
      fn();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

let lastAdded: { id: string; at: number } | null = null;

/** คืนรายการคำสั่งซื้อทั้งหมด หรือ null ระหว่างโหลด (ฝั่งเซิร์ฟเวอร์) */
export function useOrders(): Order[] | null {
  return useSyncExternalStore(subscribe, load, () => null);
}

/** รหัสคำสั่งซื้อที่เพิ่งบันทึกภายใน 10 วินาที ใช้ไฮไลต์ในหน้ารายการ */
export function getRecentlyAddedId(): string | null {
  return lastAdded && Date.now() - lastAdded.at < 10_000 ? lastAdded.id : null;
}

export function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) =>
      b.orderDate.localeCompare(a.orderDate) || b.createdAt.localeCompare(a.createdAt),
  );
}

export function nextStatus(status: OrderStatus): OrderStatus | null {
  return NEXT_STATUS[status];
}

export async function addOrder(input: NewOrderInput): Promise<Order> {
  const orders = load();
  const maxNumber = orders.reduce(
    (max, o) => Math.max(max, Number(o.number.replace(/\D/g, "")) || 0),
    0,
  );
  const order: Order = {
    id: crypto.randomUUID(),
    number: formatOrderNumber(maxNumber + 1),
    shopName: input.shopName,
    orderDate: input.orderDate,
    status: "pending",
    createdAt: new Date().toISOString(),
    items: input.items.map((item) => ({ id: crypto.randomUUID(), ...item })),
  };
  save([order, ...orders]);
  lastAdded = { id: order.id, at: Date.now() };
  return order;
}

export async function advanceOrderStatus(id: string): Promise<void> {
  save(
    load().map((o) => {
      const next = o.id === id ? NEXT_STATUS[o.status] : null;
      return next ? { ...o, status: next } : o;
    }),
  );
}
