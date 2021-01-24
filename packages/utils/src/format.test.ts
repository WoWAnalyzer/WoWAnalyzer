import { formatThousands, formatDuration } from './format';

describe('formatThousands', () => {
  test('regular values', () => {
    expect(formatThousands(0)).toBe('0');
    expect(formatThousands(1)).toBe('1');
    expect(formatThousands(999)).toBe('999');
    expect(formatThousands(1000)).toBe('1,000');
    expect(formatThousands(1000000)).toBe('1,000,000');
  });
  test('decimals', () => {
    expect(formatThousands(0.5)).toBe('1');
    expect(formatThousands(1000.0)).toBe('1,000');
    expect(formatThousands(1000.4)).toBe('1,000');
    expect(formatThousands(1000.5)).toBe('1,001');
  });
});
describe('formatDuration', () => {
  test('regular values', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(1)).toBe('0:01');
    expect(formatDuration(10)).toBe('0:10');
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(61)).toBe('1:01');
    expect(formatDuration(120)).toBe('2:00');
  });
  test('decimal values', () => {
    expect(formatDuration(9.9)).toBe('0:09');
    expect(formatDuration(59.9)).toBe('0:59');
  });
  test('decimals', () => {
    expect(formatDuration(1, 1)).toBe('0:01.0');
    expect(formatDuration(9.9, 1)).toBe('0:09.9');
    expect(formatDuration(59.9, 1)).toBe('0:59.9');
    expect(formatDuration(59.9, 1)).toBe('0:59.9');
    expect(formatDuration(60, 1)).toBe('1:00.0');
    expect(formatDuration(9.9, 2)).toBe('0:09.90');
    expect(formatDuration(9.987, 2)).toBe('0:09.98');
    expect(formatDuration(9.987, 3)).toBe('0:09.987');
    expect(formatDuration(9.987, 0)).toBe('0:09');
  });
});
