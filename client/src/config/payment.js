/**
 * UPI checkout — edit for your real merchant UPI details.
 * Amount is passed automatically via the `upi://pay` link (`am` = course price in INR).
 */
export const UPI_CONFIG = {
  /** Your UPI VPA */
  upiId: "srnnimbalkar-1@okaxis",
  /** Shown in the payer's UPI app (matches your GPay profile) */
  payeeName: "SUMAN RAJENDRA NIMBALKAR",
  /** Static QR image in client/public (your GPay QR for scan) */
  qrImagePath: "/upi-qr.png",
  /**
   * true = only your PNG QR (UPI ID only — amount will NOT auto-fill when scanned).
   * false = generated QR from pay link — REQUIRED for scan-to-pay with exact course fee.
   */
  useStaticQrOnly: false,
};

/**
 * Builds a UPI deep link (NPCI-style). `am` is always included so apps can pre-fill amount.
 * Static bank/GPay “shop” QR images cannot include a different amount per course.
 *
 * @param {{ amountRupees: number, courseName: string }} opts
 */
export function buildUpiPayUrl({ amountRupees, courseName }) {
  const raw = Number(amountRupees);
  const safe = Number.isFinite(raw) ? raw : 0;
  const am = Math.max(0, safe).toFixed(2);
  const tn = `Course ${(courseName || "fee").slice(0, 60)}`.trim();
  const pa = encodeURIComponent(UPI_CONFIG.upiId.trim());
  const pn = encodeURIComponent((UPI_CONFIG.payeeName || "Payee").trim());
  const tne = encodeURIComponent(tn);
  // Order matches common NPCI / BHIM examples: pa, pn, tn, am, cu
  return `upi://pay?pa=${pa}&pn=${pn}&tn=${tne}&am=${am}&cu=INR`;
}
