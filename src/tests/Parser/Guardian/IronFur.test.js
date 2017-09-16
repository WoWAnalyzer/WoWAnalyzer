import IronFur from 'Parser/GuardianDruid/Modules/Spells/IronFur';
import { damageTaken, buffsApplied, SimpleFight } from './Fixtures/SimpleFight';
import { processEvents } from './Fixtures/processEvents';

describe('Core.IronFur', () => {
  let ironfur;
  beforeEach(() => {
    ironfur = new IronFur({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    });
  });
  it('track last ironfur time with noevents', () => {
    expect(ironfur.lastIronfurBuffApplied).toBe(0);
  });
  it('trach physical hits under ironfur with only damage', () => {
    processEvents(damageTaken, ironfur);
    expect(ironfur.physicalHitsWithIronFur).toBe(0);
  });
  it('track physical hits with ironfur up with only ironfur', () => {
    processEvents(buffsApplied, ironfur);
    expect(ironfur.physicalHitsWithIronFur).toBe(0);
  });
  it('track physical hits while ironfur is up in a simple fight', () => {
    processEvents(SimpleFight, ironfur);
    expect(ironfur.physicalHitsWithIronFur).toBe(10);
  });
  it('track physical hits outside of ironfur in a simple fight', () => {
    processEvents(SimpleFight, ironfur);
    expect(ironfur.physicalHitsWithoutIronFur).toBe(5);
  });
});
