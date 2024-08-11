import SPELLS from 'common/SPELLS';
import { EventType, UpdateSpellUsableType } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import SpellUsable from './SpellUsable';

describe('core/Modules/SpellUsable', () => {
  let module;
  let parser;
  let abilitiesMock;
  let eventEmitter;
  let triggerCast;
  let triggerHasteChange;
  beforeEach(() => {
    // Reset mocks:
    parser = new TestCombatLogParser();
    abilitiesMock = {
      getExpectedCooldownDuration: jest.fn(() => 7500),
      getMaxCharges: jest.fn(),
      getAbility: jest.fn((id) => ({ spell: id, primarySpell: id })),
    };

    eventEmitter = parser.getModule(EventEmitter);
    module = parser.loadModule(SpellUsable, {
      eventEmitter,
      abilities: abilitiesMock,
    });
    triggerCast = (spellId, extra) => {
      eventEmitter.triggerEvent({
        type: EventType.Cast,
        ability: {
          guid: spellId,
        },
        timestamp: parser.currentTimestamp,
        ...extra,
      });
    };
    triggerHasteChange = () => {
      eventEmitter.triggerEvent({
        type: EventType.ChangeHaste,
        // We don't need more; the new Haste is pulled straight from the Haste module
        timestamp: parser.currentTimestamp,
      });
    };
  });
  const triggerTestEvent = () =>
    eventEmitter.triggerEvent({
      type: EventType.Test,
      timestamp: parser.currentTimestamp,
    });

  describe('regular spell status tracking', () => {
    it('a spell starts off cooldown', () => {
      expect(module.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(false);
      expect(module.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(true);
    });
    it('a cast causes the spell to go on cooldown', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      expect(module.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(true);
    });
    it("even if a spell has another charge left it's still considered on cooldown", () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      expect(module.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(true);
    });
    it('when a regular spell with no extra charges goes on cooldown, the spell becomes unavailable', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      expect(module.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(false);
    });
    it('when a spell with multiple charges has another charge available, it is still available', () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      expect(module.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(true);
    });
    it('when a spell with multiple charges has all charges on cooldown, the spell becomes unavailable', () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      triggerCast(SPELLS.FAKE_SPELL.id);
      expect(module.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(false);
    });

    it('a spell going on cooldown has the proper duration', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);

      expect(module.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(7500); // this was set in our mock
    });
    it('time causes the remaining cooldown to decrease', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      parser.currentTimestamp = 4500;

      expect(module.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(3000);
    });
    it('the cooldown of a spell is automatically finished after the set period', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      parser.currentTimestamp = 10000;
      triggerTestEvent();

      expect(module.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(false);
    });
    it('the cooldown restarts when a cooldown on a spell with multiple charges on cooldown finishes', () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      triggerCast(SPELLS.FAKE_SPELL.id);
      parser.currentTimestamp = 10000;
      triggerTestEvent();

      expect(module.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(true);
      // A charge was just restored, so this spell is castable again
      expect(module.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(true);
    });
    it('casting a spell already on cooldown before the cooldown runs out restarts the cooldown (and reports)', () => {
      module.addDebugAnnotation = jest.fn();
      triggerCast(SPELLS.FAKE_SPELL.id);
      parser.currentTimestamp = 5000;
      triggerCast(SPELLS.FAKE_SPELL.id);

      // It's still on cooldown
      expect(module.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(true);
      // It reports when this happens, as it's not supposed to happen normally.
      expect(module.addDebugAnnotation).toHaveBeenCalled();
      // Its cooldown is based on the timestamp of the second cast, as the log results are leading over our predictions
      expect(module.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(7500);
    });
    it('casting a spell on cooldown with additional charges available uses a charge and does not change the cooldown period', () => {
      console.error = jest.fn();
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      parser.currentTimestamp = 5000;
      eventEmitter.fabricateEvent = jest.fn();
      triggerCast(SPELLS.FAKE_SPELL.id);

      // It does NOT report when this happens, as it's normal behavior.
      expect(console.error).not.toHaveBeenCalled();
      // Its cooldown is still based on the first cast (charges don't recharge simultaneously)
      expect(module.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(2500); // 7500 - 5000
    });
  });

  describe('public API', () => {
    it('reducing a cooldown returns the reduction applied', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      const result = module.reduceCooldown(SPELLS.FAKE_SPELL.id, 1500);

      expect(result).toBe(1500);
      expect(module.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(6000); // 7500 - 1500
    });
    it('reducing a cooldown beyond its duration finishes the cooldown', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      const result = module.reduceCooldown(SPELLS.FAKE_SPELL.id, 8000);

      expect(result).toBe(7500);
      expect(module.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(false);
    });
    it('reducing a spell with multiple charges on cooldown reduces the CD time on the next charge if it fully recharges the first charge', () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      triggerCast(SPELLS.FAKE_SPELL.id);
      parser.currentTimestamp = 6000; //Leaves 1500ms cooldown remaining of the total 7500ms of the first charge recharging.
      const reduction = module.reduceCooldown(SPELLS.FAKE_SPELL.id, 5000);
      expect(reduction).toBe(5000);
    });
    it('cooldownRemaining on a spell not on cooldown returns 0', () => {
      expect(module.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(0);
    });
  });

  describe('custom events', () => {
    // Custom event tests are separate to keep the above tests much simpler and cleaner. Their separation isn't *that* weird.
    it('a new spell going on cooldown triggers an `updatespellusable` event indicating the spell going on cooldown', () => {
      eventEmitter.fabricateEvent = jest.fn();

      triggerCast(SPELLS.FAKE_SPELL.id);

      expect(eventEmitter.fabricateEvent).toHaveBeenCalledTimes(1);
      const call = eventEmitter.fabricateEvent.mock.calls[0];
      expect(call[0]).toEqual({
        type: EventType.UpdateSpellUsable,
        ability: {
          abilityIcon: SPELLS.FAKE_SPELL.icon,
          guid: SPELLS.FAKE_SPELL.id,
          name: SPELLS.FAKE_SPELL.name,
        },
        timestamp: 0,

        updateType: UpdateSpellUsableType.BeginCooldown,
        isOnCooldown: true,
        isAvailable: false,
        chargesAvailable: 0,
        maxCharges: 1,

        overallStartTimestamp: 0,
        chargeStartTimestamp: 0,
        expectedRechargeTimestamp: 7500,
        expectedRechargeDuration: 7500,

        sourceID: parser.playerId,
        sourceIsFriendly: true,
        targetID: parser.playerId,
        targetIsFriendly: true,

        __fabricated: true,
      });
    });
    it('casting a spell already on cooldown before the cooldown runs out restarts the cooldown and fires both endcooldown and begincooldown events', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      eventEmitter.fabricateEvent = jest.fn();
      triggerCast(SPELLS.FAKE_SPELL.id);

      expect(eventEmitter.fabricateEvent).toHaveBeenCalledTimes(2);
      {
        const call = eventEmitter.fabricateEvent.mock.calls[0];
        expect(call[0]).toEqual({
          type: EventType.UpdateSpellUsable,
          ability: {
            abilityIcon: SPELLS.FAKE_SPELL.icon,
            guid: SPELLS.FAKE_SPELL.id,
            name: SPELLS.FAKE_SPELL.name,
          },
          timestamp: 0,

          updateType: UpdateSpellUsableType.EndCooldown,
          isOnCooldown: false,
          isAvailable: true,
          chargesAvailable: 1,
          maxCharges: 1,

          overallStartTimestamp: 0,
          chargeStartTimestamp: 0,
          expectedRechargeTimestamp: 0, // for an endcooldown this value always matches the timestamp
          expectedRechargeDuration: 7500,

          sourceID: parser.playerId,
          sourceIsFriendly: true,
          targetID: parser.playerId,
          targetIsFriendly: true,

          __fabricated: true,
        });
      }
      {
        const call = eventEmitter.fabricateEvent.mock.calls[1];
        expect(call[0]).toEqual({
          type: EventType.UpdateSpellUsable,
          ability: {
            abilityIcon: SPELLS.FAKE_SPELL.icon,
            guid: SPELLS.FAKE_SPELL.id,
            name: SPELLS.FAKE_SPELL.name,
          },
          timestamp: 0,

          updateType: UpdateSpellUsableType.BeginCooldown,
          isOnCooldown: true,
          isAvailable: false,
          chargesAvailable: 0,
          maxCharges: 1,

          overallStartTimestamp: 0,
          chargeStartTimestamp: 0,
          expectedRechargeTimestamp: 7500,
          expectedRechargeDuration: 7500,

          sourceID: parser.playerId,
          sourceIsFriendly: true,
          targetID: parser.playerId,
          targetIsFriendly: true,

          __fabricated: true,
        });
      }
    });
    it('using another charge of a spell already on cooldown triggers an `updatespellusable` event indicating the charge going on cooldown', () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      eventEmitter.fabricateEvent = jest.fn();
      triggerCast(SPELLS.FAKE_SPELL.id);

      expect(eventEmitter.fabricateEvent).toHaveBeenCalledTimes(1);
      const call = eventEmitter.fabricateEvent.mock.calls[0];
      expect(call[0]).toEqual({
        type: EventType.UpdateSpellUsable,
        ability: {
          abilityIcon: SPELLS.FAKE_SPELL.icon,
          guid: SPELLS.FAKE_SPELL.id,
          name: SPELLS.FAKE_SPELL.name,
        },
        timestamp: 0,

        updateType: UpdateSpellUsableType.UseCharge,
        isOnCooldown: true,
        isAvailable: false,
        chargesAvailable: 0,
        maxCharges: 2,

        overallStartTimestamp: 0,
        chargeStartTimestamp: 0,
        expectedRechargeTimestamp: 7500,
        expectedRechargeDuration: 7500,

        sourceID: parser.playerId,
        sourceIsFriendly: true,
        targetID: parser.playerId,
        targetIsFriendly: true,

        __fabricated: true,
      });
    });
    it('a spell going off cooldown triggers an `updatespellusable` event indicating the spell going off cooldown', () => {
      parser.currentTimestamp = 0;
      triggerCast(SPELLS.FAKE_SPELL.id);
      parser.currentTimestamp = 10000;
      eventEmitter.fabricateEvent = jest.fn();
      triggerTestEvent();

      expect(eventEmitter.fabricateEvent).toHaveBeenCalledTimes(1);
      const call = eventEmitter.fabricateEvent.mock.calls[0];
      expect(call[0]).toEqual({
        type: EventType.UpdateSpellUsable,
        ability: {
          abilityIcon: SPELLS.FAKE_SPELL.icon,
          guid: SPELLS.FAKE_SPELL.id,
          name: SPELLS.FAKE_SPELL.name,
        },
        timestamp: 7500, // it should be simulated at the time of expiry

        updateType: UpdateSpellUsableType.EndCooldown,
        isOnCooldown: false,
        isAvailable: true,
        chargesAvailable: 1,
        maxCharges: 1,

        overallStartTimestamp: 0,
        chargeStartTimestamp: 0,
        expectedRechargeTimestamp: 7500,
        expectedRechargeDuration: 7500,

        sourceID: parser.playerId,
        sourceIsFriendly: true,
        targetID: parser.playerId,
        targetIsFriendly: true,

        __fabricated: true,
      });
    });
    it("a spell having a charge restored while there's still another charge recharging, triggers an `updatespellusable` event indicating the charge being available again", () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      triggerCast(SPELLS.FAKE_SPELL.id);
      parser.currentTimestamp = 10000;
      eventEmitter.fabricateEvent = jest.fn();
      triggerTestEvent();

      expect(eventEmitter.fabricateEvent).toHaveBeenCalledTimes(1);
      const call = eventEmitter.fabricateEvent.mock.calls[0];
      expect(call[0]).toEqual({
        type: EventType.UpdateSpellUsable,
        ability: {
          abilityIcon: SPELLS.FAKE_SPELL.icon,
          guid: SPELLS.FAKE_SPELL.id,
          name: SPELLS.FAKE_SPELL.name,
        },
        timestamp: 7500, // it should be simulated at the time of expiry

        updateType: UpdateSpellUsableType.RestoreCharge,
        isOnCooldown: true,
        isAvailable: true,
        chargesAvailable: 1,
        maxCharges: 2,

        overallStartTimestamp: 0,
        chargeStartTimestamp: 0,
        expectedRechargeTimestamp: 15000,
        expectedRechargeDuration: 7500,

        sourceID: parser.playerId,
        sourceIsFriendly: true,
        targetID: parser.playerId,
        targetIsFriendly: true,

        __fabricated: true,
      });
    });
  });

  describe('Haste scaling cooldowns', () => {
    it('updates active cooldowns when Haste increases', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      parser.currentTimestamp = 1000;
      // Simulate Haste increasing which would reduce our spell's cooldown to 6s (down from 7.5sec)
      abilitiesMock.getExpectedCooldownDuration = jest.fn(() => 6000);
      triggerHasteChange();

      // New expected cooldown is `1000 + (6000 * (1 - (1000 / 7500)))=6200`, but we already spent 1000ms on cooldown, so what's remaining is 5200.
      expect(module.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(5200);
    });
    it('updates active cooldowns when Haste decreases', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      parser.currentTimestamp = 1000;
      // Simulate Haste decreasing which would increase our spell's cooldown to 9s (up from 7.5sec)
      abilitiesMock.getExpectedCooldownDuration = jest.fn(() => 9000);
      triggerHasteChange();

      // New expected cooldown is `1000 + (6000 * (1 - (1000 / 7500)))=8800`, but we already spent 1000ms on cooldown, so what's remaining is 7800.
      expect(module.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(7800);
    });
    it('CDRs are applied at the current haste, cooldown scales based on percent completed', () => {
      // cooldown is 7500
      triggerCast(SPELLS.FAKE_SPELL.id); // expected end is 7500
      module.reduceCooldown(SPELLS.FAKE_SPELL.id, 1500); // expected end is now 6000

      // at t=2000, change haste so new cooldown is 9000
      parser.currentTimestamp = 2000;
      abilitiesMock.getExpectedCooldownDuration = jest.fn(() => 9000);
      triggerHasteChange();

      // Calculate the new cooldown remaining:
      // t=2000, currExpectedEnd=6000 => currTimeRemaining=4000
      // currCd (before change) = 7500 => percentRemaining = 4000 / 7500 = ~53.3%
      // percentRemaining * newCd = newTimeRemaining => 0.533 * 9000 = 4800
      expect(module.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(4800);
    });
  });
});
