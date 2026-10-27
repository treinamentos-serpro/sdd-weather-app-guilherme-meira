import { getDayLabel, getShortDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherDescription, getWeatherIcon } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

function formatProbability(probability: number | null): string {
  if (
    probability === null ||
    !Number.isFinite(probability) ||
    probability < 0 ||
    probability > 100
  ) {
    return 'Indisponível';
  }

  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(probability)}%`;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const dayLabel = getDayLabel(day.date, index);
  const weatherIcon = getWeatherIcon(day.weatherCode);

  return (
    <article
      aria-label={`${dayLabel}, ${getShortDate(day.date)}`}
      className="flex min-w-0 flex-col rounded-xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md"
    >
      <header>
        <h3 className="font-semibold text-white">{dayLabel}</h3>
        <time className="text-sm text-white/70" dateTime={day.date}>
          {getShortDate(day.date)}
        </time>
      </header>

      <div className="my-4 flex min-h-20 flex-col items-center justify-center text-center">
        <span aria-hidden="true" className="text-4xl">
          {weatherIcon ?? '—'}
        </span>
        <p className="mt-2 text-sm text-white/70">{getWeatherDescription(day.weatherCode)}</p>
      </div>

      <dl className="mt-auto space-y-2 border-t border-white/10 pt-3 text-sm">
        <div className="flex items-start justify-between gap-2">
          <dt className="text-white/70">Máx.</dt>
          <dd className="min-w-0 break-words text-right font-medium text-white">
            {formatTemperature(day.temperatureMaxC, unit)}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-2">
          <dt className="text-white/70">Mín.</dt>
          <dd className="min-w-0 break-words text-right font-medium text-white">
            {formatTemperature(day.temperatureMinC, unit)}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-2">
          <dt className="text-white/70">Chuva</dt>
          <dd className="min-w-0 break-words text-right font-medium text-white">
            {formatProbability(day.precipitationProbability)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
