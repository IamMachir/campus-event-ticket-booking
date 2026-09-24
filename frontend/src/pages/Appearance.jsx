import { Check, Moon, Palette, Sun, Sparkles } from 'lucide-react';
import { useAppearance } from '../context/AppearanceContext';

const icons = {
  default: Sparkles,
  dark: Moon,
  white: Sun,
};

export default function Appearance() {
  const { appearance, changeAppearance, options } = useAppearance();

  return (
    <main className="min-h-screen px-4 pt-24 pb-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-astu-300 text-sm mb-3">
          <Palette className="w-4 h-4" /> Personalize your experience
        </div>
        <h1 className="font-display font-bold text-3xl text-slate-100">Appearance</h1>
        <p className="text-slate-400 mt-1">Choose how CampusEvents looks on this device.</p>
      </div>

      <section className="glass-card p-5" aria-labelledby="appearance-options">
        <h2 id="appearance-options" className="font-display font-semibold text-slate-100 mb-4">
          Theme
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {options.map((option) => {
            const Icon = icons[option.value];
            const selected = appearance === option.value;
            return (
              <button
                type="button"
                key={option.value}
                aria-pressed={selected}
                onClick={() => changeAppearance(option.value)}
                className={`relative text-left rounded-2xl border p-5 transition-all ${
                  selected
                    ? 'border-astu-400/70 bg-astu-500/15 shadow-lg shadow-astu-500/10'
                    : 'border-white/10 bg-white/5 hover:border-astu-400/40 hover:bg-white/10'
                }`}
              >
                {selected && (
                  <span className="absolute top-4 right-4 inline-flex items-center justify-center rounded-full bg-astu-500 p-1 text-white">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-astu-500/20 to-astuGreen-500/20 text-astu-300 mb-4">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="block font-medium text-slate-100">{option.label}</span>
                <span className="block text-sm text-slate-400 mt-2 leading-relaxed">{option.description}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-5">Your choice is saved automatically in this browser.</p>
      </section>
    </main>
  );
}