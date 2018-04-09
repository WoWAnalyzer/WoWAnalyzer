import SPELLS from 'common/SPELLS';
import { damageTaken, buffsApplied, SimpleFight } from 'tests/Parser/Guardian/Fixtures/SimpleFight';
import processEvents from 'tests/Parser/Guardian/Fixtures/processEvents';

import IronFur from './IronFur';

describe('Core.IronFur', () => {
  let ironfur;
  beforeEach(() => {
    ironfur = new IronFur({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    }, {
      combatants: {
        selected: {
          traitsBySpellId: { [SPELLS.URSOCS_ENDURANCE.id]: 0 },
          hasBuff: () => true,
        },
      },
    });
  });
  it('track last ironfur time with noevents', () => {
    expect(ironfur.overallIronfurUptime).toBe(0);
  });
  it('track physical hits under ironfur with only damage', () => {
    processEvents(damageTaken, ironfur);
    expect(ironfur.hitsMitigated).toBe(0);
  });
  it('track physical hits with ironfur up with only ironfur', () => {
    processEvents(buffsApplied, ironfur);
    expect(ironfur.hitsMitigated).toBe(0);
  });
  it('track physical hits while ironfur is up in a simple fight', () => {
    processEvents(SimpleFight, ironfur);
    expect(ironfur.hitsMitigated).toBe(12);
  });
  it('track physical hits outside of ironfur in a simple fight', () => {
    processEvents(SimpleFight, ironfur);
    expect(ironfur.hitsUnmitigated).toBe(3);
  });
});
