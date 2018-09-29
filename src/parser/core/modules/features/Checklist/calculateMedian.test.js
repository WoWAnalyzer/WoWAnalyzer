import calculateMedian from './calculateMedian';

describe('calculateEffectiveHealing', () => {
  test('finds the median of unsorted arrays', () => {
    expect(calculateMedian([
      5,
      6,
      1000,
      4,
      1,
    ])).toBe(5);
  });
  test('on even-length arrays it gets the average of the middle two numbers', () => {
    expect(calculateMedian([
      5,
      6,
      1000,
      4,
      1,
      7,
    ])).toBe(5.5);
  });
  test('on a single item returns just that item', () => {
    expect(calculateMedian([
      5,
    ])).toBe(5);
  });
  test('does not alter the original array', () => {
    const arr = [
      5,
      6,
      1000,
      4,
      1,
      7,
    ];
    const duplicate = [...arr];
    calculateMedian(arr);
    expect(arr).toEqual(duplicate);
  });
});
