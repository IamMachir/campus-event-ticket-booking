export default function QrTicket({ qrCode, ticketCode }) {
  if (!qrCode && !ticketCode) return null;

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-4 border-astuGreen-400/30">
      {qrCode && (
        <div className="relative">
          <div className="absolute inset-0 bg-astuGreen-500/20 blur-xl rounded-2xl"></div>
          <img src={qrCode} alt="Ticket QR code" className="relative w-52 h-52 rounded-xl" />
        </div>
      )}
      {ticketCode && (
        <div className="text-center">
          <p className="text-xs text-slate-500 mb-1">Booking Code</p>
          <p className="font-mono text-lg tracking-wider text-astu-400 font-bold glow-text">{ticketCode}</p>
        </div>
      )}
    </div>
  );
}
