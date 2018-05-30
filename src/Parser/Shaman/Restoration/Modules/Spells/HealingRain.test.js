import SPELLS from 'common/SPELLS';

import HealingRain from './HealingRain';

describe('Shaman/Restoration/Modules/Spells/HealingRain', () => {
  const events = [
    // Tick 1
    { type: 'heal',  timestamp: 1, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 2, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 3, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 4, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 5, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 6, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    // Tick 2
    { type: 'heal',  timestamp: 100, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 100, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 100, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 100, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 100, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    // Tick 3
    { type: 'heal',  timestamp: 190, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 230, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 230, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 230, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 230, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 235, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    // Tick 4
    { type: 'heal',  timestamp: 340, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    { type: 'heal',  timestamp: 350, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
    // Tick 5
    { type: 'heal',  timestamp: 426, ability: { guid: SPELLS.HEALING_RAIN_HEAL.id } },
  ];


  it(`can detect ticks`, () => {
    const healingRain = new HealingRain();
    events.forEach(event => {
      healingRain.on_byPlayer_heal(event);
    });
    
    expect(healingRain.healingRainTicks.length).toEqual(5);
    expect(healingRain.averageHitsPerTick).toEqual(4);
  });

});
