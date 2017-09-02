import Energy from 'Parser/BrewmasterMonk/Modules/Features/Energy';
import { processEvents } from './Fixtures/processEvents';
import { EnergyFight, buffs } from './Fixtures/EnergyFight';

describe('Brewmaster.Energy', () => {
  let energy;
  beforeEach(() => {
    energy = new Energy({
      toPlayer: () => true,
      byPlayer: () => true,
    });
  });
  it('base energy regen', () => {
    const val = energy.calcEnergyRegen([]);
    expect(val).toBe(10);
  });
  it('energy regen with 0% haste', () => {
    const val = energy.calcEnergyRegen([0]);
    expect(val).toBe(10);
  });
  it('energy regen with -10% haste', () => {
    const val = energy.calcEnergyRegen([-0.1]);
    expect(val).toBe(9);
  });
  it('energy regen with bad parameter (int) value haste sets as base value', () => {
    const val = energy.calcEnergyRegen(1);
    expect(val).toBe(10);
  });
  it('energy regen with bad parameter (string) value haste sets as base value', () => {
    const val = energy.calcEnergyRegen('it can\'t be this string value');
    expect(val).toBe(10);
  });
  it('energy regen with bad parameter (object) value haste sets as base value', () => {
    const val = energy.calcEnergyRegen(new Energy());
    expect(val).toBe(10);
  });
  it('energy regen with 10% haste', () => {
    const val = energy.calcEnergyRegen([0.1]);
    expect(val).toBe(11);
  });
  it('energy regen with 1.52% haste', () => {
    const val = energy.calcEnergyRegen([0.0152]).toFixed(2);
    expect(val).toBe('10.15');
  });
  it('energy regen with 5.28% haste', () => {
    const val = energy.calcEnergyRegen([0.0528]).toFixed(2);
    expect(val).toBe('10.53');
  });
  it('energy regen with 12.97% haste', () => {
    const val = energy.calcEnergyRegen([0.1297]).toFixed(2);
    expect(val).toBe('11.30');
  });
  it('energy regen with 12.97% & 25% haste', () => {
    const val = energy.calcEnergyRegen([0.1297, 0.25]).toFixed(2);
    expect(val).toBe('14.12');
  });
  it('energy regen with 25% haste', () => {
    const val = energy.calcEnergyRegen([0.25]);
    expect(val).toBe(12.5);
  });
  it('energy regen with 12.97% with hero and whispers (61%)', () => {
    const val = energy.calcEnergyRegen([0.1297, 0.3, 0.61]).toFixed(2);
    expect(val).toBe('23.64');
  });
  it('energy regen with 300% haste', () => {
    const val = energy.calcEnergyRegen([3]);
    expect(val).toBe(40);
  });
  it('track haste in initialize with 10% haste', () => {
    const owner = { fight: {end_time: 10000}};
    const combatant = { selected: { hastePercentage: 0.1 } };
    energy.owner = owner;
    energy.combatants = combatant;
    energy.triggerEvent('initialized');
    expect(energy.baseHaste).toBe(0.1);
    expect(energy.currentRegen).toBe(11);
    expect(energy.fightEnd).toBe(10000);
  });
  it('track time at max haste', () => {
    energy.lastChangeInEnergy = 0;
    energy.fightEnd = 10000;
    energy.baseHaste = 0;
    energy.currentRegen = energy.calcEnergyRegen([energy.baseHaste], 0);
    processEvents(EnergyFight, energy);
    energy.triggerEvent('finished');
    // Energy Regen is 10
    // First event at 1s is 90 energy so hasn't capped goes down to 65, takes 3.5s to get to max energy (4.5s).
    // Second event at 5s has been max energy for 0.5s takes 2.5s to get up to max (7.5s)
    // Third event at 9s has been max energy for 1.5s
    expect(energy.timeAtMaxEnergy).toBe(2);
  });
  it('track total energy regen for fight', () => {
    energy.fightEnd = 10000;
    energy.baseHaste = 0.5;
    energy.currentRegen = energy.calcEnergyRegen([energy.baseHaste], 0);
    processEvents(EnergyFight, energy);
    energy.triggerEvent('finished');
    // Base haste = 50%
    // 1s of hero (+30% haste) 1.3 * 1.5 = 95% haste
    // 9s of base haste 50%
    // (15 * 9) + (19.5 * 1) = 1
    expect(energy.totalEnergyRegen).toBe(154.5);
  });
  it('track total energy just from hero with no base haste', () => {
    energy.fightEnd = 1000;
    energy.baseHaste = 0;
    energy.currentRegen = energy.calcEnergyRegen([energy.baseHaste], 0);
    processEvents(buffs, energy);
    energy.triggerEvent('finished');
    expect(energy.totalEnergyRegen).toBe(13);
  });
});
