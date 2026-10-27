import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it('converte 0 °C para 32 °F', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
  });

  it('converte 100 °C para 212 °F', () => {
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
  });

  it('converte -40 °C para -40 °F', () => {
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('mantém o valor em Celsius quando a unidade é celsius', () => {
    expect(convertTemperature(18.5, 'celsius')).toBe(18.5);
  });

  it('retorna null para uma temperatura indisponível', () => {
    expect(convertTemperature(null, 'fahrenheit')).toBeNull();
  });
});

describe('formatTemperature', () => {
  it('arredonda e exibe a vírgula e o símbolo Celsius', () => {
    expect(formatTemperature(20.26, 'celsius')).toBe('20,3 °C');
  });

  it('converte, arredonda e exibe o símbolo Fahrenheit', () => {
    expect(formatTemperature(22.4, 'fahrenheit')).toBe('72,3 °F');
  });

  it('indica temperatura indisponível', () => {
    expect(formatTemperature(null, 'celsius')).toBe('Indisponível');
  });
});

describe('unitLabel', () => {
  it('retorna o símbolo da unidade selecionada', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
