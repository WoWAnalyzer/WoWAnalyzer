import T20_4pc from 'Parser/BrewmasterMonk/Modules/Items/T20_4pc';
import { events, processEvents } from './Fixtures/SimpleFight';

let item = null;

describe('Brewmaster.T20_4pc', () => {
  beforeEach(() => {
    item = new T20_4pc();
    processEvents(events, item);
  });
  it('how many gift of the ox orbs were absorbed', () => {
    expect(item.orbsEaten).toBe(1);
  });
  it('how much stagger was reduced by absorbing the gift of the ox orbs', () => {
    expect(item.staggerSaved).toBe(15);
  });
});
  

