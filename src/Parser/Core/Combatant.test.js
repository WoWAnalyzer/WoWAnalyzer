import COMBATANTINFO from 'tests/Parser/Core/COMBATANTINFO.json';
import AZERITE_TEST_INFO from 'tests/Parser/Core/AZERITE_TEST_INFO.json';

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

  describe('_parseTraits', () => {
    it('parses 3x3 traits correctly', () => {
      const combatant = getCombatant();
      combatant._parseTraits(AZERITE_TEST_INFO.full);
      expect(combatant.traitsBySpellId).toEqual({
        268596: [79],
        273823: [64],
        274762: [64, 64],
        278571: [79],
        280410: [64],
      });
    });

    it('parses 3,2,3 traits correctly', () => {
      const combatant = getCombatant();
      combatant._parseTraits(AZERITE_TEST_INFO.middle_has_1);
      expect(combatant.traitsBySpellId).toEqual({
        268596: [79],
        273823: [59],
        274762: [64],
        278571: [79],
        280410: [64],
      });
    });

    it('parses 2,2,2 traits correctly', () => {
      const combatant = getCombatant();
      combatant._parseTraits(AZERITE_TEST_INFO.no_empowerment);
      expect(combatant.traitsBySpellId).toEqual({
        268596: [74],
        273823: [59],
        274762: [59, 59],
        278571: [74],
        280410: [59],
      });
    });

    it('parses 1,1,3 traits correctly', () => {
      const combatant = getCombatant();
      combatant._parseTraits(AZERITE_TEST_INFO[113]);
      expect(combatant.traitsBySpellId).toEqual({
        273823: [59],
        274762: [64],
        278571: [74],
        280410: [64],
      });
    });
  });
});
