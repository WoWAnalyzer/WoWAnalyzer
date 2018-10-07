import { SimpleFight, heal, absorbed, incomingDamage, staggerAbsorbed, staggerTicks } from 'tests/parser/brewmaster/fixtures/SimpleFight';
import TestCombatLogParser from 'tests/TestCombatLogParser';

import HealingDone from './HealingDone';

// Uses the same test structure as damage taken with the healing object.
// All stagger absorbs should be excluded
describe('Brewmaster/HealingDone', () => {
  let parser;
  let healingDone;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    healingDone = new HealingDone({ owner: parser });
  });
  it('healing done with no events', () => {
    expect(healingDone.total.regular).toBe(0);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with only healing events', () => {
    parser.processEvents(heal, healingDone);
    expect(healingDone.total.regular).toBe(10);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with only non-stagger absorbs', () => {
    parser.processEvents(absorbed, healingDone);
    expect(healingDone.total.regular).toBe(16);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with only stagger absorbs', () => {
    parser.processEvents(staggerAbsorbed, healingDone);
    // Net should be zero
    expect(healingDone.total.regular).toBe(0);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with only boss damage', () => {
    parser.processEvents(incomingDamage, healingDone);
    expect(healingDone.total.regular).toBe(0);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with boss damage and stagger absorbs', () => {
    parser.processEvents([...incomingDamage, ...staggerAbsorbed], healingDone);
    expect(healingDone.total.regular).toBe(0);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with only stagger dot', () => {
    parser.processEvents(staggerTicks, healingDone);
    expect(healingDone.total.regular).toBe(0);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done taken for the fight', () => {
    parser.processEvents(SimpleFight, healingDone);
    expect(healingDone.total.regular).toBe(26);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
});
