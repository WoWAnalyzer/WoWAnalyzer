import { damageTaken, buffsApplied, SimpleFight } from 'tests/parser/guardian/fixtures/SimpleFight';
import TestCombatLogParser from 'tests/TestCombatLogParser';

import GuardianOfElune from './GuardianOfElune';

describe('Features.GuardianOfElune', () => {
  let parser;
  let guardian;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    guardian = new GuardianOfElune({ owner: parser });
  });
  it('trach GoE procs with no events', () => {
    expect(guardian.GoEProcsTotal).toBe(0);
  });
  it('trach GoE procs with only damage events', () => {
    parser.processEvents(damageTaken);
    expect(guardian.GoEProcsTotal).toBe(0);
  });
  it('track GoE procs with only buffs applied', () => {
    parser.processEvents(buffsApplied);
    expect(guardian.GoEProcsTotal).toBe(2);
  });
  it('track GoE procs over a simple fight', () => {
    parser.processEvents(SimpleFight);
    expect(guardian.GoEProcsTotal).toBe(2);
  });
  it('track consumed GoE procs over a simple fight', () => {
    parser.processEvents(SimpleFight);
    expect(guardian.consumedGoEProc).toBe(1);
  });
  it('track last proc time', () => {
    parser.processEvents(SimpleFight);
    expect(guardian.lastGoEProcTime).toBe(11500);
  });
});
