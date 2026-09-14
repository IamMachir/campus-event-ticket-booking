import { useState, useCallback } from 'react';
import { ScanLine, CheckCircle2, AlertCircle, Keyboard } from 'lucide-react';
import api from '../api/client';
import QrScanner from '../components/QrScanner';

export default function CheckIn() {
  const [result, setResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitCode(ticketCode) {
    if (!ticketCode) return;
    setSubmitting(true);
    try {
      const res = await api.post('/bookings/check-in', { ticketCode });
      setResult({ success: true, message: res.data.message });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.error || 'Check-in failed.' });
    } finally {
      setSubmitting(false);
    }
  }

  const handleScan = useCallback((decodedText) => { submitCode(decodedText); }, []);

  function handleManualSubmit(e) {
    e.preventDefault();
    submitCode(manualCode.trim());
    setManualCode('');
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 pt-24">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-astu-500 to-astuGreen-500 mb-4 animate-glow-pulse">
          <ScanLine className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-100">Scan Ticket</h1>
        <p className="text-slate-400 text-sm mt-1">Scan a QR code or enter the ticket code manually</p>
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="overflow-hidden rounded-xl border border-white/10">
          <QrScanner onScan={handleScan} />
        </div>
      </div>

      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Enter ticket code" value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors font-mono text-sm" />
        </div>
        <button type="submit" disabled={submitting || !manualCode}
          className="glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-astu-500/30 transition-all disabled:opacity-50">
          {submitting ? '...' : 'Check In'}
        </button>
      </form>

      {result && (
        <div className={`glass-card p-4 mt-4 ${result.success ? 'border-astuGreen-400/30' : 'border-red-400/30'} animate-fade-in`}>
          <p className={`text-sm flex items-center gap-2 ${result.success ? 'text-astuGreen-400' : 'text-red-400'}`}>
            {result.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}
