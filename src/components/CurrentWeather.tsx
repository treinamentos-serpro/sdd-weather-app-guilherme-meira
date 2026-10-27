import { useId } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherDescription, getWeatherIcon } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

interface MetricProps {
  label: string;
  unit: string;
  value: number | null;
}

function Metric({ label, unit, value }: MetricProps) {
  const formattedValue =
    value === null || !Number.isFinite(value)
      ? 'Indisponível'
      : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)} ${unit}`;

  return (
    <div className="min-w-0">
      <dt className="text-sm text-white/70">{label}</dt>
      <dd className="mt-1 break-words text-lg font-semibold text-white">{formattedValue}</dd>
    </div>
  );
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const weatherIcon = getWeatherIcon(current.weatherCode);

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md sm:p-8"
    >
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-sm font-medium text-white/70" id={headingId}>
            Clima atual
          </h2>
          <h3 className="mt-1 text-2xl font-semibold text-white">{city.name}</h3>
          {city.country && <p className="mt-1 text-sm text-white/70">{city.country}</p>}
        </div>

        <div className="flex min-w-0 items-center gap-4">
          <span aria-hidden="true" className="text-5xl sm:text-6xl">
            {weatherIcon ?? '—'}
          </span>
          <div className="min-w-0">
            <p className="break-words text-4xl font-semibold leading-none text-white sm:text-6xl">
              {formatTemperature(current.temperatureC, unit)}
            </p>
            <p className="mt-2 text-base text-white/80">
              {getWeatherDescription(current.weatherCode)}
            </p>
          </div>
        </div>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-5 sm:grid-cols-4">
        <Metric label="Umidade" value={current.relativeHumidity} unit="%" />
        <Metric label="Vento" value={current.windSpeedKmh} unit="km/h" />
        <Metric label="Precipitação" value={current.precipitationMm} unit="mm" />
        <Metric label="Pressão" value={current.pressureHpa} unit="hPa" />
      </dl>
    </section>
  );
}
