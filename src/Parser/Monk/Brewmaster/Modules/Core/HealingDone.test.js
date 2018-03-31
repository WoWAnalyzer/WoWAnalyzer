import processEvents from 'tests/Parser/Brewmaster/Fixtures/processEvents';
import { SimpleFight, heal, absorbed, incomingDamage, staggerAbsorbed, staggerTicks } from 'tests/Parser/Brewmaster/Fixtures/SimpleFight';

import HealingDone from './HealingDone';

// Uses the same test structure as damage taken with the healing object.
// All stagger absorbs should be excluded
describe('Brewmaster.DamageTaken', () => {
  let healingDone;
  beforeEach(() => {
    healingDone = new HealingDone({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
      fight: { start_time: 0 },
    });
  });
  it('healing done with no events', () => {
    expect(healingDone.total.regular).toBe(0);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with only healing events', () => {
    processEvents(heal, healingDone);
    expect(healingDone.total.regular).toBe(10);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with only non-stagger absorbs', () => {
    processEvents(absorbed, healingDone);
    expect(healingDone.total.regular).toBe(16);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with only stagger absorbs', () => {
    processEvents(staggerAbsorbed, healingDone);
    // Net should be zero
    expect(healingDone.total.regular).toBe(0);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with only boss damage', () => {
    processEvents(incomingDamage, healingDone);
    expect(healingDone.total.regular).toBe(0);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with boss damage and stagger absorbs', () => {
    processEvents([...incomingDamage, ...staggerAbsorbed], healingDone);
    expect(healingDone.total.regular).toBe(0);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done with only stagger dot', () => {
    processEvents(staggerTicks, healingDone);
    expect(healingDone.total.regular).toBe(0);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
  it('healing done taken for the fight', () => {
    processEvents(SimpleFight, healingDone);
    expect(healingDone.total.regular).toBe(26);
    expect(healingDone.total.absorbed).toBe(0);
    expect(healingDone.total.overheal).toBe(0);
  });
});
