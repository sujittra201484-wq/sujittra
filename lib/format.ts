import type { Order } from "./types";

const baht = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBaht(amount: number): string {
  return `฿${baht.format(amount)}`;
}

// แปลง YYYY-MM-DD เป็นวันที่ตามเวลาท้องถิ่น (ไม่ให้เลื่อนวันเพราะเขตเวลา)
export function parseDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toDateValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// เช่น 12 ต.ค. 2569 (ปฏิทินพุทธศักราช)
export function formatThaiDate(value: string): string {
  return parseDate(value).toLocaleDateString("th-TH-u-ca-buddhist", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysSince(value: string, today = new Date()): number {
  const start = parseDate(value);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function orderTotal(order: Pick<Order, "items">): number {
  return order.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
}

export function orderQuantity(order: Pick<Order, "items">): number {
  return order.items.reduce((sum, i) => sum + i.quantity, 0);
}
