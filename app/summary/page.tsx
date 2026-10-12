import type { Metadata } from "next";
import SummaryView from "./summary-view";

export const metadata: Metadata = {
  title: "สรุปยอด | สำนักพิมพ์อมตะ",
};

export default function SummaryPage() {
  return <SummaryView />;
}
