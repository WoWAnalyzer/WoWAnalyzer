import DamageTaken from 'Parser/BrewmasterMonk/Modules/Core/DamageTaken';
import { events, processEvents } from './SimpleFight';

describe('Core.DamageTaken', () => {
  it('Total damage amount', () => {
    const damageTaken = new DamageTaken();
    processEvents(events, damageTaken);
    expect(damageTaken.totalDamage.amount).toBe(1431);
  });
  it('Total damage absorb', () => {
    const damageTaken = new DamageTaken();
    processEvents(events, damageTaken);
    expect(damageTaken.totalDamage.absorb).toBe(9);
  });
  it('Total damage overkill', () => {
    const damageTaken = new DamageTaken();
    processEvents(events, damageTaken);
    expect(damageTaken.totalDamage.overkill).toBe(0);
  });
  it('Total damage total', () => {
    const damageTaken = new DamageTaken();
    processEvents(events, damageTaken);
    expect(damageTaken.totalDamage.total).toBe(1440);
  });
});
  

