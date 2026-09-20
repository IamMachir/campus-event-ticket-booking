import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, LoaderCircle, RefreshCw } from 'lucide-react';

export default function QrScanner({ onScan, onError }) {
  const containerId = 'campus-qr-scanner-region';
  const scannerRef = useRef(null);
  const lastScanRef = useRef({ text: '', time: 0 });
  const [status, setStatus] = useState('starting');
  const [message, setMessage] = useState('Opening your camera…');

  async function startScanner() {
    setStatus('starting'); setMessage('Opening your camera…');
    const scanner = new Html5Qrcode(containerId); scannerRef.current = scanner;
    try {
      await scanner.start({ facingMode: { ideal: 'environment' } }, { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 }, (decodedText) => {
        const now = Date.now();
        if (decodedText === lastScanRef.current.text && now - lastScanRef.current.time < 2500) return;
        lastScanRef.current = { text: decodedText, time: now }; onScan?.(decodedText);
      }, () => {});
      setStatus('ready'); setMessage('Camera ready. Center the QR code inside the frame.');
    } catch (err) {
      setStatus('error');
      const detail = err?.message || 'Camera access was unavailable.';
      const friendly = /permission|notallowed|denied/i.test(detail) ? 'Camera permission was denied. Allow camera access in your browser, then try again.' : /secure|https/i.test(detail) ? 'Camera scanning needs HTTPS (or localhost). Open the secure URL and try again.' : 'We could not open a camera on this device. Use the ticket code below instead.';
      setMessage(friendly); onError?.(friendly);
    }
  }

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => { if (!cancelled) startScanner(); }, 80);
    return () => {
      cancelled = true; window.clearTimeout(timer);
      const scanner = scannerRef.current; scannerRef.current = null;
      if (scanner) { const stop = scanner.isScanning ? scanner.stop() : Promise.resolve(); stop.then(() => scanner.clear()).catch(() => {}); }
    };
  }, []);

  return <div className="relative min-h-[320px] bg-slate-950/70 rounded-xl overflow-hidden"><div id={containerId} className="w-full min-h-[280px]" />{status !== 'ready' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 p-6 text-center">{status === 'starting' ? <LoaderCircle className="w-8 h-8 text-astu-400 animate-spin" /> : <Camera className="w-8 h-8 text-red-300" />}<p className="text-sm text-slate-300 max-w-xs">{message}</p>{status === 'error' && <button type="button" onClick={startScanner} className="inline-flex items-center gap-2 text-sm text-astu-300 border border-astu-400/30 rounded-lg px-3 py-2"><RefreshCw className="w-4 h-4" /> Try camera again</button>}</div>}{status === 'ready' && <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-astuGreen-400/80 shadow-[0_0_0_999px_rgba(2,6,23,0.12)]" />}</div>;
}
