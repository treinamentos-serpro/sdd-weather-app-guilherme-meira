import { type FormEvent, useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const inputId = useId();
  const [city, setCity] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCity = city.trim();
    if (!normalizedCity || disabled) return;

    onSearch(normalizedCity);
  }

  return (
    <form
      aria-label="Buscar cidade"
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
          className="min-h-12 w-full rounded-lg border border-white/10 bg-night-900/70 px-4 py-3 text-white placeholder:text-white/70 outline-none transition focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id={inputId}
          name="city"
          onChange={(event) => setCity(event.target.value)}
          placeholder="Ex.: São Paulo"
          required
          type="search"
          value={city}
        />
      </div>
      <button
        className="min-h-12 rounded-lg bg-accent-400 px-5 py-3 font-semibold text-night-900 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
