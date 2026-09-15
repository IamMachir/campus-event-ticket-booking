import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  required = true,
  autoComplete,
  className = '',
}) {
  const [visible, setVisible] = useState(false);

  function showPassword() {
    setVisible(true);
  }

  function hidePassword() {
    setVisible(false);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type={visible ? 'text' : 'password'}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-2.5 text-slate-200 placeholder-slate-500 focus:border-astu-400/40 focus:outline-none transition-colors ${className}`}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          title="Press and hold to show password"
          onPointerDown={showPassword}
          onPointerUp={hidePassword}
          onPointerLeave={hidePassword}
          onPointerCancel={hidePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-astu-400 transition-colors"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}