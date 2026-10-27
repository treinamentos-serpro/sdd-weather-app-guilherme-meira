import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import type { City, WeatherData } from '../../src/types/weather';

const { useWeatherMock } = vi.hoisted(() => ({ useWeatherMock: vi.fn() }));

vi.mock('../../src/hooks/useWeather', () => ({
  useWeather: useWeatherMock,
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

describe('App com dados parciais', () => {
  it('mantém o clima atual visível quando a previsão está indisponível', () => {
    useWeatherMock.mockReturnValue({
      status: 'success',
      data: partialWeather,
      cities: [city],
      error: null,
      query: 'São Paulo',
      search: vi.fn(),
      selectCity: vi.fn(),
      retry: vi.fn(),
    });

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Clima atual' })).toBeVisible();
    expect(screen.getByText('18,5 °C')).toBeVisible();
    expect(screen.getByText('Condição indisponível')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
    expect(screen.getByText('Previsão indisponível.')).toBeVisible();
  });

  it('marca o conteúdo como ocupado e move o foco ao resultado após loading', () => {
    const hookActions = {
      search: vi.fn(),
      selectCity: vi.fn(),
      retry: vi.fn(),
    };
    useWeatherMock.mockReturnValue({
      status: 'loading',
      data: null,
      cities: [],
      error: null,
      query: 'São Paulo',
      ...hookActions,
    });

    const { rerender } = render(<App />);
    const main = screen.getByRole('main', { name: 'Resultado da busca' });
    expect(main).toHaveAttribute('aria-busy', 'true');

    useWeatherMock.mockReturnValue({
      status: 'success',
      data: partialWeather,
      cities: [city],
      error: null,
      query: 'São Paulo',
      ...hookActions,
    });
    rerender(<App />);

    expect(main).toHaveAttribute('aria-busy', 'false');
    expect(main).toHaveFocus();
  });
});
