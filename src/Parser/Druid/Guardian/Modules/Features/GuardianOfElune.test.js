import { damageTaken, buffsApplied, SimpleFight } from 'tests/Parser/Guardian/Fixtures/SimpleFight';
import processEvents from 'tests/Parser/Guardian/Fixtures/processEvents';

import GuardianOfElune from './GuardianOfElune';

describe('Features.GuardianOfElune', () => {
  let guardian;
  beforeEach(() => {
    guardian = new GuardianOfElune({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    });
  });
  it('trach GoE procs with no events', () => {
    expect(guardian.GoEProcsTotal).toBe(0);
  });
  it('trach GoE procs with only damage events', () => {
    processEvents(damageTaken, guardian);
    expect(guardian.GoEProcsTotal).toBe(0);
  });
  it('track GoE procs with only buffs applied', () => {
    processEvents(buffsApplied, guardian);
    expect(guardian.GoEProcsTotal).toBe(2);
  });
  it('track GoE procs over a simple fight', () => {
    processEvents(SimpleFight, guardian);
    expect(guardian.GoEProcsTotal).toBe(2);
  });
  it('track consumed GoE procs over a simple fight', () => {
    processEvents(SimpleFight, guardian);
    expect(guardian.consumedGoEProc).toBe(1);
  });
  it('track last proc time', () => {
    processEvents(SimpleFight, guardian);
    expect(guardian.lastGoEProcTime).toBe(11500);
  });
});
