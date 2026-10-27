import type { City, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    const errorName =
      typeof error === 'object' && error !== null && 'name' in error ? error.name : undefined;

    if (errorName === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.');
    }

    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new WeatherServiceError('A resposta do serviço Open-Meteo é inválida.', response.status);
  }
}

interface GeocodingResult {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastCurrent {
  time?: unknown;
  temperature_2m?: unknown;
  weather_code?: unknown;
  relative_humidity_2m?: unknown;
  wind_speed_10m?: unknown;
  precipitation?: unknown;
  pressure_msl?: unknown;
}

interface ForecastDaily {
  time?: unknown;
  weather_code?: unknown;
  temperature_2m_min?: unknown;
  temperature_2m_max?: unknown;
  precipitation_probability_max?: unknown;
}

interface ForecastResponse {
  timezone?: unknown;
  current?: ForecastCurrent | null;
  daily?: ForecastDaily | null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function valueAt(values: unknown, index: number): unknown {
  return Array.isArray(values) ? values[index] : null;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

function dateFromCurrentTime(time: unknown): string | null {
  if (typeof time !== 'string') return null;
  const date = time.slice(0, 10);
  return isIsoDate(date) ? date : null;
}

function addCalendarDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + days));
  const nextYear = String(nextDate.getUTCFullYear()).padStart(4, '0');
  const nextMonth = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(nextDate.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export async function searchCities(name: string): Promise<City[]> {
  const normalizedName = name.trim();
  if (!normalizedName) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(normalizedName)}&count=5&language=pt&format=json`;
  const response = await fetchWithTimeout(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new WeatherServiceError(
      `Não foi possível buscar cidades (HTTP ${response.status}).`,
      response.status,
    );
  }

  const data = await parseJson<GeocodingResponse>(response);
  const results = Array.isArray(data.results) ? data.results.slice(0, 5) : [];

  return results.map((result) => ({
    id: String(result.id ?? `${result.latitude},${result.longitude}`),
    name: result.name,
    country: result.country ?? null,
    administrativeArea: result.admin1 ?? null,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone ?? null,
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,pressure_msl',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: 'celsius',
  });
  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new WeatherServiceError(
      `Não foi possível carregar a previsão (HTTP ${response.status}).`,
      response.status,
    );
  }

  const data = await parseJson<ForecastResponse | null>(response);
  if (!data || typeof data !== 'object') {
    throw new WeatherServiceError('A resposta do serviço de previsão está incompleta.');
  }

  const current =
    data.current && typeof data.current === 'object' && !Array.isArray(data.current)
      ? data.current
      : null;
  const daily =
    data.daily && typeof data.daily === 'object' && !Array.isArray(data.daily) ? data.daily : null;

  if (!current && !daily) {
    throw new WeatherServiceError('A resposta do serviço de previsão está incompleta.');
  }

  const dailyTimes = daily && Array.isArray(daily.time) ? daily.time : [];
  const currentDate = dateFromCurrentTime(current?.time);
  const firstDailyDate = dailyTimes.find(isIsoDate);
  const firstDate = currentDate ?? firstDailyDate ?? null;
  const forecast =
    daily && firstDate
      ? Array.from({ length: 5 }, (_, index) => {
          const date = addCalendarDays(firstDate, index);
          const sourceIndex = dailyTimes.indexOf(date);

          return {
            date,
            weatherCode: finiteNumber(valueAt(daily.weather_code, sourceIndex)),
            temperatureMinC: finiteNumber(valueAt(daily.temperature_2m_min, sourceIndex)),
            temperatureMaxC: finiteNumber(valueAt(daily.temperature_2m_max, sourceIndex)),
            precipitationProbability: finiteNumber(
              valueAt(daily.precipitation_probability_max, sourceIndex),
            ),
          };
        })
      : null;

  return {
    city,
    timezone: stringValue(data.timezone) ?? city.timezone,
    current: current
      ? {
          time: stringValue(current.time),
          temperatureC: finiteNumber(current.temperature_2m),
          weatherCode: finiteNumber(current.weather_code),
          relativeHumidity: finiteNumber(current.relative_humidity_2m),
          windSpeedKmh: finiteNumber(current.wind_speed_10m),
          precipitationMm: finiteNumber(current.precipitation),
          pressureHpa: finiteNumber(current.pressure_msl),
        }
      : null,
    forecast,
  };
}
