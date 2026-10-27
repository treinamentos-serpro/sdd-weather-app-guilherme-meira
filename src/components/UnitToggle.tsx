import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
      role="group"
    >
      <button
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        className={`min-h-11 min-w-14 rounded-lg px-4 py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
          unit === 'celsius'
            ? 'bg-accent-400 text-night-900'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
        onClick={() => onChange('celsius')}
        type="button"
      >
        °C
      </button>
      <button
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        className={`min-h-11 min-w-14 rounded-lg px-4 py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
          unit === 'fahrenheit'
            ? 'bg-accent-400 text-night-900'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
        onClick={() => onChange('fahrenheit')}
        type="button"
      >
        °F
      </button>
    </div>
  );
}
