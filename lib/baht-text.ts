// แปลงจำนวนเงินเป็นตัวอักษรไทย เช่น 12500 -> หนึ่งหมื่นสองพันห้าร้อยบาทถ้วน

const DIGITS = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const UNITS = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];

// อ่านตัวเลขไม่เกิน 6 หลัก
function readGroup(digits: string): string {
  let text = "";
  const len = digits.length;
  for (let i = 0; i < len; i++) {
    const d = Number(digits[i]);
    const pos = len - i - 1;
    if (d === 0) continue;
    if (pos === 1 && d === 1) text += "สิบ";
    else if (pos === 1 && d === 2) text += "ยี่สิบ";
    else if (pos === 0 && d === 1 && len > 1 && digits[len - 2] !== "0") text += "เอ็ด";
    else text += DIGITS[d] + UNITS[pos];
  }
  return text;
}

// อ่านจำนวนเต็มทุกขนาด โดยแบ่งทีละ 6 หลักแล้วต่อด้วย "ล้าน"
function readInteger(value: string): string {
  const n = value.replace(/^0+/, "");
  if (n === "") return "";
  if (n.length <= 6) return readGroup(n);
  return readInteger(n.slice(0, -6)) + "ล้าน" + readGroup(n.slice(-6));
}

export function bahtText(amount: number): string {
  const [baht, satang] = Math.abs(amount).toFixed(2).split(".");
  const bahtWords = readInteger(baht);
  const satangWords = readInteger(satang);
  if (!bahtWords && !satangWords) return "ศูนย์บาทถ้วน";
  return (
    (bahtWords ? bahtWords + "บาท" : "") + (satangWords ? satangWords + "สตางค์" : "ถ้วน")
  );
}
