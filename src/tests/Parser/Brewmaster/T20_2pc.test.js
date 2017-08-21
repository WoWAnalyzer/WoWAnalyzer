import T20_2pc from 'Parser/BrewmasterMonk/Modules/Items/T20_2pc';
import { events, processEvents } from './SimpleFight';

describe('Items.T20_2pc', () => {
  it('Test number of spawned orbs', () => {
    const item = new T20_2pc();
    processEvents(events, item);
    expect(item.orbTriggeredBy2Pc).toBe(1);
  });
  it('Test brew count', () => {
    const item = new T20_2pc();
    processEvents(events, item);
    expect(item.brewCount).toBe(2);
  });
});
  

