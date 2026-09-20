import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, LoaderCircle, RefreshCw } from 'lucide-react';

const SCANNER_ID = 'campus-qr-scanner-region';

function cameraErrorMessage(error) {
  const name = error?.name || '';
  const detail = error?.message || '';

  if (window.isSecureContext === false || /secure context|https/i.test(detail)) {
    return 'Camera scanning needs HTTPS or localhost. Open the secure application URL, then try again.';
  }
  if (/NotAllowedError|PermissionDeniedError|permission|denied|SecurityError/i.test(name + ' ' + detail)) {
    return 'Camera permission is blocked. Select the camera icon in the address bar, choose Allow, reload the page, and try again.';
  }
  if (/NotFoundError|DevicesNotFoundError|no camera/i.test(name + ' ' + detail)) {
    return 'No camera was found on this device. Use Enter code to check in the ticket manually.';
  }
  if (/NotReadableError|TrackStartError|busy|in use/i.test(name + ' ' + detail)) {
    return 'The camera is already being used by another application. Close it and try again, or enter the ticket code manually.';
  }
  return 'We could not open a camera on this device. Use Enter code to check in the ticket manually.';
}

export default function QrScanner({ onScan, onError }) {
  const scannerRef = useRef(null);
  const startingRef = useRef(false);
  const lastScanRef = useRef({ text: '', time: 0 });
  const [status, setStatus] = useState('starting');
  const [message, setMessage] = useState('Requesting camera permission…');

  async function stopScanner() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;

    try {
      if (scanner.isScanning) await scanner.stop();
    } catch (_) {
      // The camera may already have stopped after a browser permission change.
    } finally {
      try { scanner.clear(); } catch (_) {}
    }
  }

  async function startScanner() {
    if (startingRef.current) return;
    startingRef.current = true;
    setStatus('starting');
    setMessage('Requesting camera permission…');

    try {
      await stopScanner();

      if (window.isSecureContext === false) {
        throw new Error('Camera scanning requires a secure context such as HTTPS or localhost.');
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('This browser does not support camera access.');
      }

      // Ask explicitly so the browser permission prompt appears before the QR library starts.
      const permissionStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      permissionStream.getTracks().forEach((track) => track.stop());

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras.length) throw new Error('No camera was found.');
      const camera = cameras.find(({ label }) => /back|rear|environment|wide/i.test(label)) || cameras[0];
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        camera.id,
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        (decodedText) => {
          const now = Date.now();
          if (decodedText === lastScanRef.current.text && now - lastScanRef.current.time < 2500) return;
          lastScanRef.current = { text: decodedText, time: now };
          onScan?.(decodedText);
        },
        () => {},
      );

      setStatus('ready');
      setMessage('Camera ready. Center the QR code inside the frame.');
    } catch (error) {
      await stopScanner();
      const friendly = cameraErrorMessage(error);
      setStatus('error');
      setMessage(friendly);
      onError?.(friendly);
    } finally {
      startingRef.current = false;
    }
  }

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) startScanner();
    }, 80);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stopScanner();
    };
  }, []);

  return (
    <div className="relative min-h-[320px] bg-slate-950/70 rounded-xl overflow-hidden">
      <div id={SCANNER_ID} className="w-full min-h-[280px]" />
      {status !== 'ready' && (
        <div role="status" aria-live="polite" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 p-6 text-center">
          {status === 'starting' ? <LoaderCircle className="w-8 h-8 text-astu-400 animate-spin" /> : <Camera className="w-8 h-8 text-red-300" />}
          <p className="text-sm text-slate-300 max-w-xs">{message}</p>
          {status === 'error' && (
            <button type="button" onClick={startScanner} className="inline-flex items-center gap-2 text-sm text-astu-300 border border-astu-400/30 rounded-lg px-3 py-2">
              <RefreshCw className="w-4 h-4" /> Try camera again
            </button>
          )}
        </div>
      )}
      {status === 'ready' && <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-astuGreen-400/80 shadow-[0_0_0_999px_rgba(2,6,23,0.12)]" />}
    </div>
  );
}
