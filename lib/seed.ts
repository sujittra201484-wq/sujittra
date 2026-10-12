import { bookPrice } from "./catalog";
import { toDateValue } from "./format";
import type { Order, OrderStatus } from "./types";

type SeedRow = {
  daysAgo: number;
  shop: string;
  status: OrderStatus;
  items: [string, number][];
};

// วันที่คิดย้อนจากวันนี้ ให้กระจายในช่วง 2 เดือน
// มี 3 รายการที่ยังไม่ชำระและสั่งมาเกิน 30 วัน (57, 41, 34 วัน)
const ROWS: SeedRow[] = [
  { daysAgo: 57, shop: "ร้านหนังสือทุ่งดาวเรือง", status: "shipped", items: [["เงาจันทร์ใต้ต้นจามจุรี", 20], ["ภาษาของสายฝน", 15]] },
  { daysAgo: 52, shop: "เรือนอักษรริมโขง", status: "paid", items: [["บันทึกนักเดินทางคนสุดท้าย", 30]] },
  { daysAgo: 48, shop: "ร้านหนังสือสวนมะลิวัลย์", status: "paid", items: [["นิทานก่อนนอนของแมวสามสี", 40], ["สวนลับของยายเพียร", 12]] },
  { daysAgo: 41, shop: "บ้านหนังสือหลังคาแดง", status: "shipped", items: [["ประวัติศาสตร์ข้าวไทยฉบับย่อ", 10]] },
  { daysAgo: 34, shop: "มุมอ่านใต้ถุนเรือน", status: "pending", items: [["เมืองที่ไม่มีนาฬิกา", 25], ["คู่มือปลูกผักบนระเบียงคอนโด", 18]] },
  { daysAgo: 27, shop: "ร้านหนังสือฟ้าครามสาขาท่าแพ", status: "paid", items: [["เงาจันทร์ใต้ต้นจามจุรี", 15]] },
  { daysAgo: 19, shop: "เรือนอักษรริมโขง", status: "shipped", items: [["ภาษาของสายฝน", 20], ["เมืองที่ไม่มีนาฬิกา", 10], ["สวนลับของยายเพียร", 8]] },
  { daysAgo: 12, shop: "ร้านหนังสือทุ่งดาวเรือง", status: "shipped", items: [["คู่มือปลูกผักบนระเบียงคอนโด", 30]] },
  { daysAgo: 6, shop: "ร้านหนังสือสวนมะลิวัลย์", status: "pending", items: [["บันทึกนักเดินทางคนสุดท้าย", 12], ["ประวัติศาสตร์ข้าวไทยฉบับย่อ", 6]] },
  { daysAgo: 2, shop: "บ้านหนังสือหลังคาแดง", status: "pending", items: [["นิทานก่อนนอนของแมวสามสี", 50]] },
];

export function createSeedOrders(today: Date): Order[] {
  return ROWS.map((row, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - row.daysAgo);
    const orderDate = toDateValue(date);
    return {
      id: `seed-${index + 1}`,
      number: formatOrderNumber(index + 1),
      shopName: row.shop,
      orderDate,
      status: row.status,
      createdAt: new Date(`${orderDate}T09:00:00`).toISOString(),
      items: row.items.map(([title, quantity], i) => ({
        id: `seed-${index + 1}-${i + 1}`,
        bookTitle: title,
        quantity,
        unitPrice: bookPrice(title),
      })),
    };
  });
}

export function formatOrderNumber(n: number): string {
  return `AMT-${String(n).padStart(4, "0")}`;
}
