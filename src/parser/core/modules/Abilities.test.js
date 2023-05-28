import TALENTS from 'common/TALENTS/paladin';
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
        spell: TALENTS.HOLY_SHOCK_TALENT.id,
      };
      module.loadSpellbook([
        {
          spell: TALENTS.LIGHT_OF_DAWN_TALENT.id,
        },
        holyShock,
      ]);

      const ability = module.getAbility(TALENTS.HOLY_SHOCK_TALENT.id);
      expect(ability).toBeInstanceOf(Ability);
      expect(ability.primarySpell).toBe(holyShock.spell);
    });
    it('ignores inactive spells', () => {
      const activeHolyShock = {
        spell: TALENTS.HOLY_SHOCK_TALENT.id,
        cooldown: 8,
        enabled: true,
      };
      module.loadSpellbook([
        {
          spell: TALENTS.HOLY_SHOCK_TALENT.id,
          cooldown: 9,
          enabled: false,
        },
        activeHolyShock,
      ]);

      const ability = module.getAbility(TALENTS.HOLY_SHOCK_TALENT.id);
      expect(ability.cooldown).toBe(8);
    });
  });
  describe('getExpectedCooldownDuration', () => {
    it('calculates the cooldown duration using the cooldown property of an ability', () => {
      module.getAbility = jest.fn(
        () =>
          new Ability(parserMock, {
            spell: TALENTS.HOLY_SHOCK_TALENT.id,
            cooldown: 41,
          }),
      );

      const result = module.getExpectedCooldownDuration(TALENTS.HOLY_SHOCK_TALENT.id);
      expect(result).toBe(41000);
    });
  });
  describe('getMaxCharges', () => {
    it('returns the value of the charges property', () => {
      const charges = 14;
      module.getAbility = jest.fn(() => ({
        spell: TALENTS.HOLY_SHOCK_TALENT.id,
        charges,
      }));

      expect(module.getMaxCharges(TALENTS.HOLY_SHOCK_TALENT.id)).toBe(charges);
    });
    it('defaults to 1 charge', () => {
      module.getAbility = jest.fn(() => ({
        spell: TALENTS.HOLY_SHOCK_TALENT.id,
      }));

      expect(module.getMaxCharges(TALENTS.HOLY_SHOCK_TALENT.id)).toBe(1);
    });
  });
});
