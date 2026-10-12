import type { Metadata } from "next";
import { Suspense } from "react";
import QuotationView from "./quotation-view";

export const metadata: Metadata = {
  title: "ใบเสนอราคา | สำนักพิมพ์อมตะ",
};

export default function QuotationPage(props: PageProps<"/orders/[id]/quotation">) {
  return (
    <Suspense fallback={<p className="text-slate-500">กำลังโหลดข้อมูล...</p>}>
      <QuotationView params={props.params} />
    </Suspense>
  );
}
