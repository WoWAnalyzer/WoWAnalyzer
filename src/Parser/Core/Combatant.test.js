import COMBATANTINFO from 'tests/Parser/Core/COMBATANTINFO.json';

import Combatant from './Combatant';

function getCombatant(parser = null, combatantInfo = null) {
  const parserStub = {
    playersById: {
      11: {
        name: 'Test',
      },
    },
  };
  return new Combatant(parser || parserStub, combatantInfo || COMBATANTINFO);
}

describe('Combatant', () => {
  it('trinket1 gives item level', () => {
    const combatant = getCombatant();
    expect(Object.prototype.toString.call(combatant.trinket1)).toBe('[object Object]');
    expect(combatant.trinket1.itemLevel).toBe(940);
  });
  it('hasFinger checks both fingers', () => {
    const combatant = getCombatant();
    // ring 1
    expect(combatant.hasFinger(134533)).toBe(true);
    // ring 2
    expect(combatant.hasFinger(140897)).toBe(true);
    // trinket 1
    expect(combatant.hasFinger(144258)).toBe(false);
  });
  it('hasTrinket checks both trinket slots', () => {
    const combatant = getCombatant();
    // trinket 1
    expect(combatant.hasTrinket(144258)).toBe(true);
    // trinket 2
    expect(combatant.hasTrinket(128710)).toBe(true);
    // ring 2
    expect(combatant.hasTrinket(140897)).toBe(false);
  });
});
