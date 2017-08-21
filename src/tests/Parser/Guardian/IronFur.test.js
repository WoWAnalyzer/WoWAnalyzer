import IronFur from 'Parser/GuardianDruid/Modules/Spells/IronFur';
import { events, processEvents } from './SimpleFight';

describe('Core.IronFur', () => {
  it('Physical hits with Ironfur', () => {
    const ironfur = new IronFur();
    processEvents(events, ironfur);
    expect(ironfur.physicalHitsWithIronFur).toBe(10);
  });
  it('Physical hits without Ironfur', () => {
    const ironfur = new IronFur();
    processEvents(events, ironfur);
    expect(ironfur.physicalHitsWithoutIronFur).toBe(5);
  });
  it('Physical damage with Ironfur', () => {
    const ironfur = new IronFur();
    processEvents(events, ironfur);
    expect(ironfur.physicalDamageWithIronFur).toBe(52000);
  });
  it('Physical damage without Ironfur', () => {
    const ironfur = new IronFur();
    processEvents(events, ironfur);
    expect(ironfur.physicalDamageWithoutIronFur).toBe(50000);
  });
});
