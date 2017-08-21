import Gore from 'Parser/GuardianDruid/Modules/Features/Gore';
import { events, processEvents } from './SimpleFight';

describe('Features.GuardianOfElune', () => {
  it('Total Gore Procs', () => {
    const gore = new Gore();
    processEvents(events, gore);
    expect(gore.GoreProcsTotal).toBe(2);
  });
  it('Consumed Gore Procs', () => {
    const gore = new Gore();
    processEvents(events, gore);
    expect(gore.consumedGoreProc).toBe(1);
  });
  it('Overwritten Gore Procs', () => {
    const gore = new Gore();
    processEvents(events, gore);
    expect(gore.overwrittenGoreProc).toBe(1);
  });
});
  

