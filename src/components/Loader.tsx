export default function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-astu-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-astu-400 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-transparent border-t-emerald2-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="mt-4 text-slate-400 text-sm">{label}</p>
    </div>
  );
}
