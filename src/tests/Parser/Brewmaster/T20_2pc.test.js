import T20_2pc from 'Parser/Monk/Brewmaster/Modules/Items/T20_2pc';
import processEvents from './Fixtures/processEvents';
import { SimpleFight } from './Fixtures/SimpleFight';

describe('Brewmaster.T20_2pc', () => {
  let item;
  beforeEach(() => {
    item = new T20_2pc({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    });
  });
  it('tracks the number of orbs spawned by the T202pc', () => {
    processEvents(SimpleFight, item);
    expect(item.orbTriggeredBy2Pc).toBe(1);
  });
  it('tracks how many brews were used, each has a 40% chance to spawn an orb', () => {
    processEvents(SimpleFight, item);
    expect(item.brewCount).toBe(2);
  });
});

