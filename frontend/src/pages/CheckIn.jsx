import { useState, useCallback } from 'react';
import { ScanLine, CheckCircle2, AlertCircle, Keyboard, Camera, ShieldAlert } from 'lucide-react';
import api from '../api/client';
import QrScanner from '../components/QrScanner';

export default function CheckIn() {
  const [mode, setMode] = useState('manual');
  const [result, setResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitCode(ticketCode) {
    const normalizedCode = ticketCode?.trim();
    if (!normalizedCode) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post('/bookings/check-in', { ticketCode: normalizedCode });
      setResult({ success: true, message: res.data.message });
      setManualCode('');
    } catch (err) {
      const fraud = err.response?.data?.fraud || err.response?.status === 409;
      setResult({
        success: false,
        fraud,
        message: err.response?.data?.error || 'Check-in failed.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const handleScan = useCallback((decodedText) => { submitCode(decodedText); }, []);

  function handleManualSubmit(event) {
    event.preventDefault();
    submitCode(manualCode);
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 pt-24">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-astu-500 to-astuGreen-500 mb-4 animate-glow-pulse">
          <ScanLine className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-100">Scan Ticket</h1>
        <p className="text-slate-400 text-sm mt-1">Choose one secure check-in method.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <button type="button" onClick={() => { setMode('manual'); setResult(null); }}
          className={`rounded-xl px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 border transition-colors ${mode === 'manual' ? 'border-astu-400/50 bg-astu-500/10 text-astu-300' : 'border-white/10 text-slate-400'}`}>
          <Keyboard className="w-4 h-4" /> Enter code
        </button>
        <button type="button" onClick={() => { setMode('qr'); setResult(null); }}
          className={`rounded-xl px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 border transition-colors ${mode === 'qr' ? 'border-astuGreen-400/50 bg-astuGreen-500/10 text-astuGreen-300' : 'border-white/10 text-slate-400'}`}>
          <Camera className="w-4 h-4" /> Scan QR
        </button>
      </div>

      {mode === 'qr' ? (
        <div className="glass-card p-6">
          <p className="text-sm text-slate-400 mb-4 text-center">Point the camera at the attendee's QR ticket.</p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <QrScanner onScan={handleScan} onError={(message) => setResult({ success: false, message })} />
          </div>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="glass-card p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Ticket code</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" required placeholder="Enter ticket code" value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors font-mono text-sm" />
            </div>
            <button type="submit" disabled={submitting || !manualCode.trim()}
              className="glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50">
              {submitting ? '...' : 'Check In'}
            </button>
          </div>
        </form>
      )}

      {result && (
        <div className={`glass-card p-5 mt-4 ${result.fraud ? 'border-red-500/70 bg-red-950/40' : result.success ? 'border-astuGreen-400/30' : 'border-red-400/30'} animate-fade-in`}>
          <p className={`text-sm flex items-start gap-2 ${result.fraud || !result.success ? 'text-red-300' : 'text-astuGreen-400'}`}>
            {result.fraud ? <ShieldAlert className="w-6 h-6 shrink-0" /> : result.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{result.message}</span>
          </p>
          {result.fraud && <p className="text-xs text-red-200/70 mt-3 ml-8">Do not admit this ticket. Ask the attendee to contact the organizer.</p>}
        </div>
      )}
    </div>
  );
}