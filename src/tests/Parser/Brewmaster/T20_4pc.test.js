import T20_4pc from 'Parser/BrewmasterMonk/Modules/Items/T20_4pc';
import { processEvents } from './Fixtures/processEvents';
import { SimpleFight } from './Fixtures/SimpleFight';

describe('Brewmaster.T20_4pc', () => {
  let item;
  beforeEach(() => {
    item = new T20_4pc({
      toPlayer: () => true,
      byPlayer: () => true,
    });
  });
  it('how many gift of the ox orbs were absorbed as a heal', () => {
    processEvents(SimpleFight, item);
    expect(item.orbsEaten).toBe(1);
  });
  it('how much stagger was reduced by absorbing the gift of the ox orbs', () => {
    processEvents(SimpleFight, item);
    expect(item.staggerSaved).toBe(15);
  });
});
  

