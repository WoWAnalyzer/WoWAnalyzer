import { damageTaken, buffsApplied, SimpleFight } from 'parser/druid/guardian/test-fixtures/SimpleFight';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import GuardianOfElune from './GuardianOfElune';

describe('Features.GuardianOfElune', () => {
  let parser;
  let module;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    module = parser.loadModule(GuardianOfElune);
  });
  it('trach GoE procs with no events', () => {
    expect(module.GoEProcsTotal).toBe(0);
  });
  it('trach GoE procs with only damage events', () => {
    parser.processEvents(damageTaken);
    expect(module.GoEProcsTotal).toBe(0);
  });
  it('track GoE procs with only buffs applied', () => {
    parser.processEvents(buffsApplied);
    expect(module.GoEProcsTotal).toBe(2);
  });
  it('track GoE procs over a simple fight', () => {
    parser.processEvents(SimpleFight);
    expect(module.GoEProcsTotal).toBe(2);
  });
  it('track consumed GoE procs over a simple fight', () => {
    parser.processEvents(SimpleFight);
    expect(module.consumedGoEProc).toBe(1);
  });
  it('track last proc time', () => {
    parser.processEvents(SimpleFight);
    expect(module.lastGoEProcTime).toBe(11500);
  });
});
