import T20_4pc from 'Parser/BrewmasterMonk/Modules/Items/T20_4pc';
import { events, processEvents } from './SimpleFight';

describe('Items.T20_4pc', () => {
  it('Ox orbs eaten', () => {
    const item = new T20_4pc();
    processEvents(events, item);
    expect(item.orbsEaten).toBe(1);
  });
  it('Stagger saved due to eating orbs', () => {
    const item = new T20_4pc();
    processEvents(events, item);
    expect(item.staggerSaved).toBe(15);
  });
});
  

