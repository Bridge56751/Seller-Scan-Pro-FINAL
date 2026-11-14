/** UPC-A, EAN-8/13 and GTIN-14 only. UPC-E must be expanded before use. */
export function normalizeBarcode(value: string): string | null {
  const code = value.trim();
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code) || /^0+$/.test(code)) return null;
  let sum = 0;
  for (let i = code.length - 2, weight = 3; i >= 0; i--, weight = weight === 3 ? 1 : 3) {
    sum += Number(code[i]) * weight;
  }
  if ((10 - sum % 10) % 10 !== Number(code.at(-1))) return null;
  // iOS often reports UPC-A as EAN-13 with a leading zero.
  return code.length === 13 && code.startsWith("0") ? code.slice(1) : code;
}

export type BarcodeProduct = {
  barcode: string;
  title: string;
  brand: string;
  imageUrl: string | null;
  query: string;
  source: "UPCitemdb";
};
