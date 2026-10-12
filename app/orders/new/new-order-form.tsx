"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BOOKS, SHOPS, bookPrice } from "@/lib/catalog";
import { formatBaht, toDateValue } from "@/lib/format";
import { addOrder, useOrders } from "@/lib/orders-store";

type Line = { key: number; bookTitle: string; quantity: string };

type Errors = {
  shop?: string;
  date?: string;
  lines: Record<number, { book?: string; quantity?: string }>;
};

const inputClass = "w-full rounded-md border bg-white px-3 py-2 text-sm";

function fieldClass(hasError: boolean) {
  return `${inputClass} ${hasError ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"}`;
}

export default function NewOrderForm() {
  // รอให้ข้อมูลในเบราว์เซอร์พร้อมก่อน เพื่อใช้วันที่ของเครื่องผู้ใช้เป็นค่าเริ่มต้น
  const orders = useOrders();
  if (!orders) return <p className="text-slate-500">กำลังโหลดข้อมูล...</p>;
  return <Form />;
}

function Form() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [orderDate, setOrderDate] = useState(() => toDateValue(new Date()));
  const [lines, setLines] = useState<Line[]>([{ key: 1, bookTitle: "", quantity: "" }]);
  const [nextKey, setNextKey] = useState(2);
  // เริ่มแสดงคำเตือนหลังกดบันทึกครั้งแรก จากนั้นตรวจใหม่ทุกครั้งที่แก้ข้อมูล
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  const total = lines.reduce((sum, l) => sum + lineAmount(l), 0);

  function updateLine(key: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { key: nextKey, bookTitle: "", quantity: "" }]);
    setNextKey((k) => k + 1);
  }

  function removeLine(key: number) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  function validate(): Errors {
    const result: Errors = { lines: {} };
    if (!shopName) result.shop = "กรุณาเลือกร้านค้า";
    if (!orderDate) result.date = "กรุณาระบุวันที่สั่ง";
    const seen = new Set<string>();
    for (const line of lines) {
      const lineErrors: { book?: string; quantity?: string } = {};
      if (!line.bookTitle) {
        lineErrors.book = "กรุณาเลือกหนังสือ";
      } else if (seen.has(line.bookTitle)) {
        lineErrors.book = "เลือกหนังสือเล่มนี้ซ้ำกับแถวอื่น ให้รวมจำนวนไว้แถวเดียว";
      }
      seen.add(line.bookTitle);
      const qty = Number(line.quantity);
      if (line.quantity.trim() === "") {
        lineErrors.quantity = "กรุณาระบุจำนวน";
      } else if (!Number.isInteger(qty) || qty < 1) {
        lineErrors.quantity = "จำนวนต้องเป็นจำนวนเต็มตั้งแต่ 1 เล่มขึ้นไป";
      }
      if (lineErrors.book || lineErrors.quantity) result.lines[line.key] = lineErrors;
    }
    return result;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (hasErrors(validate())) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    await addOrder({
      shopName,
      orderDate,
      items: lines.map((l) => ({
        bookTitle: l.bookTitle,
        quantity: Number(l.quantity),
        unitPrice: bookPrice(l.bookTitle),
      })),
    });
    router.push("/orders");
  }

  const errors = showErrors ? validate() : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">เพิ่มคำสั่งซื้อ</h1>
        <p className="mt-1 text-sm text-slate-500">
          เลือกร้านและหนังสือ ระบบจะคิดยอดเงินจากราคาหน้าปกให้อัตโนมัติ
        </p>
      </div>

      {errors && hasErrors(errors) && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          กรอกข้อมูลไม่ครบหรือไม่ถูกต้อง กรุณาตรวจสอบช่องที่มีกรอบสีแดง
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-medium">ข้อมูลร้านค้า</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">ร้านค้า</span>
            <select
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className={fieldClass(!!errors?.shop)}
            >
              <option value="">เลือกร้านค้า</option>
              {SHOPS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors?.shop && <span className="mt-1 block text-sm text-red-700">{errors.shop}</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">วันที่สั่ง</span>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className={fieldClass(!!errors?.date)}
            />
            {errors?.date && <span className="mt-1 block text-sm text-red-700">{errors.date}</span>}
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-medium">รายการหนังสือ</h2>
        <div className="space-y-4">
          {lines.map((line, index) => {
            const lineErrors = errors?.lines[line.key];
            const price = bookPrice(line.bookTitle);
            return (
              <div
                key={line.key}
                className="grid gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_7rem_8rem_8rem_auto] sm:items-start"
              >
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">หนังสือ (แถว {index + 1})</span>
                  <select
                    value={line.bookTitle}
                    onChange={(e) => updateLine(line.key, { bookTitle: e.target.value })}
                    className={fieldClass(!!lineErrors?.book)}
                  >
                    <option value="">เลือกหนังสือ</option>
                    {BOOKS.map((b) => (
                      <option key={b.title} value={b.title}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                  {lineErrors?.book && (
                    <span className="mt-1 block text-sm text-red-700">{lineErrors.book}</span>
                  )}
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">จำนวน (เล่ม)</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={line.quantity}
                    onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                    className={`${fieldClass(!!lineErrors?.quantity)} text-right tabular-nums`}
                  />
                  {lineErrors?.quantity && (
                    <span className="mt-1 block text-sm text-red-700">{lineErrors.quantity}</span>
                  )}
                </label>
                <div>
                  <span className="mb-1 block text-sm text-slate-600">ราคาต่อเล่ม</span>
                  <div className="py-2 text-right text-sm tabular-nums text-slate-700">
                    {line.bookTitle ? formatBaht(price) : "-"}
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-sm text-slate-600">รวม</span>
                  <div className="py-2 text-right text-sm font-medium tabular-nums">
                    {formatBaht(lineAmount(line))}
                  </div>
                </div>
                <div className="sm:pt-6">
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    disabled={lines.length === 1}
                    className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-red-700 disabled:invisible"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addLine}
          className="mt-4 rounded-md border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          เพิ่มหนังสืออีกรายการ
        </button>
      </section>

      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-slate-500">ยอดเงินรวม</div>
          <div className="text-2xl font-semibold tabular-nums">{formatBaht(total)}</div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/orders"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกคำสั่งซื้อ"}
          </button>
        </div>
      </div>
    </form>
  );
}

function hasErrors(errors: Errors): boolean {
  return !!(errors.shop || errors.date || Object.keys(errors.lines).length > 0);
}

function lineAmount(line: Line): number {
  const qty = Number(line.quantity);
  if (!line.bookTitle || !Number.isFinite(qty) || qty < 0) return 0;
  return qty * bookPrice(line.bookTitle);
}
