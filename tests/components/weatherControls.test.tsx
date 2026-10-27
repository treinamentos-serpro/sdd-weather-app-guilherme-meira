import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import SearchBar from '../../src/components/SearchBar';
import UnitToggle from '../../src/components/UnitToggle';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../../src/types/weather';

const city: City = {
  id: '123',
  name: 'São Paulo',
  country: 'Brasil',
  administrativeArea: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

const current: CurrentWeatherData = {
  time: '2026-10-27T14:00',
  temperatureC: 0,
  weatherCode: 0,
  relativeHumidity: 50,
  windSpeedKmh: 10,
  precipitationMm: 0,
  pressureHpa: 1013,
};

function WeatherTemperatureHarness() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={city} current={current} unit={unit} />
    </>
  );
}

describe('SearchBar', () => {
  it('não chama onSearch quando o input está vazio', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade para buscar.');
    expect(screen.getByLabelText('Nome da cidade')).toHaveAttribute('aria-invalid', 'true');
  });

  it('não chama onSearch quando o input contém apenas espaços', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Nome da cidade'), '   ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade para buscar.');
  });

  it('limpa o erro ao digitar e expõe o estado disabled como aria-busy', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nome da cidade'), 'Recife');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nome da cidade')).not.toHaveAttribute('aria-invalid', 'true');

    rerender(<SearchBar onSearch={onSearch} disabled />);

    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByLabelText('Nome da cidade')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });

  it('chama onSearch com o termo aparado', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Nome da cidade'), '  São Tomé  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Tomé');
  });
});

describe('UnitToggle e CurrentWeather', () => {
  it('exibe 32,0 °F ao alternar de Celsius para Fahrenheit com 0 °C', async () => {
    const user = userEvent.setup();
    render(<WeatherTemperatureHarness />);

    expect(screen.getByText('0,0 °C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('32,0 °F')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('exibe fallbacks para campos atuais nulos ou não finitos', () => {
    render(
      <CurrentWeather
        city={city}
        current={{
          ...current,
          temperatureC: Number.NaN,
          weatherCode: null,
          relativeHumidity: null,
          windSpeedKmh: Number.NaN,
          precipitationMm: null,
          pressureHpa: null,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getAllByText('Indisponível')).toHaveLength(5);
    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|undefined/)).not.toBeInTheDocument();
  });
});
