import SPELLS from 'common/SPELLS';
import getParserMock from 'tests/getParserMock';

import ShockTreatment from './ShockTreatment';

describe('Paladin/Holy/Modules/Traits/ShockTreatment', () => {
  let instance;
  let parserMock;
  let combatantsMock;
  let critEffectBonusMock;
  beforeEach(() => {
    // Reset mocks:
    parserMock = getParserMock();
    combatantsMock = {
      selected: {
        traitsBySpellId: {
          [SPELLS.SHOCK_TREATMENT.id]: 4,
        },
      },
    };
    critEffectBonusMock = {
      hook: jest.fn(),
    };

    instance = new ShockTreatment(parserMock, {
      combatants: combatantsMock,
      critEffectBonus: critEffectBonusMock,
    });
    instance.triggerEvent({
      type: 'initialized',
    });
  });

  it('adds a hook that increases the crit effect bonus of Holy Shock', () => {
    const holyShockEvent = {
      ability: {
        guid: SPELLS.HOLY_SHOCK_HEAL.id,
      },
    };

    expect(critEffectBonusMock.hook).toHaveBeenCalled();
    const hook = critEffectBonusMock.hook.mock.calls[0][0];
    expect(hook).toBeTruthy();
    expect(hook(2, holyShockEvent)).toBe(2.64);
  });
  it('the hook does not increase the crit effect bonus of other heals', () => {
    const otherEvent = {
      ability: {
        guid: SPELLS.LIGHT_OF_DAWN_HEAL.id,
      },
    };

    expect(critEffectBonusMock.hook).toHaveBeenCalled();
    const hook = critEffectBonusMock.hook.mock.calls[0][0];
    expect(hook).toBeTruthy();
    expect(hook(2, otherEvent)).toBe(2);
  });
});
