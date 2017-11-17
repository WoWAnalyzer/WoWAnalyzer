import SPELLS from 'common/SPELLS';
import getParserMock from 'tests/getParserMock';

import Abilities from './Abilities';

describe('Core/Modules/Abilities', () => {
  let instance;
  let parserMock;
  let combatantsMock;
  let hasteMock;
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
  });

  describe('getAbility', () => {
    it('finds the ability with the provided spellId', () => {
      const holyShock = {
        spell: SPELLS.HOLY_SHOCK_CAST,
      };
      instance.constructor.ABILITIES = [
        {
          spell: SPELLS.LIGHT_OF_DAWN_CAST,
        },
        holyShock,
        {
          spell: SPELLS.RULE_OF_LAW_TALENT,
        },
      ];

      expect(instance.getAbility(SPELLS.HOLY_SHOCK_CAST.id)).toBe(holyShock);
    });
    it('ignores inactive spells', () => {
      const activeHolyShock = {
        spell: SPELLS.HOLY_SHOCK_CAST,
        getCooldown: () => 8,
        isActive: () => true,
      };
      instance.constructor.ABILITIES = [
        {
          spell: SPELLS.HOLY_SHOCK_CAST,
          getCooldown: () => 9,
          isActive: () => false,
        },
        activeHolyShock,
      ];

      expect(instance.getAbility(SPELLS.HOLY_SHOCK_CAST.id)).toBe(activeHolyShock);
    });
  });
  describe('getExpectedCooldownDuration', () => {
    it('calculates the cooldown duration using getCooldown of an ability', () => {
      const getCooldown = jest.fn();
      instance.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST,
        getCooldown,
      }));

      instance.getExpectedCooldownDuration(SPELLS.HOLY_SHOCK_CAST.id);
      expect(getCooldown).toHaveBeenCalled();
    });
    it('provides the current Haste to getCooldown of an ability', () => {
      const getCooldown = jest.fn();
      instance.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST,
        getCooldown,
      }));

      hasteMock.current = 0;
      instance.getExpectedCooldownDuration(SPELLS.HOLY_SHOCK_CAST.id);
      expect(getCooldown.mock.calls[getCooldown.mock.calls.length - 1][0]).toBe(0);
      hasteMock.current = 0.12;
      instance.getExpectedCooldownDuration(SPELLS.HOLY_SHOCK_CAST.id);
      expect(getCooldown.mock.calls[getCooldown.mock.calls.length - 1][0]).toBe(0.12);
      hasteMock.current = 0.5;
      instance.getExpectedCooldownDuration(SPELLS.HOLY_SHOCK_CAST.id);
      expect(getCooldown.mock.calls[getCooldown.mock.calls.length - 1][0]).toBe(0.5);
    });
    it('provides the selected Combatant to getCooldown of an ability', () => {
      const getCooldown = jest.fn();
      instance.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST,
        getCooldown,
      }));

      instance.getExpectedCooldownDuration(SPELLS.HOLY_SHOCK_CAST.id);
      expect(getCooldown.mock.calls[getCooldown.mock.calls.length - 1][1]).toBe(combatantsMock.selected);
    });
    it('returns the result of getCooldown in milliseconds', () => {
      const getCooldown = jest.fn(() => 8.4);
      instance.getAbility = jest.fn(() => ({
        spell: SPELLS.HOLY_SHOCK_CAST,
        getCooldown,
      }));

      expect(instance.getExpectedCooldownDuration(SPELLS.HOLY_SHOCK_CAST.id)).toBe(8400);
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
