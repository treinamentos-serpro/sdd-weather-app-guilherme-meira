import { describe, expect, it } from 'vitest';
import { getWeatherDescription, getWeatherIcon } from '../../src/lib/weatherCodes';

describe('getWeatherDescription', () => {
  it('retorna a descrição para um código WMO conhecido', () => {
    expect(getWeatherDescription(0)).toBe('Céu limpo');
  });

  it('retorna indisponível para código desconhecido ou nulo', () => {
    expect(getWeatherDescription(1234)).toBe('Condição indisponível');
    expect(getWeatherDescription(null)).toBe('Condição indisponível');
  });
});

describe('getWeatherIcon', () => {
  it('retorna o ícone para um código WMO conhecido', () => {
    expect(getWeatherIcon(0)).toBe('☀️');
  });

  it('retorna null para código desconhecido ou nulo', () => {
    expect(getWeatherIcon(1234)).toBeNull();
    expect(getWeatherIcon(null)).toBeNull();
  });
});
