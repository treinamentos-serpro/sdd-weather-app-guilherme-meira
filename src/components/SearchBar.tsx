import { type FormEvent, useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const inputId = useId();
  const [city, setCity] = useState('');
  const [showEmptyError, setShowEmptyError] = useState(false);
  const errorId = `${inputId}-error`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const normalizedCity = city.trim();
    if (!normalizedCity) {
      setShowEmptyError(true);
      return;
    }

    setShowEmptyError(false);
    onSearch(normalizedCity);
  }

  return (
    <form
      aria-label="Buscar cidade"
      aria-busy={disabled}
      className="flex w-full flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:flex-row sm:items-end"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="min-w-0 flex-1">
        <label className="mb-2 block text-sm font-medium text-white/80" htmlFor={inputId}>
          Nome da cidade
        </label>
        <input
          autoComplete="off"
          aria-describedby={showEmptyError ? errorId : undefined}
          aria-invalid={showEmptyError || undefined}
          className="min-h-12 w-full rounded-lg border border-white/10 bg-night-900/70 px-4 py-3 text-white placeholder:text-white/70 outline-none transition focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id={inputId}
          name="city"
          onChange={(event) => {
            const value = event.target.value;
            setCity(value);
            if (value.trim()) setShowEmptyError(false);
          }}
          placeholder="Ex.: São Paulo"
          type="search"
          value={city}
        />
        {showEmptyError && (
          <p className="mt-2 text-sm text-white/85" id={errorId} role="alert">
            Digite o nome de uma cidade para buscar.
          </p>
        )}
      </div>
      <button
        className="min-h-12 rounded-lg bg-accent-400 px-5 py-3 font-semibold text-night-900 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:bg-accent-400/50 disabled:text-night-900/60 disabled:opacity-70 disabled:hover:bg-accent-400/50"
        disabled={disabled}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
