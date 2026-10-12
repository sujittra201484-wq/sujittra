import Link from "next/link";

const SECTIONS = [
  {
    href: "/orders",
    title: "รายการคำสั่งซื้อ",
    detail: "ดูคำสั่งซื้อทั้งหมด อัปเดตการจัดส่งและการชำระเงิน",
    who: "ธุรการ / บัญชี",
  },
  {
    href: "/orders/new",
    title: "เพิ่มคำสั่งซื้อ",
    detail: "บันทึกคำสั่งซื้อใหม่จากร้านค้า ระบบคิดยอดเงินให้อัตโนมัติ",
    who: "ฝ่ายขาย",
  },
  {
    href: "/summary",
    title: "สรุปยอด",
    detail: "ยอดขายรวม ยอดค้างชำระ และร้านที่มียอดสูงสุด",
    who: "บัญชี / ผู้บริหาร",
  },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ยินดีต้อนรับ</h1>
        <p className="mt-1 text-slate-500">เลือกเมนูที่ต้องการใช้งาน</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-400"
          >
            <div className="font-medium">{s.title}</div>
            <p className="mt-2 text-sm text-slate-600">{s.detail}</p>
            <p className="mt-4 text-xs text-slate-400">สำหรับ {s.who}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
