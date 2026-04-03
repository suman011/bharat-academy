import React, { useState, useEffect, useMemo } from "react";
import { FaTimes, FaRupeeSign, FaCopy, FaMobileAlt } from "react-icons/fa";
import QRCode from "react-qr-code";
import { UPI_CONFIG, buildUpiPayUrl } from "../config/payment";

export default function UpiCheckoutModal({ course, isOpen, onClose }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const upiUrl = useMemo(
    () =>
      buildUpiPayUrl({
        amountRupees: course?.price ?? 0,
        courseName: course?.name ?? "",
      }),
    [course]
  );

  useEffect(() => {
    if (!isOpen) {
      setRevealed(false);
      setCopied(false);
      setLinkCopied(false);
    }
  }, [isOpen]);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_CONFIG.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const copyPayLink = async () => {
    try {
      await navigator.clipboard.writeText(upiUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  if (!isOpen || !course) return null;

  const amountLabel = course.price.toLocaleString("en-IN");

  return (
    <div className="course-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="course-modal upi-checkout-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upi-modal-title"
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <h2 id="upi-modal-title" className="upi-modal-heading">
          Pay with UPI
        </h2>
        <p className="upi-course-line">{course.name}</p>
        <p className="upi-amount-line">
          <FaRupeeSign aria-hidden />
          <span>INR {amountLabel}</span>
        </p>

        <p className="upi-deeplink-hint">
          Opens your UPI app with <strong>₹{amountLabel}</strong> already filled in the amount field.
        </p>
        <a href={upiUrl} className="upi-deeplink-btn">
          <FaMobileAlt aria-hidden />
          Pay ₹{amountLabel} in UPI app
        </a>

        <p className="upi-or-divider">or scan QR (fee included)</p>

        <div className="upi-qr-wrap">
          <div className={revealed ? "upi-qr-code-box" : "upi-qr-code-box is-blurred"}>
            {UPI_CONFIG.useStaticQrOnly ? (
              <img
                src={UPI_CONFIG.qrImagePath}
                alt={revealed ? "UPI QR code" : ""}
                width={220}
                height={220}
                className="upi-static-qr"
              />
            ) : (
              <QRCode
                value={upiUrl}
                size={256}
                level="H"
                fgColor="#0f172a"
                bgColor="#ffffff"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
              />
            )}
          </div>
          {!revealed ? (
            <div className="upi-qr-mask">
              <button type="button" className="upi-show-code-btn" onClick={() => setRevealed(true)}>
                Show Code
              </button>
            </div>
          ) : null}
        </div>

        {revealed ? (
          <>
            <div className="upi-id-row">
              <div className="upi-id-text">
                <span className="upi-id-label">UPI ID</span>
                <strong className="upi-id-value">{UPI_CONFIG.upiId}</strong>
              </div>
              <button type="button" className="upi-copy-btn" onClick={copyUpi}>
                <FaCopy aria-hidden /> {copied ? "Copied" : "Copy ID"}
              </button>
            </div>
            {!UPI_CONFIG.useStaticQrOnly ? (
              <button type="button" className="upi-copy-link-btn" onClick={copyPayLink}>
                <FaCopy aria-hidden /> {linkCopied ? "Pay link copied" : `Copy pay link (₹${amountLabel})`}
              </button>
            ) : null}
          </>
        ) : (
          <p className="upi-tap-hint">
            {UPI_CONFIG.useStaticQrOnly
              ? "Tap Show Code for your saved QR - enter the fee manually or use Pay in UPI app above for the amount prefilled."
              : `Tap Show Code - this QR includes \u20B9${amountLabel} for GPay, PhonePe, or Paytm.`}
          </p>
        )}

        <p className="upi-footnote">
          After paying, keep your UTR / reference ID. We will confirm enrollment from our side.
        </p>
      </div>
    </div>
  );
}
