import { CheckCircle2, Circle } from 'lucide-react';

const checks = [
  ['length', 'At least 8 characters'],
  ['lower', 'A lowercase letter'],
  ['upper', 'An uppercase letter'],
  ['number', 'A number'],
  ['special', 'A special character'],
];

export function getPasswordChecks(password = '') {
  return {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isStrongPassword(password = '') {
  return Object.values(getPasswordChecks(password)).every(Boolean);
}

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const result = getPasswordChecks(password);
  const score = Object.values(result).filter(Boolean).length;
  const label = score === checks.length ? 'Strong password' : score >= 3 ? 'Keep going' : 'Weak password';

  return (
    <div className="mt-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">Password strength</span>
        <span className={`text-xs font-medium ${score === checks.length ? 'text-astuGreen-400' : 'text-amber-300'}`}>{label}</span>
      </div>
      <div className="flex gap-1 mb-2">
        {checks.map(([key]) => <span key={key} className={`h-1.5 flex-1 rounded-full ${result[key] ? 'bg-astuGreen-400' : 'bg-slate-700'}`} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
        {checks.map(([key, text]) => (
          <span key={key} className={`text-[11px] flex items-center gap-1 ${result[key] ? 'text-astuGreen-300' : 'text-slate-500'}`}>
            {result[key] ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />} {text}
          </span>
        ))}
      </div>
    </div>
  );
}