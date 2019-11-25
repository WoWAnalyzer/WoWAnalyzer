import calculateEffectiveHealing from './calculateEffectiveHealing';

describe('calculateEffectiveHealing', () => {
  test('no overhealing', () => {
    expect(calculateEffectiveHealing({
      amount: 1150,
      overheal: 0,
    }, 0.15)).toBeCloseTo(150, 5);
  });
  test('partial overhealing', () => {
    expect(calculateEffectiveHealing({
      amount: 1100,
      overheal: 50,
    }, 0.15)).toBeCloseTo(100, 5);
  });
  test('full overhealing', () => {
    expect(calculateEffectiveHealing({
      amount: 1000,
      overheal: 150,
    }, 0.15)).toBe(0);
  });
  test('more than full overhealing', () => {
    expect(calculateEffectiveHealing({
      amount: 950,
      overheal: 200,
    }, 0.15)).toBe(0);
  });
  test('0 healing increase', () => {
    expect(calculateEffectiveHealing({
      amount: 1150,
      overheal: 0,
    }, 0)).toBe(0);
    expect(calculateEffectiveHealing({
      amount: 1150,
      overheal: 50,
    }, 0)).toBe(0);
  });
  test('completely overhealed', () => {
    expect(calculateEffectiveHealing({
      amount: 0,
      overheal: 1150,
    }, 0.15)).toBe(0);
  });
  test('absorbs', () => {
    expect(calculateEffectiveHealing({
      amount: 950,
      absorbed: 200,
      overheal: 0,
    }, 0.15)).toBeCloseTo(150, 5);
  });
});
