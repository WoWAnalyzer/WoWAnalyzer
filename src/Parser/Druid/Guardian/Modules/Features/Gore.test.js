import { SimpleFight, damageTaken, buffsRefreshed, casts } from 'tests/Parser/Guardian/Fixtures/SimpleFight';
import TestCombatLogParser from 'tests/TestCombatLogParser';

import Gore from './Gore';

const mockSpellUsable = {
  isOnCooldown: () => false,
  endCooldown: () => {},
};

describe('Druid/Guardian/Gore', () => {
  let gore;
  let parser;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    gore = new Gore(parser, { spellUsable: mockSpellUsable });
  });
  it('track gore procs with no events', () => {
    expect(gore.totalProcs).toBe(0);
  });
  it('track gore procs with only damage events', () => {
    parser.processEvents(damageTaken, gore);
    expect(gore.totalProcs).toBe(0);
  });
  it('track the number of times mangle was cast with just casts', () => {
    parser.processEvents(casts, gore);
    expect(gore.nonGoreMangle).toBe(2);
  });
  it('track gore procs with single refresh event', () => {
    parser.processEvents(buffsRefreshed, gore);
    expect(gore.totalProcs).toBe(1);
  });
  it('track gore procs over the course of a fight', () => {
    parser.processEvents(SimpleFight, gore);
    expect(gore.totalProcs).toBe(2);
  });
  it('track consumed gore procs', () => {
    parser.processEvents(SimpleFight, gore);
    expect(gore.consumedGoreProc).toBe(1);
  });
  it('track the number of times mangle was cast without gore', () => {
    parser.processEvents(SimpleFight, gore);
    expect(gore.nonGoreMangle).toBe(1);
  });
  it('track wasted gore procs', () => {
    parser.processEvents(SimpleFight, gore);
    expect(gore.overwrittenGoreProc).toBe(1);
  });
});
