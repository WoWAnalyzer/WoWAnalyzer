import SPELLS from 'common/SPELLS';
import getParserMock from 'tests/getParserMock';

import Abilities from './Abilities';
import Ability from './Ability';

describe('Core/Modules/Abilities', () => {
  let instance;
  let parserMock;
  let combatantsMock;
  let hasteMock;
  let loadSpellbook;
  beforeEach(() => {
    // Reset mocks:
    parserMock = getParserMock();
    combatantsMock = {
      selected: {

      },
    };
    hasteMock = {
      current: 0,
    };

    instance = new Abilities(parserMock, {
      combatants: combatantsMock,
      haste: hasteMock,
    });
    loadSpellbook = spellbook => {
      instance.spellbook = () => spellbook;
      instance.on_initialized();
    };
  });

  describe('getAbility', () => {
    it('finds the ability with the provided spellId', () => {
      const holyShock = {
        spell: SPELLS.HOLY_SHOCK_CAST,
      };
      loadSpellbook([
        {
          spell: SPELLS.LIGHT_OF_DAWN_CAST,
        },
        holyShock,
        {
          spell: SPELLS.RULE_OF_LAW_TALENT,
        },
      ]);

      const ability = instance.getAbility(SPELLS.HOLY_SHOCK_CAST.id);
      expect(ability).toBeInstanceOf(Ability);
      expect(ability.primarySpell.id).toBe(holyShock.spell.id);
    });
    it('ignores inactive spells', () => {
      const activeHolyShock = {
        spell: SPELLS.HOLY_SHOCK_CAST,
        cooldown: () => 8,
        enabled: true,
      };
      loadSpellbook([
        {
          spell: SPELLS.HOLY_SHOCK_CAST,
          cooldown: () => 9,
          enabled: false,
        },
        activeHolyShock,
      ]);

      const ability = instance.getAbility(SPELLS.HOLY_SHOCK_CAST.id);
      expect(ability.cooldown).toBe(8);
    });
  });
  describe('getExpectedCooldownDuration', () => {
    it('calculates the cooldown duration using the cooldown property of an ability', () => {
      instance.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST,
        cooldown: 41,
      }));

      const result = instance.getExpectedCooldownDuration(SPELLS.HOLY_SHOCK_CAST.id);
      expect(result).toBe(41000);
    });
  });
  describe('getMaxCharges', () => {
    it('returns the value of the charges property', () => {
      const charges = 14;
      instance.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST,
        charges,
      }));

      expect(instance.getMaxCharges(SPELLS.HOLY_SHOCK_CAST.id)).toBe(charges);
    });
    it('defaults to 1 charge', () => {
      instance.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST,
      }));

      expect(instance.getMaxCharges(SPELLS.HOLY_SHOCK_CAST.id)).toBe(1);
    });
  });
});
