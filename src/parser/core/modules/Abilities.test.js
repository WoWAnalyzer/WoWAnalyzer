import SPELLS from 'common/SPELLS';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import Abilities from './Abilities';
import Ability from './Ability';

describe('core/modules/Abilities', () => {
  let module;
  let parserMock;
  let hasteMock;
  beforeEach(() => {
    // Reset mocks:
    parserMock = new TestCombatLogParser();
    hasteMock = {
      current: 0,
    };

    module = parserMock.loadModule(Abilities, {
      haste: hasteMock,
    });
  });

  describe('getAbility', () => {
    it('finds the ability with the provided spellId', () => {
      const holyShock = {
        spell: SPELLS.HOLY_SHOCK_CAST.id,
      };
      module.loadSpellbook([
        {
          spell: SPELLS.LIGHT_OF_DAWN_CAST.id,
        },
        holyShock,
      ]);

      const ability = module.getAbility(SPELLS.HOLY_SHOCK_CAST.id);
      expect(ability).toBeInstanceOf(Ability);
      expect(ability.primarySpell).toBe(holyShock.spell);
    });
    it('ignores inactive spells', () => {
      const activeHolyShock = {
        spell: SPELLS.HOLY_SHOCK_CAST.id,
        cooldown: 8,
        enabled: true,
      };
      module.loadSpellbook([
        {
          spell: SPELLS.HOLY_SHOCK_CAST.id,
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
      module.getAbility = jest.fn(
        () =>
          new Ability(parserMock, {
            spell: SPELLS.HOLY_SHOCK_CAST.id,
            cooldown: 41,
          }),
      );

      const result = module.getExpectedCooldownDuration(SPELLS.HOLY_SHOCK_CAST.id);
      expect(result).toBe(41000);
    });
  });
  describe('getMaxCharges', () => {
    it('returns the value of the charges property', () => {
      const charges = 14;
      module.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST.id,
        charges,
      }));

      expect(module.getMaxCharges(SPELLS.HOLY_SHOCK_CAST.id)).toBe(charges);
    });
    it('defaults to 1 charge', () => {
      module.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST.id,
      }));

      expect(module.getMaxCharges(SPELLS.HOLY_SHOCK_CAST.id)).toBe(1);
    });
  });
});
