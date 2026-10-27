import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('getDayLabel', () => {
  it('rotula os índices zero e um como hoje e amanhã', () => {
    expect(getDayLabel('2024-06-12', 0)).toBe('Hoje');
    expect(getDayLabel('2024-06-13', 1)).toBe('Amanhã');
  });

  it('usa o dia da semana para índices a partir de dois', () => {
    expect(getDayLabel('2024-06-12', 2)).toBe('Qua');
    expect(getDayLabel('2024-06-15', 4)).toBe('Sáb');
  });
});

describe('getShortDate', () => {
  it('formata dia e mês abreviado em português', () => {
    expect(getShortDate('2024-06-12')).toBe('12 Jun');
    expect(getShortDate('2024-12-01')).toBe('1 Dez');
  });
});
