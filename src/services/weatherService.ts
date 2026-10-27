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

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
}

async function fetchWithTimeout<T>(
  url: string,
  handleResponse: (response: Response) => Promise<T>,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (isAbortError(error)) {
      throw new WeatherServiceError(
        'A requisição excedeu o limite de 10 segundos. Tente novamente.',
      );
    }

    throw new WeatherServiceError(
      'Não foi possível conectar à Open-Meteo. Verifique sua conexão e tente novamente.',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch (error) {
    if (isAbortError(error) || error instanceof TypeError) throw error;

    throw new WeatherServiceError(
      'A resposta da Open-Meteo está em formato inválido. Tente novamente.',
      response.status,
    );
  }
}

type JsonRecord = Record<string, unknown>;

function recordValue(value: unknown): JsonRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
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

function cityFromGeocodingResult(value: unknown): City | null {
  const result = recordValue(value);
  if (!result) return null;

  const name = stringValue(result.name);
  const latitude = finiteNumber(result.latitude);
  const longitude = finiteNumber(result.longitude);
  if (!name?.trim() || latitude === null || longitude === null) return null;

  const externalId = result.id;
  const hasExternalId =
    (typeof externalId === 'string' && externalId.trim().length > 0) ||
    (typeof externalId === 'number' && Number.isFinite(externalId));

  return {
    id: hasExternalId ? String(externalId) : `${latitude},${longitude}`,
    name,
    country: stringValue(result.country),
    administrativeArea: stringValue(result.admin1),
    latitude,
    longitude,
    timezone: stringValue(result.timezone),
  };
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
  return fetchWithTimeout(
    url,
    async (response) => {
      if (!response.ok) {
        throw new WeatherServiceError(
          `Não foi possível buscar cidades (HTTP ${response.status}). Tente novamente.`,
          response.status,
        );
      }

      const data = recordValue(await parseJson<unknown>(response));
      const results: unknown[] = Array.isArray(data?.results) ? data.results.slice(0, 5) : [];

      return results.flatMap((result) => {
        const city = cityFromGeocodingResult(result);
        return city ? [city] : [];
      });
    },
    { cache: 'no-store' },
  );
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
  return fetchWithTimeout(
    `${FORECAST_URL}?${params.toString()}`,
    async (response) => {
      if (!response.ok) {
        throw new WeatherServiceError(
          `Não foi possível carregar a previsão (HTTP ${response.status}). Tente novamente.`,
          response.status,
        );
      }

      const data = recordValue(await parseJson<unknown>(response));
      if (!data) {
        throw new WeatherServiceError('A resposta da previsão está incompleta. Tente novamente.');
      }

      const current = recordValue(data.current);
      const daily = recordValue(data.daily);

      if (!current && !daily) {
        throw new WeatherServiceError('A resposta da previsão está incompleta. Tente novamente.');
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
    },
    { cache: 'no-store' },
  );
}
