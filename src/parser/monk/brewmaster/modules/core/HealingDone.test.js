import { SimpleFight, heal, absorbed, incomingDamage, staggerAbsorbed, staggerTicks } from 'parser/monk/brewmaster/test-fixtures/SimpleFight';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import HealingDone from './HealingDone';

// Uses the same test structure as damage taken with the healing object.
// All stagger absorbs should be excluded
describe('Brewmaster/HealingDone', () => {
  let parser;
  let module;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    module = parser.loadModule(HealingDone);
  });
  it('healing done with no events', () => {
    expect(module.total.regular).toBe(0);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overheal).toBe(0);
  });
  it('healing done with only healing events', () => {
    parser.processEvents(heal, module);
    expect(module.total.regular).toBe(10);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overheal).toBe(0);
  });
  it('healing done with only non-stagger absorbs', () => {
    parser.processEvents(absorbed, module);
    expect(module.total.regular).toBe(16);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overheal).toBe(0);
  });
  it('healing done with only stagger absorbs', () => {
    parser.processEvents(staggerAbsorbed, module);
    // Net should be zero
    expect(module.total.regular).toBe(0);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overheal).toBe(0);
  });
  it('healing done with only boss damage', () => {
    parser.processEvents(incomingDamage, module);
    expect(module.total.regular).toBe(0);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overheal).toBe(0);
  });
  it('healing done with boss damage and stagger absorbs', () => {
    parser.processEvents([...incomingDamage, ...staggerAbsorbed], module);
    expect(module.total.regular).toBe(0);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overheal).toBe(0);
  });
  it('healing done with only stagger dot', () => {
    parser.processEvents(staggerTicks, module);
    expect(module.total.regular).toBe(0);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overheal).toBe(0);
  });
  it('healing done taken for the fight', () => {
    parser.processEvents(SimpleFight, module);
    expect(module.total.regular).toBe(26);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overheal).toBe(0);
  });
});
