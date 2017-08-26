import GuardianOfElune from 'Parser/GuardianDruid/Modules/Features/GuardianOfElune';
import { damageTaken, buffsApplied, SimpleFight } from './Fixtures/SimpleFight';
import { processEvents } from './Fixtures/processEvents';

describe('Features.GuardianOfElune', () => {
  let guardian;
  beforeEach(() => {
    guardian = new GuardianOfElune();
  });
  it('trach GoE procs with no events', () => {
    expect(guardian.GoEProcsTotal).toBe(0);
  });
  it('trach GoE procs with only damage events', () => {
    processEvents(damageTaken, guardian);
    expect(guardian.GoEProcsTotal).toBe(0);
  });
  it('track GoE procs with only buffs applied', () => {
    const guardian = new GuardianOfElune();
    processEvents(buffsApplied, guardian);
    expect(guardian.GoEProcsTotal).toBe(2);
  });
  it('track GoE procs over a simple fight', () => {
    const guardian = new GuardianOfElune();
    processEvents(SimpleFight, guardian);
    expect(guardian.GoEProcsTotal).toBe(2);
  });
  it('track consumed GoE procs over a simple fight', () => {
    const guardian = new GuardianOfElune();
    processEvents(SimpleFight, guardian);
    expect(guardian.consumedGoEProc).toBe(1);
  });
  it('track last proc time', () => {
    const guardian = new GuardianOfElune();
    processEvents(SimpleFight, guardian);
    expect(guardian.lastGoEProcTime).toBe(11500);
  });
});
  

