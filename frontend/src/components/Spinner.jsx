export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-gray-500 text-sm py-6 justify-center">
      <span className="w-4 h-4 border-2 border-gray-300 border-t-emerald-700 rounded-full animate-spin" />
      {label}
    </div>
  );
}
