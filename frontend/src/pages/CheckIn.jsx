import { useState, useCallback } from 'react';
import api from '../api/client';
import QrScanner from '../components/QrScanner';

export default function CheckIn() {
  const [result, setResult] = useState(null); // { success, message }
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

  const handleScan = useCallback((decodedText) => {
    submitCode(decodedText);
  }, []);

  function handleManualSubmit(e) {
    e.preventDefault();
    submitCode(manualCode.trim());
    setManualCode('');
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Event Check-In</h1>
      <p className="text-sm text-gray-500 mb-4">Scan a ticket QR code, or enter the code manually.</p>

      <QrScanner onScan={handleScan} />

      <form onSubmit={handleManualSubmit} className="flex gap-2 mt-4">
        <input
          type="text"
          placeholder="Ticket code"
          className="border rounded px-3 py-2 flex-1 font-mono text-sm"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
        />
        <button
          type="submit"
          disabled={submitting || !manualCode}
          className="bg-emerald-700 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          Check In
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${
            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
