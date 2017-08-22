import T20_2pc from 'Parser/BrewmasterMonk/Modules/Items/T20_2pc';
import { events, processEvents } from './Fixtures/SimpleFight';

let item = null;

describe('Brewmaster.T20_2pc', () => {
  beforeEach(() => {
    item = new T20_2pc();
    processEvents(events, item);
  });
  it('How many orbs spawned', () => {
    expect(item.orbTriggeredBy2Pc).toBe(1);
  });
  it('How many brews were used which could spawn an orb', () => {
    expect(item.brewCount).toBe(2);
  });
});
  

