import { SimpleFight, heal, absorbed, incomingDamage, staggerAbsorbed, staggerTicks } from 'parser/monk/brewmaster/test-fixtures/SimpleFight';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import DamageTaken from './DamageTaken';

describe('Brewmaster/DamageTaken', () => {
  let parser;
  let module;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    module = parser.loadModule('damageTaken', DamageTaken);
  });
  it('damage taken with no events', () => {
    expect(module.total.regular).toBe(0);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overkill).toBe(0);
  });
  it('damage taken with only healing events', () => {
    parser.processEvents(heal);
    expect(module.total.regular).toBe(0);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overkill).toBe(0);
  });
  it('damage taken with only non-stagger absorbs', () => {
    parser.processEvents(absorbed);
    expect(module.total.regular).toBe(0);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overkill).toBe(0);
  });
  it('damage taken with only stagger absorbs', () => {
    parser.processEvents(staggerAbsorbed);
    expect(module.total.regular).toBe(0);
    expect(module.total.absorbed).toBe(-599);
    expect(module.total.overkill).toBe(0);
  });
  it('damage taken with only boss damage', () => {
    parser.processEvents(incomingDamage);
    expect(module.total.regular).toBe(1200);
    expect(module.total.absorbed).toBe(599);
    expect(module.total.overkill).toBe(0);
  });
  it('damage taken with boss damage and stagger absorbs', () => {
    parser.processEvents([...incomingDamage, ...staggerAbsorbed]);
    expect(module.total.regular).toBe(1200);
    expect(module.total.absorbed).toBe(0);
    expect(module.total.overkill).toBe(0);
  });
  it('damage taken with only stagger dot', () => {
    parser.processEvents(staggerTicks);
    expect(module.total.regular).toBe(224);
    expect(module.total.absorbed).toBe(16);
    expect(module.total.overkill).toBe(0);
  });
  it('total damage taken for the fight', () => {
    parser.processEvents(SimpleFight);
    expect(module.total.regular).toBe(1424);
    expect(module.total.absorbed).toBe(16);
    expect(module.total.overkill).toBe(0);
  });
});
