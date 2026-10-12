import type { Metadata } from "next";
import OrdersTable from "./orders-table";

export const metadata: Metadata = {
  title: "รายการคำสั่งซื้อ | สำนักพิมพ์อมตะ",
};

export default function OrdersPage() {
  return <OrdersTable />;
}
