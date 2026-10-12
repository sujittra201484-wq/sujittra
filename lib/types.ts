// โครงสร้างตรงกับตาราง orders / order_items ที่จะสร้างใน Supabase

export type OrderStatus = "pending" | "shipped" | "paid";

export type OrderItem = {
  id: string;
  bookTitle: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  number: string;
  shopName: string;
  orderDate: string; // YYYY-MM-DD
  status: OrderStatus;
  createdAt: string; // ISO
  items: OrderItem[];
};

export type NewOrderInput = {
  shopName: string;
  orderDate: string;
  items: { bookTitle: string; quantity: number; unitPrice: number }[];
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "รอส่ง",
  shipped: "ส่งแล้ว",
  paid: "ชำระแล้ว",
};
