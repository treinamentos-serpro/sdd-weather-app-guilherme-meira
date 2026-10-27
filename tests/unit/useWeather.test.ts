import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const city: City = {
  id: '123',
  name: 'São Paulo',
  country: 'Brasil',
  administrativeArea: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

const partialWeather: WeatherData = {
  city,
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-10-27T14:00',
    temperatureC: 18.5,
    weatherCode: null,
    relativeHumidity: null,
    windSpeedKmh: null,
    precipitationMm: null,
    pressureHpa: null,
  },
  forecast: null,
};

function makeWeatherData(selectedCity: City): WeatherData {
  return {
    ...partialWeather,
    city: selectedCity,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mantém sucesso e current quando forecast está indisponível', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather).mockResolvedValue(partialWeather);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data?.current?.temperatureC).toBe(18.5);
    expect(result.current.data?.current?.weatherCode).toBeNull();
    expect(result.current.data?.forecast).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('ignora a resposta de uma busca antiga quando a mais recente termina primeiro', async () => {
    const cityA = { ...city, id: 'a', name: 'Cidade A' };
    const cityB = { ...city, id: 'b', name: 'Cidade B' };
    const pendingSearchA = deferred<City[]>();
    const pendingSearchB = deferred<City[]>();
    vi.mocked(searchCities).mockImplementation((name) =>
      name === 'Cidade A' ? pendingSearchA.promise : pendingSearchB.promise,
    );
    vi.mocked(getWeather).mockImplementation(async (selectedCity) => makeWeatherData(selectedCity));

    const { result } = renderHook(() => useWeather());
    let requestA!: Promise<void>;
    let requestB!: Promise<void>;

    act(() => {
      requestA = result.current.search('Cidade A');
    });
    act(() => {
      requestB = result.current.search('Cidade B');
    });

    await act(async () => {
      pendingSearchB.resolve([cityB]);
      await requestB;
    });
    await act(async () => {
      pendingSearchA.resolve([cityA]);
      await requestA;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.query).toBe('Cidade B');
    expect(result.current.cities).toEqual([cityB]);
    expect(result.current.data?.city).toEqual(cityB);
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(cityB);
  });

  it('retry repete a consulta meteorológica da cidade selecionada', async () => {
    vi.mocked(searchCities).mockResolvedValue([city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(
        new Error(
          'Não foi possível conectar à Open-Meteo. Verifique sua conexão e tente novamente.',
        ),
      )
      .mockResolvedValueOnce(partialWeather);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(
      'Não foi possível conectar à Open-Meteo. Verifique sua conexão e tente novamente.',
    );

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledExactlyOnceWith('São Paulo');
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenNthCalledWith(2, city);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(partialWeather);
  });

  it('retry refaz a mesma busca quando o geocoding falha', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(
        new Error(
          'Não foi possível conectar à Open-Meteo. Verifique sua conexão e tente novamente.',
        ),
      )
      .mockResolvedValueOnce([city]);
    vi.mocked(getWeather).mockResolvedValue(partialWeather);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(
      'Não foi possível conectar à Open-Meteo. Verifique sua conexão e tente novamente.',
    );

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenNthCalledWith(1, 'São Paulo');
    expect(searchCities).toHaveBeenNthCalledWith(2, 'São Paulo');
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(partialWeather);
  });
});
