import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScanner({ onScan }) {
  const containerId = 'qr-scanner-region';
  const scannerRef = useRef(null);
  const lastScanRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => { onScanRef.current = onScan; }, [onScan]);

  useEffect(() => {
    let mounted = true;
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const now = Date.now();
          if (now - lastScanRef.current < 2000) return;
          lastScanRef.current = now;
          onScanRef.current(decodedText);
        },
        () => {}
      )
      .catch(() => {});

    return () => {
      mounted = false;
      if (scannerRef.current) {
        const s = scannerRef.current;
        scannerRef.current = null;
        if (s.isScanning) {
          s.stop().then(() => s.clear()).catch(() => {});
        } else {
          s.clear().catch(() => {});
        }
      }
    };
  }, []);

  return <div id={containerId} className="w-full max-w-sm mx-auto" />;
}
