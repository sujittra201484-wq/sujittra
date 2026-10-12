"use client";

import Link from "next/link";
import { use, useRef, useState } from "react";
import { bahtText } from "@/lib/baht-text";
import { COMPANY, QUOTATION_VALID_DAYS } from "@/lib/company";
import { formatBaht, formatThaiDate, orderTotal, toDateValue } from "@/lib/format";
import { useOrder } from "@/lib/orders-store";

// ขนาดกระดาษ A4 ที่ 96 dpi
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

type ExportKind = "pdf" | "png";

const RENDER_OPTIONS = { pixelRatio: 2, backgroundColor: "#ffffff" };

async function renderToPng(node: HTMLElement): Promise<string> {
  const { toPng } = await import("html-to-image");
  return toPng(node, RENDER_OPTIONS);
}

// ใน PDF ใช้ JPEG เพื่อให้ไฟล์เล็กพอส่งทางอีเมลหรือไลน์
async function renderToJpeg(node: HTMLElement): Promise<string> {
  const { toJpeg } = await import("html-to-image");
  return toJpeg(node, { ...RENDER_OPTIONS, quality: 0.92 });
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

async function exportPdf(node: HTMLElement, fileName: string) {
  const [dataUrl, { jsPDF }] = await Promise.all([renderToJpeg(node), import("jspdf")]);
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  const imageHeight = (node.offsetHeight * A4_WIDTH_MM) / node.offsetWidth;

  // เอกสารยาวเกินหนึ่งหน้า ให้เลื่อนภาพขึ้นทีละหน้าแล้ววางซ้ำ
  let offset = 0;
  pdf.addImage(dataUrl, "PNG", 0, offset, A4_WIDTH_MM, imageHeight);
  while (imageHeight + offset - A4_HEIGHT_MM > 1) {
    offset -= A4_HEIGHT_MM;
    pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, offset, A4_WIDTH_MM, imageHeight);
  }
  pdf.save(fileName);
}

export default function QuotationView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = useOrder(id);
  const documentRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<ExportKind | null>(null);
  const [error, setError] = useState("");
  const [issueDate] = useState(() => toDateValue(new Date()));

  if (order === null) {
    return <p className="text-slate-500">กำลังโหลดข้อมูล...</p>;
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <p className="text-slate-700">ไม่พบคำสั่งซื้อนี้</p>
        <Link href="/orders" className="text-sm font-medium text-brand hover:underline">
          กลับไปหน้ารายการคำสั่งซื้อ
        </Link>
      </div>
    );
  }

  const quotationNumber = `QT-${order.number.replace(/\D/g, "")}`;
  const validUntil = (() => {
    const d = new Date(`${issueDate}T00:00:00`);
    d.setDate(d.getDate() + QUOTATION_VALID_DAYS);
    return toDateValue(d);
  })();
  const total = orderTotal(order);
  const fileBase = `ใบเสนอราคา-${quotationNumber}-${order.shopName}`;
  const companyContact = [
    COMPANY.phone && `โทร ${COMPANY.phone}`,
    COMPANY.email && `อีเมล ${COMPANY.email}`,
  ].filter(Boolean);

  async function handleExport(kind: ExportKind) {
    const node = documentRef.current;
    if (!node) return;
    setBusy(kind);
    setError("");
    try {
      if (kind === "pdf") {
        await exportPdf(node, `${fileBase}.pdf`);
      } else {
        downloadDataUrl(await renderToPng(node), `${fileBase}.png`);
      }
    } catch {
      setError("สร้างไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/orders" className="text-sm text-slate-500 hover:text-slate-900">
            รายการคำสั่งซื้อ
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">ใบเสนอราคา {quotationNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">
            จากคำสั่งซื้อ {order.number} · {order.shopName}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleExport("png")}
            disabled={busy !== null}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {busy === "png" ? "กำลังสร้างรูปภาพ..." : "บันทึกเป็นรูปภาพ"}
          </button>
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={busy !== null}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {busy === "pdf" ? "กำลังสร้าง PDF..." : "ดาวน์โหลด PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-4 sm:p-8">
        <div
          ref={documentRef}
          className="mx-auto flex flex-col bg-white px-14 py-12 text-[13px] text-slate-900 shadow-sm"
          style={{ width: A4_WIDTH_PX, minHeight: A4_HEIGHT_PX }}
        >
          <div className="flex items-start justify-between border-b-2 border-brand pb-6">
            <div className="max-w-[60%] space-y-1">
              <div className="text-xl font-semibold text-brand">{COMPANY.name}</div>
              {COMPANY.address && <div className="text-slate-600">{COMPANY.address}</div>}
              {companyContact.length > 0 && (
                <div className="text-slate-600">{companyContact.join(" · ")}</div>
              )}
              {COMPANY.taxId && (
                <div className="text-slate-600">เลขประจำตัวผู้เสียภาษี {COMPANY.taxId}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">ใบเสนอราคา</div>
            </div>
          </div>

          <div className="mt-6 flex justify-between gap-8">
            <div className="space-y-1">
              <div className="text-slate-500">เรียน</div>
              <div className="text-base font-medium">{order.shopName}</div>
            </div>
            <table className="text-left">
              <tbody>
                <tr>
                  <th className="pr-6 pb-1 font-normal text-slate-500">เลขที่</th>
                  <td className="pb-1 font-medium">{quotationNumber}</td>
                </tr>
                <tr>
                  <th className="pr-6 pb-1 font-normal text-slate-500">วันที่</th>
                  <td className="pb-1">{formatThaiDate(issueDate)}</td>
                </tr>
                <tr>
                  <th className="pr-6 pb-1 font-normal text-slate-500">ยืนราคาถึง</th>
                  <td className="pb-1">{formatThaiDate(validUntil)}</td>
                </tr>
                <tr>
                  <th className="pr-6 font-normal text-slate-500">อ้างอิงคำสั่งซื้อ</th>
                  <td>{order.number}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-6">
            {COMPANY.name}ยินดีเสนอราคาหนังสือตามรายการด้านล่างนี้
          </p>

          <table className="mt-3 w-full border-collapse">
            <thead>
              <tr className="bg-brand-soft text-left">
                <th className="w-14 border-y border-slate-300 px-3 py-2 text-center font-medium">ลำดับ</th>
                <th className="border-y border-slate-300 px-3 py-2 font-medium">รายการ</th>
                <th className="w-20 border-y border-slate-300 px-3 py-2 text-right font-medium">จำนวน</th>
                <th className="w-32 border-y border-slate-300 px-3 py-2 text-right font-medium">ราคาต่อหน่วย</th>
                <th className="w-36 border-y border-slate-300 px-3 py-2 text-right font-medium">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-200">
                  <td className="px-3 py-2 text-center tabular-nums">{index + 1}</td>
                  <td className="px-3 py-2">{item.bookTitle}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {item.quantity.toLocaleString("th-TH")} เล่ม
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBaht(item.unitPrice)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatBaht(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-b-2 border-slate-400">
                <td colSpan={3} className="px-3 py-3 text-slate-600">
                  ({bahtText(total)})
                </td>
                <td className="px-3 py-3 text-right font-medium">รวมทั้งสิ้น</td>
                <td className="px-3 py-3 text-right text-base font-semibold tabular-nums">
                  {formatBaht(total)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-6 space-y-1 text-slate-600">
            <div className="font-medium text-slate-900">หมายเหตุ</div>
            <div>ราคานี้ยืนราคา {QUOTATION_VALID_DAYS} วัน นับจากวันที่ในใบเสนอราคา</div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-16 pt-20 text-center">
            {["ผู้เสนอราคา", "ผู้อนุมัติสั่งซื้อ"].map((role) => (
              <div key={role} className="space-y-1">
                <div className="mx-auto w-56 border-b border-dotted border-slate-500 pb-10" />
                <div className="pt-1">({" ".repeat(40)})</div>
                <div>{role}</div>
                <div className="text-slate-500">วันที่ ......./......./.......</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
