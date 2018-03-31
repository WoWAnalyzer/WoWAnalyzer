import { SimpleFight, damageTaken, buffsRefreshed, casts } from 'tests/Parser/Guardian/Fixtures/SimpleFight';
import processEvents from 'tests/Parser/Guardian/Fixtures/processEvents';

import Gore from './Gore';

const mockSpellUsable = {
  isOnCooldown: () => false,
  endCooldown: () => {},
};

describe('Druid/Guardian/Gore', () => {
  let gore;
  beforeEach(() => {
    gore = new Gore({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    }, { spellUsable: mockSpellUsable });
  });
  it('track gore procs with no events', () => {
    expect(gore.totalProcs).toBe(0);
  });
  it('track gore procs with only damage events', () => {
    processEvents(damageTaken, gore);
    expect(gore.totalProcs).toBe(0);
  });
  it('track the number of times mangle was cast with just casts', () => {
    processEvents(casts, gore);
    expect(gore.nonGoreMangle).toBe(2);
  });
  it('track gore procs with single refresh event', () => {
    processEvents(buffsRefreshed, gore);
    expect(gore.totalProcs).toBe(1);
  });
  it('track gore procs over the course of a fight', () => {
    processEvents(SimpleFight, gore);
    expect(gore.totalProcs).toBe(2);
  });
  it('track consumed gore procs', () => {
    processEvents(SimpleFight, gore);
    expect(gore.consumedGoreProc).toBe(1);
  });
  it('track the number of times mangle was cast without gore', () => {
    processEvents(SimpleFight, gore);
    expect(gore.nonGoreMangle).toBe(1);
  });
  it('track wasted gore procs', () => {
    processEvents(SimpleFight, gore);
    expect(gore.overwrittenGoreProc).toBe(1);
  });
});
