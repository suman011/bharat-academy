import React, { useMemo, useRef, useState } from "react";
import { FaCopy, FaMobileAlt, FaRupeeSign } from "react-icons/fa";
import QRCode from "react-qr-code";
import { UPI_CONFIG, buildUpiPayUrl } from "../config/payment";

export default function CheckoutUpiPanel({ items }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const qrRef = useRef(null);

  const total = useMemo(
    () => items.reduce((sum, x) => sum + Number(x.course?.price || 0) * (x.qty || 1), 0),
    [items]
  );

  const title = useMemo(() => {
    const first = items[0]?.course?.name || "Course fee";
    if (items.length <= 1) return first;
    return `${first} + ${items.length - 1} more`;
  }, [items]);

  const upiUrl = useMemo(
    () =>
      buildUpiPayUrl({
        amountRupees: total,
        courseName: title,
      }),
    [total, title]
  );

  const amountLabel = Number(total || 0).toLocaleString("en-IN");

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

  const handlePayClick = (e) => {
    e.preventDefault();
    if (!revealed) setRevealed(true);
    requestAnimationFrame(() => {
      qrRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    });

    // Try to open the UPI deep link on devices that support it.
    // If the platform blocks it, the QR stays visible as fallback.
    try {
      window.location.href = upiUrl;
    } catch {
      // noop
    }
  };

  return (
    <div className="upi-panel">
      <p className="upi-amount-line">
        <FaRupeeSign aria-hidden /> <span>INR {amountLabel}</span>
      </p>

      <p className="upi-deeplink-hint">
        Opens your UPI app with <strong>₹{amountLabel}</strong> already filled.
      </p>
      <a href={upiUrl} className="upi-deeplink-btn" onClick={handlePayClick}>
        <FaMobileAlt aria-hidden /> Pay ₹{amountLabel} in UPI app
      </a>

      <p className="upi-or-divider">or scan QR</p>

      <div className="upi-qr-wrap" ref={qrRef}>
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
            <button
              type="button"
              className="upi-show-code-btn"
              onClick={() => {
                setRevealed(true);
              }}
            >
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
          Tap Show Code to reveal the QR code.
        </p>
      )}
    </div>
  );
}

