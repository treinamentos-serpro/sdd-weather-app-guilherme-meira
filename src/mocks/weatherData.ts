import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: '3448439',
    name: 'São Paulo',
    country: 'Brasil',
    administrativeArea: 'São Paulo',
    latitude: -23.5475,
    longitude: -46.6361,
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-10-27T14:00',
    temperatureC: 22.4,
    weatherCode: 2,
    relativeHumidity: 67,
    windSpeedKmh: 13.2,
    precipitationMm: 0.2,
    pressureHpa: 1014.3,
  },
  forecast: [
    {
      date: '2026-10-27',
      weatherCode: 2,
      temperatureMinC: 17.1,
      temperatureMaxC: 25.3,
      precipitationProbability: 10,
    },
    {
      date: '2026-10-28',
      weatherCode: 3,
      temperatureMinC: 16.8,
      temperatureMaxC: 24.7,
      precipitationProbability: 20,
    },
    {
      date: '2026-10-29',
      weatherCode: 61,
      temperatureMinC: 18,
      temperatureMaxC: 22.1,
      precipitationProbability: 75,
    },
    {
      date: '2026-10-30',
      weatherCode: 1,
      temperatureMinC: 17.5,
      temperatureMaxC: 26,
      precipitationProbability: 5,
    },
    {
      date: '2026-10-31',
      weatherCode: 0,
      temperatureMinC: 16.2,
      temperatureMaxC: 27.2,
      precipitationProbability: 0,
    },
  ],
};
