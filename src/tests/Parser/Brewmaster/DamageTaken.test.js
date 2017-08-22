import DamageTaken from 'Parser/BrewmasterMonk/Modules/Core/DamageTaken';
import { events, processEvents } from './Fixtures/SimpleFight';

let damageTaken = null;

describe('Brewmaster.DamageTaken', () => {
  beforeEach(() => {
    damageTaken = new DamageTaken();
    processEvents(events, damageTaken);
  });
  it('Total damage taken over the fight but excluding absorbs', () => {
    expect(damageTaken.totalDamage.amount).toBe(1431);
  });
  it('Total absorbs applied excluding stagger', () => {
    expect(damageTaken.totalDamage.absorb).toBe(9);
  });
  it('Total amount of overkill', () => {
    expect(damageTaken.totalDamage.overkill).toBe(0);
  });
  it('Total damage taken including absorbs', () => {
    expect(damageTaken.totalDamage.total).toBe(1440);
  });
});
  

