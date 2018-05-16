import Contrition from './Contrition';

describe('[Discipline Module] Contrition', () => {
  it('Calculates overhealing when the estimated amount is greater', () => {
    const overheal = Contrition.calculateOverhealing(150, 50, 50);

    expect(overheal).toBe(100);
  });

  it('Calculates overhealing when the estimated amount is less than the effective healing', () => {
    const overheal = Contrition.calculateOverhealing(20, 50, 50);

    expect(overheal).toBe(0);
  });

  it('Calculates overhealing when the estimated amount is the same as the original', () => {
    const overheal = Contrition.calculateOverhealing(100, 50, 50);

    expect(overheal).toBe(50);
  });
});
