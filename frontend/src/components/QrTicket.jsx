export default function QrTicket({ qrCode, ticketCode }) {
  if (!qrCode) return null;

  return (
    <div className="flex flex-col items-center gap-3 border rounded-xl p-4 bg-white">
      <img src={qrCode} alt="Ticket QR code" className="w-52 h-52" />
      <p className="font-mono text-sm tracking-wider text-gray-700">{ticketCode}</p>
    </div>
  );
}
