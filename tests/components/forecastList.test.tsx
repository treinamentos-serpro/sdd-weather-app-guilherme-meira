import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import UnitToggle from '../../src/components/UnitToggle';
import type { ForecastDay, Unit } from '../../src/types/weather';

const forecast: ForecastDay[] = [
  {
    date: '2026-10-27',
    weatherCode: 0,
    temperatureMinC: 0,
    temperatureMaxC: 100,
    precipitationProbability: 0,
  },
];

function ForecastUnitHarness() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <ForecastList forecast={forecast} unit={unit} />
    </>
  );
}

describe('ForecastList e UnitToggle', () => {
  it('converte máxima e mínima diárias ao alternar para Fahrenheit', async () => {
    const user = userEvent.setup();
    render(<ForecastUnitHarness />);

    expect(screen.getByText('100,0 °C')).toBeInTheDocument();
    expect(screen.getByText('0,0 °C')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('212,0 °F')).toBeInTheDocument();
    expect(screen.getByText('32,0 °F')).toBeInTheDocument();
  });
});
