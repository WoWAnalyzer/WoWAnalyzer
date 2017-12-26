import StaggerFabricator from 'Parser/Monk/Brewmaster/Modules/Core/StaggerFabricator';
import T20_4pc from 'Parser/Monk/Brewmaster/Modules/Items/T20_4pc';
import processEvents from './Fixtures/processEvents';
import { SimpleFight } from './Fixtures/SimpleFight';

describe('Brewmaster.T20_4pc', () => {
  let item;
  let fab;
  beforeEach(() => {
    fab = new StaggerFabricator({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    });
    item = new T20_4pc({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    });
    item.fab = fab;
    fab.owner.triggerEvent = (event, obj) => item.triggerEvent(event, obj);
    fab._has_t20_4pc = true;
  });
  it('how many gift of the ox orbs were absorbed as a heal', () => {
    processEvents(SimpleFight, fab, item);
    expect(item.orbsEaten).toBe(1);
  });
  it('how much stagger was reduced by absorbing the gift of the ox orbs', () => {
    processEvents(SimpleFight, fab, item);
    expect(item.staggerSaved).toBe(23.450000000000003);
  });
});

