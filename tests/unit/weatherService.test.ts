import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: '123',
  name: 'São Paulo',
  country: 'Brasil',
  administrativeArea: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

function makeResponse(payload: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

describe('searchCities', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('retorna lista vazia sem chamar fetch para entrada vazia', async () => {
    await expect(searchCities('  \t ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mapeia os resultados para City e codifica o nome na URL', async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.5475,
            longitude: -46.6361,
            country: 'Brasil',
            admin1: 'São Paulo',
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    );

    await expect(searchCities('  São Paulo  ')).resolves.toEqual([cityWithCoordinates()]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('name=S%C3%A3o%20Paulo'),
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('normaliza campos geográficos opcionais e ignora resultados inválidos', async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        results: [
          { id: 5, name: null, latitude: 10, longitude: 20 },
          { id: 6, name: 'Sem coordenadas', latitude: null, longitude: 20 },
          { name: 'Localidade parcial', latitude: 10.5, longitude: -20.25 },
          null,
        ],
      }),
    );

    await expect(searchCities('Localidade')).resolves.toEqual([
      {
        id: '10.5,-20.25',
        name: 'Localidade parcial',
        country: null,
        administrativeArea: null,
        latitude: 10.5,
        longitude: -20.25,
        timezone: null,
      },
    ]);
  });

  it('preserva a ordem recebida e limita os resultados aos cinco primeiros', async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        results: Array.from({ length: 6 }, (_, index) => ({
          id: index + 1,
          name: `Cidade ${index + 1}`,
          latitude: index,
          longitude: -index,
        })),
      }),
    );

    const results = await searchCities('Cidades');

    expect(results.map((result) => result.id)).toEqual(['1', '2', '3', '4', '5']);
    expect(results.map((result) => result.name)).toEqual([
      'Cidade 1',
      'Cidade 2',
      'Cidade 3',
      'Cidade 4',
      'Cidade 5',
    ]);
  });

  it('preserva apóstrofos e hífens no nome enviado', async () => {
    fetchMock.mockResolvedValue(makeResponse({ results: [] }));

    await searchCities("O'Fallon-Aix-en-Provence");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("name=O'Fallon-Aix-en-Provence"),
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('retorna lista vazia quando results está ausente', async () => {
    fetchMock.mockResolvedValue(makeResponse({ generationtime_ms: 0.1 }));

    await expect(searchCities('Cidade inexistente')).resolves.toEqual([]);
  });

  it('lança WeatherServiceError para resposta HTTP não-ok', async () => {
    fetchMock.mockResolvedValue(makeResponse({ reason: 'Falha' }, 503));

    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('converte falha de rede em WeatherServiceError', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível conectar à Open-Meteo. Verifique sua conexão e tente novamente.',
    });
  });

  it('converte timeout em WeatherServiceError', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: RequestInfo | URL, options?: RequestInit) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            const abortError = new Error('aborted');
            abortError.name = 'AbortError';
            reject(abortError);
          });
        }),
    );

    const pendingRequest = searchCities('São Paulo');
    const expectedError = expect(pendingRequest).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A requisição excedeu o limite de 10 segundos. Tente novamente.',
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await expectedError;
  });

  it('mantém o timeout ativo durante a leitura do JSON', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: RequestInfo | URL, options?: RequestInit) =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: vi.fn(
            () =>
              new Promise((_resolve, reject) => {
                options?.signal?.addEventListener('abort', () => {
                  const abortError = new Error('aborted');
                  abortError.name = 'AbortError';
                  reject(abortError);
                });
              }),
          ),
        }) as unknown as Response,
    );

    const pendingRequest = searchCities('São Paulo');
    const expectedError = expect(pendingRequest).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A requisição excedeu o limite de 10 segundos. Tente novamente.',
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await expectedError;
  });
});

describe('getWeather', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mapeia current e arrays paralelos de daily para cinco dias', async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-10-27T14:00',
          temperature_2m: 22.4,
          weather_code: 2,
          relative_humidity_2m: 67,
          wind_speed_10m: 13.2,
          precipitation: null,
          pressure_msl: 1014.3,
        },
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
          weather_code: [2, 3, 61, 1, 0],
          temperature_2m_min: [17.1, 16.8, 18, 17.5, 16.2],
          temperature_2m_max: [25.3, 24.7, 22.1, 26, 27.2],
          precipitation_probability_max: [null, 20, 75, 5, 0],
        },
      }),
    );

    const result = await getWeather(city);

    expect(result.city).toEqual(city);
    expect(result.current).toEqual({
      time: '2026-10-27T14:00',
      temperatureC: 22.4,
      weatherCode: 2,
      relativeHumidity: 67,
      windSpeedKmh: 13.2,
      precipitationMm: null,
      pressureHpa: 1014.3,
    });
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast?.[0]).toEqual({
      date: '2026-10-27',
      weatherCode: 2,
      temperatureMinC: 17.1,
      temperatureMaxC: 25.3,
      precipitationProbability: null,
    });
    expect(result.forecast?.[4]).toEqual({
      date: '2026-10-31',
      weatherCode: 0,
      temperatureMinC: 16.2,
      temperatureMaxC: 27.2,
      precipitationProbability: 0,
    });

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ cache: 'no-store' }),
    );
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
    expect(requestUrl.searchParams.get('temperature_unit')).toBe('celsius');
    expect(requestUrl.searchParams.get('timezone')).toBe('auto');
  });

  it('lança WeatherServiceError para falha HTTP no forecast', async () => {
    fetchMock.mockResolvedValue(makeResponse({ reason: 'Falha do provedor' }, 503));

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('converte JSON inválido em WeatherServiceError', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
    });

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A resposta da Open-Meteo está em formato inválido. Tente novamente.',
    });
  });

  it('preserva current quando daily está ausente', async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        timezone: 'America/Sao_Paulo',
        current: { time: '2026-10-27T14:00', temperature_2m: 18.5, weather_code: null },
      }),
    );

    const result = await getWeather(city);

    expect(result.current?.temperatureC).toBe(18.5);
    expect(result.current?.weatherCode).toBeNull();
    expect(result.forecast).toBeNull();
  });

  it('preserva daily quando current está ausente', async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        timezone: 'America/Sao_Paulo',
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
          weather_code: [0, 1, 2, 3, 61],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [10, 11, 12, 13, 14],
          precipitation_probability_max: [0, 10, 20, 30, 80],
        },
      }),
    );

    const result = await getWeather(city);

    expect(result.current).toBeNull();
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast?.[0].temperatureMaxC).toBe(10);
  });

  it('preserva a condição indisponível quando só o código WMO está ausente', async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        current: { time: '2026-10-27T14:00', temperature_2m: 18.5, weather_code: null },
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
        },
      }),
    );

    const result = await getWeather(city);

    expect(result.current?.temperatureC).toBe(18.5);
    expect(result.current?.weatherCode).toBeNull();
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast?.every((day) => day.weatherCode === null)).toBe(true);
  });

  it('preenche os dias ausentes como indisponíveis sem descartar os disponíveis', async () => {
    fetchMock.mockResolvedValue(
      makeResponse({
        current: { time: '2026-10-27T14:00', temperature_2m: 18.5 },
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29'],
          weather_code: [0, 1, 2],
          temperature_2m_min: [8, 9, 10],
          temperature_2m_max: [18, 19, 20],
          precipitation_probability_max: [0, 10, 20],
        },
      }),
    );

    const result = await getWeather(city);

    expect(result.forecast).toHaveLength(5);
    expect(result.forecast?.[2]).toMatchObject({
      date: '2026-10-29',
      temperatureMinC: 10,
      temperatureMaxC: 20,
    });
    expect(result.forecast?.[3]).toEqual({
      date: '2026-10-30',
      weatherCode: null,
      temperatureMinC: null,
      temperatureMaxC: null,
      precipitationProbability: null,
    });
    expect(result.forecast?.[4].date).toBe('2026-10-31');
  });

  it('lança WeatherServiceError quando current e daily estão ausentes', async () => {
    fetchMock.mockResolvedValue(makeResponse({ current: null, daily: null }));

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });
});

function cityWithCoordinates(): City {
  return {
    ...city,
    id: '3448439',
    latitude: -23.5475,
    longitude: -46.6361,
  };
}
