import type { Unit } from '../types/weather';

export function formatTemperature(temperatureC: number | null, unit: Unit): string {
  if (temperatureC === null || !Number.isFinite(temperatureC)) {
    return 'Indisponível';
  }

  const temperature = unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';
  const formattedTemperature = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(temperature);

  return `${formattedTemperature} ${symbol}`;
}
