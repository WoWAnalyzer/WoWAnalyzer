import GuardianOfElune from 'Parser/GuardianDruid/Modules/Features/GuardianOfElune';
import { events, processEvents } from './SimpleFight';

describe('Features.GuardianOfElune', () => {
  it('Total GoE Procs', () => {
    const guardian = new GuardianOfElune();
    processEvents(events, guardian);
    expect(guardian.GoEProcsTotal).toBe(2);
  });
  it('Consumed GoE Procs', () => {
    const guardian = new GuardianOfElune();
    processEvents(events, guardian);
    expect(guardian.consumedGoEProc).toBe(1);
  });
  it('Last proc time', () => {
    const guardian = new GuardianOfElune();
    processEvents(events, guardian);
    expect(guardian.lastGoEProcTime).toBe(11500);
  });
});
  

