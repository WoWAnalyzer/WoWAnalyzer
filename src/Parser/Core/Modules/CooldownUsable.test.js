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
    expect(instance.isAvailable(SPELLS.HOLY_SHOCK_CAST.id)).toBe(true);
    expect(instance.cooldownRemaining(SPELLS.HOLY_SHOCK_CAST.id)).toBe(null);
  });
  const a_cast_causes_the_spell_to_go_on_cooldown = () => {
    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.HOLY_SHOCK_CAST.id,
      },
      timestamp: parserMock.currentTimestamp,
    });
    expect(instance.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id)).toBe(true);
    expect(instance.cooldownRemaining(SPELLS.HOLY_SHOCK_CAST.id)).toBe(7500);

    expect(parserMock.triggerEvent).toHaveBeenCalledTimes(1);
    expect(parserMock.triggerEvent.mock.calls[0][0]).toBe('startcooldown');
    const event = parserMock.triggerEvent.mock.calls[0][1];
    expect(event.spellId).toBe(SPELLS.HOLY_SHOCK_CAST.id);
    expect(event.timestamp).toBe(0);
    expect(event.start).toBe(0);
    expect(event.expectedEnd).toBe(7500);
    expect(event.charges).toBe(1);
  };
  it('a cast causes the spell to go on cooldown', a_cast_causes_the_spell_to_go_on_cooldown);
  it('a cast of a spell with charges causes the spell to go on cooldown like normal', () => {
    castEfficiencyMock.getMaxCharges = jest.fn(() => 2);
    a_cast_causes_the_spell_to_go_on_cooldown();
  });
  it('time causes the remaining cooldown to decrease', () => {
    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.HOLY_SHOCK_CAST.id,
      },
      timestamp: parserMock.currentTimestamp,
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
      timestamp: parserMock.currentTimestamp,
    });
    parserMock.currentTimestamp = 5000;
    parserMock.triggerEvent = jest.fn(); // Reset the call history
    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.HOLY_SHOCK_CAST.id,
      },
      timestamp: parserMock.currentTimestamp,
    });

    // It's still on cooldown
    expect(instance.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id)).toBe(true);
    // It reports when this happens, as it's not supposed to happen.
    expect(console.error).toHaveBeenCalled();
    // Its cooldown is based on the timestamp of the second cast
    expect(instance.cooldownRemaining(SPELLS.HOLY_SHOCK_CAST.id)).toBe(7500);
    // It goes through the proper event cycle
    expect(parserMock.triggerEvent).toHaveBeenCalledTimes(2);
    {
      const call = parserMock.triggerEvent.mock.calls[0];
      expect(call[0]).toBe('finishcooldown');
      const event = call[1];
      expect(event.spellId).toBe(SPELLS.HOLY_SHOCK_CAST.id);
      expect(event.timestamp).toBe(5000);
      expect(event.start).toBe(0);
      expect(event.end).toBe(5000);
      expect(event.expectedEnd).toBe(7500);
      expect(event.charges).toBe(1);
    }
    {
      const call = parserMock.triggerEvent.mock.calls[1];
      expect(call[0]).toBe('startcooldown');
      const event = call[1];
      expect(event.spellId).toBe(SPELLS.HOLY_SHOCK_CAST.id);
      expect(event.timestamp).toBe(5000);
      expect(event.start).toBe(5000);
      expect(event.expectedEnd).toBe(12500);
      expect(event.charges).toBe(1);
    }
  });
  it('the cooldown of a spell is automatically finished after the set period', () => {
    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.HOLY_SHOCK_CAST.id,
      },
      timestamp: parserMock.currentTimestamp,
    });
    parserMock.currentTimestamp = 10000;
    parserMock.triggerEvent = jest.fn(); // Reset the call history
    // This might be considered implementation detail, but it's also kinda the only way. Code doesn't magically run, so the only way to trigger our cooldown handling is with an event.
    instance.triggerEvent();

    expect(instance.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id)).toBe(false);
    expect(parserMock.triggerEvent).toHaveBeenCalledTimes(1);
    expect(parserMock.triggerEvent.mock.calls[0][0]).toBe('finishcooldown');
    const event = parserMock.triggerEvent.mock.calls[0][1];
    expect(event.spellId).toBe(SPELLS.HOLY_SHOCK_CAST.id);
    // The timestamp is backdated so that its values is always the same. If we had an event at 7500 this would also have been the timestamp, so the only reason it would otherwise be 10,000 is because we had an events void for whatever reason.
    expect(event.timestamp).toBe(7500);
    expect(event.start).toBe(0);
    expect(event.end).toBe(7500);
    expect(event.expectedEnd).toBe(7500);
  });
  it('the cooldown restarts when a cooldown on a spell with multiple charges on cooldown finishes', () => {
    fail();
  });
  it('a spell with 2 charges and 1 charge on cooldown is considered available and on cooldown', () => {
    castEfficiencyMock.getMaxCharges = jest.fn(() => 2);

    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.RULE_OF_LAW_TALENT.id,
      },
      timestamp: parserMock.currentTimestamp,
    });
    expect(instance.isOnCooldown(SPELLS.RULE_OF_LAW_TALENT.id)).toBe(true);
    expect(instance.isAvailable(SPELLS.RULE_OF_LAW_TALENT.id)).toBe(true);
  });
  it('a spell with all charges on cooldown is considered unavailable and on cooldown', () => {
    console.error = jest.fn(); // now we're using this just to silence the warning, we already tested it so don't test again.
    castEfficiencyMock.getMaxCharges = jest.fn(() => 2);

    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.RULE_OF_LAW_TALENT.id,
      },
      timestamp: parserMock.currentTimestamp,
    });
    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.RULE_OF_LAW_TALENT.id,
      },
      timestamp: parserMock.currentTimestamp,
    });

    expect(instance.isOnCooldown(SPELLS.RULE_OF_LAW_TALENT.id)).toBe(true);
    expect(instance.isAvailable(SPELLS.RULE_OF_LAW_TALENT.id)).toBe(false);
  });
  it('casting a spell on cooldown with additional charges available uses a charge and does not change the cooldown period', () => {
    console.error = jest.fn();
    castEfficiencyMock.getMaxCharges = jest.fn(() => 2);

    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.RULE_OF_LAW_TALENT.id,
      },
      timestamp: parserMock.currentTimestamp,
    });
    parserMock.currentTimestamp = 5000;
    parserMock.triggerEvent = jest.fn(); // Reset the call history
    instance.triggerEvent('cast', {
      ability: {
        guid: SPELLS.RULE_OF_LAW_TALENT.id,
      },
      timestamp: parserMock.currentTimestamp,
    });

    // It does NOT report when this happens, as it's normal behavior.
    expect(console.error).not.toHaveBeenCalled();
    // Its cooldown is still based on the first cast
    expect(instance.cooldownRemaining(SPELLS.RULE_OF_LAW_TALENT.id)).toBe(2500); // 7500 - 5000
    // It goes through the proper event cycle
    expect(parserMock.triggerEvent).toHaveBeenCalledTimes(1);
    {
      // The second call should only trigger a charge going on cooldown
      const call = parserMock.triggerEvent.mock.calls[0];
      expect(call[0]).toBe('startcooldowncharge');
      const event = call[1];
      expect(event.spellId).toBe(SPELLS.RULE_OF_LAW_TALENT.id);
      expect(event.timestamp).toBe(5000);
      expect(event.start).toBe(0);
      expect(event.expectedEnd).toBe(7500);
      expect(event.charges).toBe(2);
    }
  });
  it('reducing a cooldown returns the reduction applied', () => {
    fail();
  });
  it('reducing a cooldown beyond its duration finishes the cooldown', () => {
    fail();
  });
});
