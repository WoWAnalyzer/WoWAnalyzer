import { SimpleFight, heal, absorbed, incomingDamage, staggerAbsorbed, staggerTicks } from 'tests/parser/brewmaster/fixtures/SimpleFight';
import TestCombatLogParser from 'tests/TestCombatLogParser';

import DamageTaken from './DamageTaken';

describe('Brewmaster/DamageTaken', () => {
  let parser;
  let damageTaken;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    damageTaken = new DamageTaken({
      owner: parser,
    });
  });
  it('damage taken with no events', () => {
    expect(damageTaken.total.regular).toBe(0);
    expect(damageTaken.total.absorbed).toBe(0);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with only healing events', () => {
    parser.processEvents(heal);
    expect(damageTaken.total.regular).toBe(0);
    expect(damageTaken.total.absorbed).toBe(0);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with only non-stagger absorbs', () => {
    parser.processEvents(absorbed);
    expect(damageTaken.total.regular).toBe(0);
    expect(damageTaken.total.absorbed).toBe(0);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with only stagger absorbs', () => {
    parser.processEvents(staggerAbsorbed);
    expect(damageTaken.total.regular).toBe(0);
    expect(damageTaken.total.absorbed).toBe(-599);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with only boss damage', () => {
    parser.processEvents(incomingDamage);
    expect(damageTaken.total.regular).toBe(1200);
    expect(damageTaken.total.absorbed).toBe(599);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with boss damage and stagger absorbs', () => {
    parser.processEvents([...incomingDamage, ...staggerAbsorbed]);
    expect(damageTaken.total.regular).toBe(1200);
    expect(damageTaken.total.absorbed).toBe(0);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with only stagger dot', () => {
    parser.processEvents(staggerTicks);
    expect(damageTaken.total.regular).toBe(224);
    expect(damageTaken.total.absorbed).toBe(16);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('total damage taken for the fight', () => {
    parser.processEvents(SimpleFight);
    expect(damageTaken.total.regular).toBe(1424);
    expect(damageTaken.total.absorbed).toBe(16);
    expect(damageTaken.total.overkill).toBe(0);
  });
});
