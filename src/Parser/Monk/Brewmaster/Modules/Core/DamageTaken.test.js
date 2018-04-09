import processEvents from 'tests/Parser/Brewmaster/Fixtures/processEvents';
import { SimpleFight, heal, absorbed, incomingDamage, staggerAbsorbed, staggerTicks } from 'tests/Parser/Brewmaster/Fixtures/SimpleFight';

import DamageTaken from './DamageTaken';

describe('Brewmaster.DamageTaken', () => {
  let damageTaken;
  beforeEach(() => {
    damageTaken = new DamageTaken({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    });
  });
  it('damage taken with no events', () => {
    expect(damageTaken.total.regular).toBe(0);
    expect(damageTaken.total.absorbed).toBe(0);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with only healing events', () => {
    processEvents(heal, damageTaken);
    expect(damageTaken.total.regular).toBe(0);
    expect(damageTaken.total.absorbed).toBe(0);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with only non-stagger absorbs', () => {
    processEvents(absorbed, damageTaken);
    expect(damageTaken.total.regular).toBe(0);
    expect(damageTaken.total.absorbed).toBe(0);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with only stagger absorbs', () => {
    processEvents(staggerAbsorbed, damageTaken);
    expect(damageTaken.total.regular).toBe(0);
    expect(damageTaken.total.absorbed).toBe(-599);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with only boss damage', () => {
    processEvents(incomingDamage, damageTaken);
    expect(damageTaken.total.regular).toBe(1200);
    expect(damageTaken.total.absorbed).toBe(599);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with boss damage and stagger absorbs', () => {
    processEvents([...incomingDamage, ...staggerAbsorbed], damageTaken);
    expect(damageTaken.total.regular).toBe(1200);
    expect(damageTaken.total.absorbed).toBe(0);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('damage taken with only stagger dot', () => {
    processEvents(staggerTicks, damageTaken);
    expect(damageTaken.total.regular).toBe(224);
    expect(damageTaken.total.absorbed).toBe(16);
    expect(damageTaken.total.overkill).toBe(0);
  });
  it('total damage taken for the fight', () => {
    processEvents(SimpleFight, damageTaken);
    expect(damageTaken.total.regular).toBe(1424);
    expect(damageTaken.total.absorbed).toBe(16);
    expect(damageTaken.total.overkill).toBe(0);
  });
});
