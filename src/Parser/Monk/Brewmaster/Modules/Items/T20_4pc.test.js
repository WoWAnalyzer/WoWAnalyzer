import SPELLS from 'common/SPELLS';
import processEvents from 'tests/Parser/Brewmaster/Fixtures/processEvents';
import { SimpleFight } from 'tests/Parser/Brewmaster/Fixtures/SimpleFight';

import StaggerFabricator from '../Core/StaggerFabricator';
import T20_4pc from './T20_4pc';

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
    fab.combatants = {
      selected: {
        hasTalent: () => false,
        traitsBySpellId: { [SPELLS.STAGGERING_AROUND.id]: 0 },
      },
    };
    item = new T20_4pc({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    });
    item.fab = fab;
    fab.owner.fabricateEvent = (event, obj) => item.triggerEvent({ ...event, trigger: obj });
    fab._hasTier20_4pc = true;
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
