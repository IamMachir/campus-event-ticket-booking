import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

/**
 * Wraps html5-qrcode to scan a ticket QR code using the device camera.
 * Calls onScan(decodedText) once per successful scan, then pauses briefly
 * to avoid firing repeatedly on the same code while it's still in frame.
 */
export default function QrScanner({ onScan }) {
  const containerId = 'qr-scanner-region';
  const scannerRef = useRef(null);
  const lastScanRef = useRef(0);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const now = Date.now();
          if (now - lastScanRef.current < 2000) return; // debounce repeated frames
          lastScanRef.current = now;
          onScan(decodedText);
        },
        () => {
          // ignore per-frame decode failures, expected while searching for a code
        }
      )
      .catch(() => {
        // camera permission denied or unavailable; parent shows a manual-entry fallback
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return <div id={containerId} className="w-full max-w-sm mx-auto" />;
}
