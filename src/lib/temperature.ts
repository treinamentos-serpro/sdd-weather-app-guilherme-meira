import type { Unit } from '../types/weather';

export function convertTemperature(temperatureC: number | null, unit: Unit): number | null {
  if (temperatureC === null || !Number.isFinite(temperatureC)) {
    return null;
  }

  return unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(temperatureC: number | null, unit: Unit): string {
  const temperature = convertTemperature(temperatureC, unit);
  if (temperature === null) return 'Indisponível';

  const formattedTemperature = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(temperature);

  return `${formattedTemperature} ${unitLabel(unit)}`;
}
