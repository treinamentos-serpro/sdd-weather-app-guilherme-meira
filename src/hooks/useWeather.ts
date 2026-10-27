import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation = { type: 'search'; name: string } | { type: 'weather'; city: City };

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Ocorreu um erro inesperado.';
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | null>(null);

  useEffect(() => {
    return () => {
      requestId.current += 1;
    };
  }, []);

  async function loadWeather(city: City, activeRequestId: number) {
    lastOperation.current = { type: 'weather', city };

    try {
      const weather = await getWeather(city);
      if (requestId.current !== activeRequestId) return;

      setData(weather);
      setError(null);
      setStatus('success');
    } catch (requestError) {
      if (requestId.current !== activeRequestId) return;

      setData(null);
      setError(getErrorMessage(requestError));
      setStatus('error');
    }
  }

  async function search(name: string) {
    const normalizedName = name.trim();
    const activeRequestId = ++requestId.current;

    setQuery(normalizedName);
    setData(null);
    setCities([]);
    setError(null);

    if (!normalizedName) {
      lastOperation.current = null;
      setStatus('idle');
      return;
    }

    lastOperation.current = { type: 'search', name: normalizedName };
    setStatus('loading');

    try {
      const results = await searchCities(normalizedName);
      if (requestId.current !== activeRequestId) return;

      setCities(results);
      if (results.length === 0) {
        lastOperation.current = null;
        setStatus('empty');
        return;
      }

      await loadWeather(results[0], activeRequestId);
    } catch (requestError) {
      if (requestId.current !== activeRequestId) return;

      setError(getErrorMessage(requestError));
      setStatus('error');
    }
  }

  async function selectCity(city: City) {
    const activeRequestId = ++requestId.current;
    setData(null);
    setError(null);
    setStatus('loading');
    await loadWeather(city, activeRequestId);
  }

  async function retry() {
    const operation = lastOperation.current;
    if (!operation) return;

    if (operation.type === 'search') {
      await search(operation.name);
      return;
    }

    await selectCity(operation.city);
  }

  return {
    status,
    data,
    cities,
    error,
    query,
    search,
    selectCity,
    retry,
  };
}
