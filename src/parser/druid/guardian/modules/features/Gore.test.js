import { SimpleFight, damageTaken, buffsRefreshed, casts } from 'parser/druid/guardian/test-fixtures/SimpleFight';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import Gore from './Gore';

const mockSpellUsable = {
  isOnCooldown: () => false,
  endCooldown: () => {},
};

describe('Druid/Guardian/Gore', () => {
  let module;
  let parser;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    module = parser.loadModule('gore', Gore, {
      spellUsable: mockSpellUsable,
    });
  });
  it('track gore procs with no events', () => {
    expect(module.totalProcs).toBe(0);
  });
  it('track gore procs with only damage events', () => {
    parser.processEvents(damageTaken, module);
    expect(module.totalProcs).toBe(0);
  });
  it('track the number of times mangle was cast with just casts', () => {
    parser.processEvents(casts, module);
    expect(module.nonGoreMangle).toBe(2);
  });
  it('track gore procs with single refresh event', () => {
    parser.processEvents(buffsRefreshed, module);
    expect(module.totalProcs).toBe(1);
  });
  it('track gore procs over the course of a fight', () => {
    parser.processEvents(SimpleFight, module);
    expect(module.totalProcs).toBe(2);
  });
  it('track consumed gore procs', () => {
    parser.processEvents(SimpleFight, module);
    expect(module.consumedGoreProc).toBe(1);
  });
  it('track the number of times mangle was cast without gore', () => {
    parser.processEvents(SimpleFight, module);
    expect(module.nonGoreMangle).toBe(1);
  });
  it('track wasted gore procs', () => {
    parser.processEvents(SimpleFight, module);
    expect(module.overwrittenGoreProc).toBe(1);
  });
});
