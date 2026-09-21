import { useState, useCallback } from 'react';
import { ScanLine, CheckCircle2, AlertCircle, Keyboard, Camera, ShieldAlert, RotateCcw, Clock, Ban } from 'lucide-react';
import api from '../api/client';
import QrScanner from '../components/QrScanner';

export default function CheckIn() {
  const [mode, setMode] = useState('qr');
  const [result, setResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [pendingCode, setPendingCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function validateCode(ticketCode) {
    const normalizedCode = ticketCode?.trim();
    if (!normalizedCode || submitting) return;
    setSubmitting(true); setResult(null); setPendingCode('');
    try {
      const res = await api.post('/bookings/validate', { ticketCode: normalizedCode });
      setPendingCode(normalizedCode);
      setResult({ success: true, valid: true, ticketCode: normalizedCode, booking: res.data.booking, message: 'Valid ticket. Ready to check in.' });
    } catch (err) {
      const data = err.response?.data || {};
      setResult({
        success: false, valid: false,
        fraud: Boolean(data.fraud),
        expired: Boolean(data.expired),
        notYourEvent: Boolean(data.notYourEvent),
        ticketCode: normalizedCode,
        message: data.error || 'This ticket could not be validated.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmCheckIn() {
    if (!pendingCode) return;
    setSubmitting(true);
    try {
      const res = await api.post('/bookings/check-in', { ticketCode: pendingCode });
      setResult({ success: true, valid: true, checkedIn: true, ticketCode: pendingCode, booking: res.data.booking, message: res.data.message });
      setPendingCode(''); setManualCode('');
    } catch (err) {
      const data = err.response?.data || {};
      setResult({
        success: false, valid: false,
        fraud: Boolean(data.fraud) || err.response?.status === 409,
        expired: Boolean(data.expired),
        notYourEvent: Boolean(data.notYourEvent),
        ticketCode: pendingCode,
        message: data.error || 'Check-in failed.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  const handleScan = useCallback((decodedText) => { validateCode(decodedText); }, [submitting]);
  function handleManualSubmit(event) { event.preventDefault(); validateCode(manualCode); }
  function reset() { setResult(null); setPendingCode(''); setManualCode(''); }

  const resultClass = result?.valid
    ? 'border-astuGreen-400/40 bg-astuGreen-500/10'
    : result?.expired
      ? 'border-orange-400/40 bg-orange-500/10'
      : result?.notYourEvent
        ? 'border-amber-400/40 bg-amber-500/10'
        : 'border-red-400/40 bg-red-500/10';

  const headerText = result?.checkedIn
    ? 'CHECKED IN'
    : result?.valid
      ? 'VALID TICKET'
      : result?.expired
        ? 'EXPIRED TICKET'
        : result?.notYourEvent
          ? 'NOT YOUR EVENT'
          : 'INVALID TICKET';

  const headerColor = result?.valid
    ? 'text-astuGreen-200'
    : result?.expired
      ? 'text-orange-200'
      : result?.notYourEvent
        ? 'text-amber-200'
        : 'text-red-200';

  function ResultIcon() {
    if (result?.valid) return <CheckCircle2 className="w-7 h-7 text-astuGreen-300 shrink-0" />;
    if (result?.expired) return <Clock className="w-7 h-7 text-orange-300 shrink-0" />;
    if (result?.notYourEvent) return <Ban className="w-7 h-7 text-amber-300 shrink-0" />;
    if (result?.fraud) return <ShieldAlert className="w-7 h-7 text-red-300 shrink-0" />;
    return <AlertCircle className="w-7 h-7 text-red-300 shrink-0" />;
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 pt-24">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-astu-500 to-astuGreen-500 mb-4 animate-glow-pulse">
          <ScanLine className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-100">Scan Ticket</h1>
        <p className="text-slate-400 text-sm mt-1">Verify the ticket first, then confirm entry.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <button type="button" onClick={() => { setMode('manual'); reset(); }} className={'rounded-xl px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 border ' + (mode === 'manual' ? 'border-astu-400/50 bg-astu-500/10 text-astu-300' : 'border-white/10 text-slate-400')}>
          <Keyboard className="w-4 h-4" /> Enter code
        </button>
        <button type="button" onClick={() => { setMode('qr'); reset(); }} className={'rounded-xl px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 border ' + (mode === 'qr' ? 'border-astuGreen-400/50 bg-astuGreen-500/10 text-astuGreen-300' : 'border-white/10 text-slate-400')}>
          <Camera className="w-4 h-4" /> Scan QR
        </button>
      </div>

      {mode === 'qr' ? (
        <div className="glass-card p-4">
          <p className="text-sm text-slate-400 mb-4 text-center">Point the camera at the attendee's QR ticket.</p>
          <QrScanner onScan={handleScan} onError={(message) => setResult({ success: false, valid: false, message })} />
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="glass-card p-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Ticket code</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" required placeholder="Enter ticket code" value={manualCode} onChange={(e) => setManualCode(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none font-mono text-sm" />
            </div>
            <button type="submit" disabled={submitting || !manualCode.trim()} className="glow-btn bg-gradient-to-r from-astu-500 to-astuGreen-500 text-white px-4 rounded-xl disabled:opacity-50">
              {submitting ? 'Checking…' : 'Verify'}
            </button>
          </div>
        </form>
      )}

      {result && (
        <div className={'mt-5 rounded-2xl border p-5 ' + resultClass}>
          <div className="flex items-start gap-3">
            <ResultIcon />
            <div className="min-w-0">
              <p className={'font-bold ' + headerColor}>{headerText}</p>
              <p className="text-sm text-slate-300 mt-1">{result.message}</p>
              {result.ticketCode && <p className="font-mono text-xs text-slate-400 mt-2 break-all">{result.ticketCode}</p>}
              {result.booking && (
                <div className="mt-3 text-sm text-slate-300 space-y-1">
                  <p><span className="text-slate-500">Event:</span> {result.booking.event_title}</p>
                  <p><span className="text-slate-500">Attendee:</span> {result.booking.attendee_name || 'Ticket holder'}</p>
                </div>
              )}
            </div>
          </div>
          {pendingCode && (
            <button type="button" onClick={confirmCheckIn} disabled={submitting} className="mt-4 w-full rounded-xl bg-astuGreen-500 text-slate-950 font-bold py-3 disabled:opacity-50">
              {submitting ? 'Checking in…' : 'Confirm check-in'}
            </button>
          )}
          {!pendingCode && (
            <button type="button" onClick={reset} className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300">
              <RotateCcw className="w-4 h-4" /> Scan another ticket
            </button>
          )}
        </div>
      )}
    </div>
  );
}
