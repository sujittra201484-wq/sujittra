import type { Metadata } from "next";
import NewOrderForm from "./new-order-form";

export const metadata: Metadata = {
  title: "เพิ่มคำสั่งซื้อ | สำนักพิมพ์อมตะ",
};

export default function NewOrderPage() {
  return <NewOrderForm />;
}
