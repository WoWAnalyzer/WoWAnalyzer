import SPELLS from 'common/SPELLS';
import getParserMock from 'tests/getParserMock';

import CooldownUsable from './CooldownUsable';

describe('Core/Modules/CooldownUsable', () => {
  let instance;
  let parserMock;
  let castEfficiencyMock;
  beforeEach(() => {
    // Reset mocks:
    parserMock = getParserMock();
    castEfficiencyMock = {
      getExpectedCooldownDuration: jest.fn(() => 7500),
      getMaxCharges: jest.fn(),
    };

    instance = new CooldownUsable(parserMock, {
      castEfficiency: castEfficiencyMock,
    });
  });

  it('a spell starts off cooldown', () => {
    expect(instance.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id)).toBe(false);
    expect(instance.cooldownRemaining(SPELLS.HOLY_SHOCK_CAST.id)).toBe(null);
  });
  it('a cast causes the spell to go on cooldown', () => {
    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.HOLY_SHOCK_CAST.id,
      },
    });
    // It's now marked on cooldown
    expect(instance.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id)).toBe(true);
    expect(instance.cooldownRemaining(SPELLS.HOLY_SHOCK_CAST.id)).toBe(7500);
    // It triggered a custom event
    expect(parserMock.triggerEvent).toHaveBeenCalledTimes(1);
    expect(parserMock.triggerEvent.mock.calls[0][0]).toBe('startcooldown');
    expect(parserMock.triggerEvent.mock.calls[0][1]).toBe(SPELLS.HOLY_SHOCK_CAST.id);
  });
  it('time causes the remaining cooldown to decrease', () => {
    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.HOLY_SHOCK_CAST.id,
      },
    });
    parserMock.currentTimestamp = 4500;

    expect(instance.cooldownRemaining(SPELLS.HOLY_SHOCK_CAST.id)).toBe(3000);
  });
  it('casting a spell already on cooldown before the cooldown runs out restarts the cooldown (and reports)', () => {
    console.error = jest.fn();
    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.HOLY_SHOCK_CAST.id,
      },
    });
    parserMock.currentTimestamp = 5000;
    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.HOLY_SHOCK_CAST.id,
      },
    });

    // It's still on cooldown
    expect(instance.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id)).toBe(true);
    // It reports when this happens, as it's not supposed to happen.
    expect(console.error).toHaveBeenCalled();
    // Its cooldown is based on the timestamp of the second cast
    expect(instance.cooldownRemaining(SPELLS.HOLY_SHOCK_CAST.id)).toBe(7500);
    // It goes through the proper event cycle
    expect(parserMock.triggerEvent).toHaveBeenCalledTimes(3);
    expect(parserMock.triggerEvent.mock.calls[0][0]).toBe('startcooldown');
    expect(parserMock.triggerEvent.mock.calls[0][1]).toBe(SPELLS.HOLY_SHOCK_CAST.id);
    expect(parserMock.triggerEvent.mock.calls[1][0]).toBe('finishcooldown');
    expect(parserMock.triggerEvent.mock.calls[1][1]).toBe(SPELLS.HOLY_SHOCK_CAST.id);
    expect(parserMock.triggerEvent.mock.calls[2][0]).toBe('startcooldown');
    expect(parserMock.triggerEvent.mock.calls[2][1]).toBe(SPELLS.HOLY_SHOCK_CAST.id);
  });
  it('casting a spell on cooldown with additional charges available uses a charge and does not change the cooldown period', () => {
    console.error = jest.fn();
    castEfficiencyMock.getMaxCharges = jest.fn(() => 2);

    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.RULE_OF_LAW_TALENT.id,
      },
    });
    parserMock.currentTimestamp = 5000;
    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.RULE_OF_LAW_TALENT.id,
      },
    });

    // It's still on cooldown
    expect(instance.isOnCooldown(SPELLS.RULE_OF_LAW_TALENT.id)).toBe(true);
    // It does NOT report when this happens, as it's normal behavior.
    expect(console.error).not.toHaveBeenCalled();
    // Its cooldown is still based on the first cast
    expect(instance.cooldownRemaining(SPELLS.RULE_OF_LAW_TALENT.id)).toBe(2500); // 7500 - 5000
    // It goes through the proper event cycle
    expect(parserMock.triggerEvent).toHaveBeenCalledTimes(2);
    expect(parserMock.triggerEvent.mock.calls[0][0]).toBe('startcooldown');
    expect(parserMock.triggerEvent.mock.calls[0][1]).toBe(SPELLS.RULE_OF_LAW_TALENT.id);
    expect(parserMock.triggerEvent.mock.calls[1][0]).toBe('startcooldowncharge');
    expect(parserMock.triggerEvent.mock.calls[1][1]).toBe(SPELLS.RULE_OF_LAW_TALENT.id);
  });
  it('the cooldown of a spell is automatically finished after the set period', () => {
    // TODO: Test this in such a way that it recognizes that if there aren't any event for a few seconds, the time of the cooldown finished will be off (then try to fix that, probably by adding a timestamp parameter to the custom event or making it an event object)
    // fail();
  });
  it('a spell with 2 charges and 1 charge on cooldown is considered available and on cooldown', () => {
    // TODO
  });
  it('a spell with all charges on cooldown is considered unavailable and on cooldown', () => {
    // TODO
  });
  it('reducing a cooldown returns the reduction applied', () => {
    // TODO
  });
  it('reducing a cooldown beyond its duration finishes the cooldown', () => {
    // TODO
  });
});
