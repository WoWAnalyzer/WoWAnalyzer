import SPELLS from 'common/SPELLS/index';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import Abilities from './Abilities';
import Ability from './Ability';

describe('core/Modules/Abilities', () => {
  let module;
  let parserMock;
  let hasteMock;
  beforeEach(() => {
    // Reset mocks:
    parserMock = new TestCombatLogParser();
    hasteMock = {
      current: 0,
    };

    module = parserMock.loadModule('abilities', Abilities, {
      haste: hasteMock,
    });
  });

  describe('getAbility', () => {
    it('finds the ability with the provided spellId', () => {
      const holyShock = {
        spell: SPELLS.HOLY_SHOCK_CAST,
      };
      module.loadSpellbook([
        {
          spell: SPELLS.LIGHT_OF_DAWN_CAST,
        },
        holyShock,
        {
          spell: SPELLS.RULE_OF_LAW_TALENT,
        },
      ]);

      const ability = module.getAbility(SPELLS.HOLY_SHOCK_CAST.id);
      expect(ability).toBeInstanceOf(Ability);
      expect(ability.primarySpell.id).toBe(holyShock.spell.id);
    });
    it('ignores inactive spells', () => {
      const activeHolyShock = {
        spell: SPELLS.HOLY_SHOCK_CAST,
        cooldown: 8,
        enabled: true,
      };
      module.loadSpellbook([
        {
          spell: SPELLS.HOLY_SHOCK_CAST,
          cooldown: 9,
          enabled: false,
        },
        activeHolyShock,
      ]);

      const ability = module.getAbility(SPELLS.HOLY_SHOCK_CAST.id);
      expect(ability.cooldown).toBe(8);
    });
  });
  describe('getExpectedCooldownDuration', () => {
    it('calculates the cooldown duration using the cooldown property of an ability', () => {
      module.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST,
        cooldown: 41,
      }));

      const result = module.getExpectedCooldownDuration(SPELLS.HOLY_SHOCK_CAST.id);
      expect(result).toBe(41000);
    });
  });
  describe('getMaxCharges', () => {
    it('returns the value of the charges property', () => {
      const charges = 14;
      module.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST,
        charges,
      }));

      expect(module.getMaxCharges(SPELLS.HOLY_SHOCK_CAST.id)).toBe(charges);
    });
    it('defaults to 1 charge', () => {
      module.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST,
      }));

      expect(module.getMaxCharges(SPELLS.HOLY_SHOCK_CAST.id)).toBe(1);
    });
  });
});
