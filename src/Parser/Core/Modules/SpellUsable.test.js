import SPELLS from 'common/SPELLS';
import getParserMock from 'tests/getParserMock';

import SpellUsable from './SpellUsable';

describe('Core/Modules/SpellUsable', () => {
  let instance;
  let parserMock;
  let castEfficiencyMock;
  let triggerCast;
  beforeEach(() => {
    // Reset mocks:
    parserMock = getParserMock();
    castEfficiencyMock = {
      getExpectedCooldownDuration: jest.fn(() => 7500),
      getMaxCharges: jest.fn(),
    };

    instance = new SpellUsable(parserMock, {
      castEfficiency: castEfficiencyMock,
    });
    triggerCast = (spellId, extra) => {
      instance.triggerEvent('cast', {
        ability: {
          guid: spellId,
        },
        timestamp: parserMock.currentTimestamp,
        ...extra,
      });
    };
  });

  it('a spell starts off cooldown', () => {
    expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(false);
    expect(instance.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(true);
    expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(null);
  });
  it('a cast causes the spell to go on cooldown', () => {
    triggerCast(SPELLS.FAKE_SPELL.id);
    expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(true);
  });
  it('even if a spell has another charge left it\'s still considered on cooldown', () => {
    castEfficiencyMock.getMaxCharges = jest.fn(() => 2);
    triggerCast(SPELLS.FAKE_SPELL.id);
    expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(true);
  });
  it('when a regular spell with no extra charges goes on cooldown, the spell becomes unavailable', () => {
    triggerCast(SPELLS.FAKE_SPELL.id);
    expect(instance.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(false);
  });
  it('when a spell with multiple charges has another charge available, it is still available', () => {
    castEfficiencyMock.getMaxCharges = jest.fn(() => 2);
    triggerCast(SPELLS.FAKE_SPELL.id);
    expect(instance.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(true);
  });
  it('when a spell with multiple charges has all charges on cooldown, the spell becomes unavailable', () => {
    castEfficiencyMock.getMaxCharges = jest.fn(() => 2);
    triggerCast(SPELLS.FAKE_SPELL.id);
    triggerCast(SPELLS.FAKE_SPELL.id);
    expect(instance.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(false);
  });

  it('a spell going on cooldown has the proper duration', () => {
    triggerCast(SPELLS.FAKE_SPELL.id);

    expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(7500); // this was set in our mock
  });
  it('time causes the remaining cooldown to decrease', () => {
    triggerCast(SPELLS.FAKE_SPELL.id);
    parserMock.currentTimestamp = 4500;

    expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(3000);
  });
  it('the cooldown of a spell is automatically finished after the set period', () => {
    triggerCast(SPELLS.FAKE_SPELL.id);
    parserMock.currentTimestamp = 10000;

    // This might be considered implementation detail, but it's also kinda the only way. Code doesn't magically run, so the only way to trigger our cooldown handling is with an event.
    instance.triggerEvent();

    expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(false);
  });
  it('the cooldown restarts when a cooldown on a spell with multiple charges on cooldown finishes', () => {
    castEfficiencyMock.getMaxCharges = jest.fn(() => 2);
    triggerCast(SPELLS.FAKE_SPELL.id);
    triggerCast(SPELLS.FAKE_SPELL.id);
    parserMock.currentTimestamp = 10000;
    // This might be considered implementation detail, but it's also kinda the only way. Code doesn't magically run, so the only way to trigger our cooldown handling is with an event.
    instance.triggerEvent();

    expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(true);
    // A charge was just restored, so this spell is castable again
    expect(instance.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(true);
  });
  it('casting a spell already on cooldown before the cooldown runs out restarts the cooldown (and reports)', () => {
    console.error = jest.fn();
    triggerCast(SPELLS.FAKE_SPELL.id);
    parserMock.currentTimestamp = 5000;
    triggerCast(SPELLS.FAKE_SPELL.id);

    // It's still on cooldown
    expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(true);
    // It reports when this happens, as it's not supposed to happen normally.
    expect(console.error).toHaveBeenCalled();
    // Its cooldown is based on the timestamp of the second cast, as the log results are leading over our predictions
    expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(7500);
  });
  it('casting a spell on cooldown with additional charges available uses a charge and does not change the cooldown period', () => {
    console.error = jest.fn();
    castEfficiencyMock.getMaxCharges = jest.fn(() => 2);
    triggerCast(SPELLS.FAKE_SPELL.id);
    parserMock.currentTimestamp = 5000;
    parserMock.triggerEvent = jest.fn(); // Reset the call history
    triggerCast(SPELLS.FAKE_SPELL.id);

    // It does NOT report when this happens, as it's normal behavior.
    expect(console.error).not.toHaveBeenCalled();
    // Its cooldown is still based on the first cast (charges don't recharge simultaneously)
    expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(2500); // 7500 - 5000
  });
  it('reducing a cooldown returns the reduction applied', () => {
    triggerCast(SPELLS.FAKE_SPELL.id);
    instance.reduceCooldown(SPELLS.FAKE_SPELL.id, 1500);

    expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(6000); // 7500 - 1500
  });
  it('reducing a cooldown beyond its duration finishes the cooldown', () => {
    triggerCast(SPELLS.FAKE_SPELL.id);
    instance.reduceCooldown(SPELLS.FAKE_SPELL.id, 8000);

    expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(false);
    expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(null);
  });

  // TODO: Test event triggers


  it('a spell with 1 charge going on cooldown triggers an `updatespellusable` event', () => {
    parserMock.triggerEvent = jest.fn();
    triggerCast(SPELLS.FAKE_SPELL.id);

    expect(parserMock.triggerEvent).toHaveBeenCalledTimes(1);
    expect(parserMock.triggerEvent.mock.calls[0][0]).toBe('updatespellusable');
    const event = parserMock.triggerEvent.mock.calls[0][1];
    expect(event.spellId).toBe(SPELLS.FAKE_SPELL.id);
    expect(event.trigger).toBe('begincooldown');
    expect(event.timestamp).toBe(0);
    expect(event.isOnCooldown).toBe(true);
    expect(event.isAvailable).toBe(false);
    expect(event.chargesOnCooldown).toBe(1);
    expect(event.chargesAvailable).toBe(0);
    expect(event.maxCharges).toBe(1);
    expect(event.rechargeTime).toBe(7500);
    expect(event.sourceID).toBe(parserMock.playerId);
    expect(event.targetID).toBe(parserMock.playerId);
    expect(event.start).toBe(0);
    expect(event.expectedEnd).toBe(7500);
  });
  it('a spell with 2 charges going on cooldown triggers an `updatespellusable` event', () => {
    castEfficiencyMock.getMaxCharges = jest.fn(() => 2);
    parserMock.triggerEvent = jest.fn();
    triggerCast(SPELLS.FAKE_SPELL.id);

    expect(parserMock.triggerEvent).toHaveBeenCalledTimes(1);
    expect(parserMock.triggerEvent.mock.calls[0][0]).toBe('updatespellusable');
    const event = parserMock.triggerEvent.mock.calls[0][1];
    expect(event.spellId).toBe(SPELLS.FAKE_SPELL.id);
    expect(event.trigger).toBe('begincooldown');
    expect(event.timestamp).toBe(0);
    expect(event.isOnCooldown).toBe(true);
    expect(event.isAvailable).toBe(true);
    expect(event.chargesOnCooldown).toBe(1);
    expect(event.chargesAvailable).toBe(1);
    expect(event.maxCharges).toBe(2);
    expect(event.rechargeTime).toBe(7500);
    expect(event.sourceID).toBe(parserMock.playerId);
    expect(event.targetID).toBe(parserMock.playerId);
    expect(event.start).toBe(0);
    expect(event.expectedEnd).toBe(7500);
  });
});
