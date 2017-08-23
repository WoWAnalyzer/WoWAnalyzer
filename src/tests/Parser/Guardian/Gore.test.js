import Gore from 'Parser/GuardianDruid/Modules/Features/Gore';
import { SimpleFight, damageTaken, buffsRefreshed } from './Fixtures/SimpleFight';
import { processEvents } from './Fixtures/processEvents';

describe('GuardianDruid.Gore', () => {
  let gore;
  beforeEach(() => {
    gore = new Gore();
  });
  it('track gore procs with no events', () => {
    expect(gore.GoreProcsTotal).toBe(0);
  });
  it('track gore procs with only damage events', () => {
    processEvents(damageTaken, gore);
    expect(gore.GoreProcsTotal).toBe(0);
  });
  it('track gore procs with single refresh event', () => {
    processEvents(buffsRefreshed, gore);
    expect(gore.GoreProcsTotal).toBe(1);
  });
  it('track gore procs over the course of a fight', () => {
    processEvents(SimpleFight, gore);
    expect(gore.GoreProcsTotal).toBe(2);
  });
  it('track consumed gore procs', () => {
    processEvents(SimpleFight, gore);
    expect(gore.consumedGoreProc).toBe(1);
  });
  it('track wasted gore procs', () => {
    processEvents(SimpleFight, gore);
    expect(gore.overwrittenGoreProc).toBe(1);
  });
});
  

