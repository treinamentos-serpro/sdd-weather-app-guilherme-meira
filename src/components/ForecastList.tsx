import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[] | null;
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="space-y-4">
      <h2 className="text-xl font-semibold text-white" id="forecast-heading">
        Previsão para os próximos dias
      </h2>
      {forecast && forecast.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {forecast.map((day, index) => (
            <ForecastCard day={day} index={index} key={day.date} unit={unit} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/70" role="status">
          Previsão indisponível.
        </p>
      )}
    </section>
  );
}
