import SPELLS from 'common/SPELLS';
import getParserMock from 'tests/getParserMock';

import SpellUsable from './SpellUsable';

describe('Core/Modules/SpellUsable', () => {
  let instance;
  let parserMock;
  let abilitiesMock;
  let triggerCast;
  let triggerHasteChange;
  beforeEach(() => {
    // Reset mocks:
    parserMock = getParserMock();
    abilitiesMock = {
      getExpectedCooldownDuration: jest.fn(() => 7500),
      getMaxCharges: jest.fn(),
      getAbility: jest.fn((id) => {spell: {id: id}}),
    };

    instance = new SpellUsable(parserMock, {
      abilities: abilitiesMock,
    });
    triggerCast = (spellId, extra) => {
      instance.triggerEvent({
        type: 'cast',
        ability: {
          guid: spellId,
        },
        timestamp: parserMock.currentTimestamp,
        ...extra,
      });
    };
    triggerHasteChange = () => {
      instance.triggerEvent({
        type: 'changehaste',
        // We don't need more; the new Haste is pulled straight from the Haste module
        timestamp: parserMock.currentTimestamp,
      });
    };
  });

  // This might be considered implementation detail, but it's also kinda the only way. Code doesn't magically run, so the only way to trigger our cooldown handling is with an event.
  const triggerCooldownExpiryCheck = () => instance.triggerEvent({});

  describe('regular spell status tracking', () => {
    it('a spell starts off cooldown', () => {
      expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(false);
      expect(instance.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(true);
    });
    it('a cast causes the spell to go on cooldown', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(true);
    });
    it('even if a spell has another charge left it\'s still considered on cooldown', () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(true);
    });
    it('when a regular spell with no extra charges goes on cooldown, the spell becomes unavailable', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      expect(instance.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(false);
    });
    it('when a spell with multiple charges has another charge available, it is still available', () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      expect(instance.isAvailable(SPELLS.FAKE_SPELL.id)).toBe(true);
    });
    it('when a spell with multiple charges has all charges on cooldown, the spell becomes unavailable', () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
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
      triggerCooldownExpiryCheck();

      expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(false);
    });
    it('the cooldown restarts when a cooldown on a spell with multiple charges on cooldown finishes', () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      triggerCast(SPELLS.FAKE_SPELL.id);
      parserMock.currentTimestamp = 10000;
      triggerCooldownExpiryCheck();

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
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      parserMock.currentTimestamp = 5000;
      parserMock.triggerEvent = jest.fn();
      triggerCast(SPELLS.FAKE_SPELL.id);

      // It does NOT report when this happens, as it's normal behavior.
      expect(console.error).not.toHaveBeenCalled();
      // Its cooldown is still based on the first cast (charges don't recharge simultaneously)
      expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(2500); // 7500 - 5000
    });
  });

  describe('public API', () => {
    it('reducing a cooldown returns the reduction applied', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      const result = instance.reduceCooldown(SPELLS.FAKE_SPELL.id, 1500);

      expect(result).toBe(1500);
      expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(6000); // 7500 - 1500
    });
    it('reducing a cooldown beyond its duration finishes the cooldown', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      const result = instance.reduceCooldown(SPELLS.FAKE_SPELL.id, 8000);

      expect(result).toBe(7500);
      expect(instance.isOnCooldown(SPELLS.FAKE_SPELL.id)).toBe(false);
    });
    it('reducing a spell with multiple charges on cooldown reduces the CD time on the next charge if it fully recharges the first charge', () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      triggerCast(SPELLS.FAKE_SPELL.id);
      parserMock.currentTimestamp = 6000; //Leaves 1500ms cooldown remaining of the total 7500ms of the first charge recharging.
      const reduction = instance.reduceCooldown(SPELLS.FAKE_SPELL.id, 5000); 
      expect(reduction).toBe(5000);    
    });
    it('reduceCooldown on a spell not on cooldown throws', () => {
      // We throw instead of returning something like null so that implementers *have* to take this into consideration.
      expect(() => {
        instance.reduceCooldown(SPELLS.FAKE_SPELL.id, 1500);
      }).toThrow();
    });
    it('refreshing a cooldown sets the remaining time back to full', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      parserMock.currentTimestamp = 5000;

      instance.refreshCooldown(SPELLS.FAKE_SPELL.id);

      expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(7500);
    });
    it('refreshCooldown on a spell not on cooldown throws', () => {
      // We throw instead of returning something like null so that implementers *have* to take this into consideration.
      expect(() => {
        instance.refreshCooldown(SPELLS.FAKE_SPELL.id);
      }).toThrow();
    });
    it('endCooldown on a spell not on cooldown throws', () => {
      // We throw instead of returning something like null so that implementers *have* to take this into consideration.
      expect(() => {
        instance.endCooldown(SPELLS.FAKE_SPELL.id);
      }).toThrow();
    });
    it('cooldownRemaining on a spell not on cooldown throws', () => {
      // We throw instead of returning something like null so that implementers *have* to take this into consideration.
      expect(() => {
        instance.cooldownRemaining(SPELLS.FAKE_SPELL.id);
      }).toThrow();
    });
  });

  describe('custom events', () => {
    // Custom event tests are separate to keep the above tests much simpler and cleaner. Their separation isn't *that* weird.
    it('a new spell going on cooldown triggers an `updatespellusable` event indicating the spell going on cooldown', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);

      expect(parserMock.triggerEvent).toHaveBeenCalledTimes(1);
      const call = parserMock.triggerEvent.mock.calls[0];
      expect(call[0]).toEqual({
        type: 'updatespellusable',
        spellId: SPELLS.FAKE_SPELL.id,
        timestamp: 0,
        start: 0,
        expectedDuration: 7500,
        totalReductionTime: 0,
        trigger: 'begincooldown',
        isOnCooldown: true,
        isAvailable: false,
        chargesAvailable: 0,
        chargesOnCooldown: 1,
        maxCharges: 1,
        timePassed: 0,
        sourceID: parserMock.playerId,
        targetID: parserMock.playerId,
      });
    });
    it('casting a spell already on cooldown before the cooldown runs out restarts the cooldown and fires both endcooldown and begincooldown events', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      parserMock.triggerEvent = jest.fn();
      triggerCast(SPELLS.FAKE_SPELL.id);

      expect(parserMock.triggerEvent).toHaveBeenCalledTimes(2);
      {
        const call = parserMock.triggerEvent.mock.calls[0];
        expect(call[0]).toEqual({
          type: 'updatespellusable',
          spellId: SPELLS.FAKE_SPELL.id,
          timestamp: 0,
          start: 0,
          end: 0,
          expectedDuration: 7500,
          totalReductionTime: 0,
          trigger: 'endcooldown',
          isOnCooldown: false,
          isAvailable: true,
          chargesAvailable: 1,
          chargesOnCooldown: 1,
          maxCharges: 1,
          sourceID: parserMock.playerId,
          targetID: parserMock.playerId,
        });
      }
      {
        const call = parserMock.triggerEvent.mock.calls[1];
        expect(call[0]).toEqual({
          type: 'updatespellusable',
          spellId: SPELLS.FAKE_SPELL.id,
          timestamp: 0,
          start: 0,
          expectedDuration: 7500,
          totalReductionTime: 0,
          trigger: 'begincooldown',
          isOnCooldown: true,
          isAvailable: false,
          chargesAvailable: 0,
          chargesOnCooldown: 1,
          maxCharges: 1,
          timePassed: 0,
          sourceID: parserMock.playerId,
          targetID: parserMock.playerId,
        });
      }
    });
    it('using another charge of a spell already on cooldown triggers an `updatespellusable` event indicating the charge going on cooldown', () => {
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      parserMock.triggerEvent = jest.fn();
      triggerCast(SPELLS.FAKE_SPELL.id);

      expect(parserMock.triggerEvent).toHaveBeenCalledTimes(1);
      const call = parserMock.triggerEvent.mock.calls[0];
      expect(call[0]).toEqual({
        type: 'updatespellusable',
        spellId: SPELLS.FAKE_SPELL.id,
        timestamp: 0,
        start: 0,
        expectedDuration: 7500,
        totalReductionTime: 0,
        trigger: 'addcooldowncharge',
        isOnCooldown: true,
        isAvailable: false,
        chargesAvailable: 0,
        chargesOnCooldown: 2,
        maxCharges: 2,
        timePassed: 0,
        sourceID: parserMock.playerId,
        targetID: parserMock.playerId,
      });
    });
    it('a spell going off cooldown triggers an `updatespellusable` event indicating the spell going off cooldown', () => {
      parserMock.currentTimestamp = 0;
      triggerCast(SPELLS.FAKE_SPELL.id);
      parserMock.currentTimestamp = 10000;
      parserMock.triggerEvent = jest.fn();
      triggerCooldownExpiryCheck();

      expect(parserMock.triggerEvent).toHaveBeenCalledTimes(1);
      const call = parserMock.triggerEvent.mock.calls[0];
      expect(call[0]).toEqual({
        type: 'updatespellusable',
        spellId: SPELLS.FAKE_SPELL.id,
        timestamp: 7500, // it should be simulated at the time of expiry
        start: 0,
        end: 7500,
        expectedDuration: 7500,
        totalReductionTime: 0,
        trigger: 'endcooldown',
        isOnCooldown: false,
        isAvailable: true,
        chargesAvailable: 1,
        chargesOnCooldown: 1,
        maxCharges: 1,
        sourceID: parserMock.playerId,
        targetID: parserMock.playerId,
      });
    });
    it('a spell having a charge restored while there\'s still another charge recharging, triggers an `updatespellusable` event indicating the charge being available again and another `updatespellusable` event to indicate the cooldown starting to recharge the next charge', () => {
      // We want begincooldown -> endcooldown to really be about spells going on cooldown to be as simple as possible, so adding/restoring charges are handled differently. Since all events we fire are with type `updatespellusable` this only matters for the `trigger` property which might not even be used much as the other properties of the event should give enough information.
      abilitiesMock.getMaxCharges = jest.fn(() => 2);
      triggerCast(SPELLS.FAKE_SPELL.id);
      triggerCast(SPELLS.FAKE_SPELL.id);
      parserMock.currentTimestamp = 10000;
      parserMock.triggerEvent = jest.fn();
      triggerCooldownExpiryCheck();

      expect(parserMock.triggerEvent).toHaveBeenCalledTimes(2);
      {
        const call = parserMock.triggerEvent.mock.calls[0];
        expect(call[0]).toEqual({
          type: 'updatespellusable',
          spellId: SPELLS.FAKE_SPELL.id,
          timestamp: 7500, // it should be simulated at the time of expiry
          start: 0,
          expectedDuration: 7500,
          totalReductionTime: 0,
          trigger: 'restorecharge',
          isOnCooldown: true,
          isAvailable: true,
          chargesAvailable: 1,
          chargesOnCooldown: 1,
          maxCharges: 2,
          timePassed: 7500,
          sourceID: parserMock.playerId,
          targetID: parserMock.playerId,
        });
      }
      {
        const call = parserMock.triggerEvent.mock.calls[1];
        expect(call[0]).toEqual({
          type: 'updatespellusable',
          spellId: SPELLS.FAKE_SPELL.id,
          timestamp: 7500, // it should be simulated at the time of expiry
          start: 7500,
          expectedDuration: 7500,
          totalReductionTime: 0,
          trigger: 'refreshcooldown',
          isOnCooldown: true,
          isAvailable: true,
          chargesAvailable: 1,
          chargesOnCooldown: 1,
          maxCharges: 2,
          timePassed: 0,
          sourceID: parserMock.playerId,
          targetID: parserMock.playerId,
        });
      }
    });
  });

  describe('Haste scaling cooldowns', () => {
    it('updates active cooldowns when Haste increases', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      parserMock.currentTimestamp = 1000;
      // Simulate Haste increasing which would reduce our spell's cooldown to 6s (down from 7.5sec)
      abilitiesMock.getExpectedCooldownDuration = jest.fn(() => 6000);
      triggerHasteChange();

      // New expected cooldown is `1000 + (6000 * (1 - (1000 / 7500)))=6200`, but we already spent 1000ms on cooldown, so what's remaining is 5200.
      expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(5200);
    });
    it('updates active cooldowns when Haste decreases', () => {
      triggerCast(SPELLS.FAKE_SPELL.id);
      parserMock.currentTimestamp = 1000;
      // Simulate Haste decreasing which would increase our spell's cooldown to 9s (up from 7.5sec)
      abilitiesMock.getExpectedCooldownDuration = jest.fn(() => 9000);
      triggerHasteChange();

      // New expected cooldown is `1000 + (6000 * (1 - (1000 / 7500)))=8800`, but we already spent 1000ms on cooldown, so what's remaining is 7800.
      expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(7800);
    });
    it('CDRs are static and unaffected by Haste changes', () => {
      triggerCast(SPELLS.FAKE_SPELL.id); // cooldown is now 7500
      instance.reduceCooldown(SPELLS.FAKE_SPELL.id, 1500); // cooldown is now 6000
      abilitiesMock.getExpectedCooldownDuration = jest.fn(() => 9000);
      parserMock.currentTimestamp = 2000;
      triggerHasteChange();

      // Total expected cooldown:
      // cd progress = time passed / old CD duration before CDRs
      // new CD = timePassed + (100% - cd progress) * new CD with new Haste - sum CDRs
      // new CD = 2000 + (1 - 2000 / 7500) * 9000 - 1500
      // Remaining: total - 2000 (since current timestamp is 2000).
      // If this returns 6000 the CDR is applied before the Haste adjusting and therefore invalid.
      expect(instance.cooldownRemaining(SPELLS.FAKE_SPELL.id)).toBe(5100);
    });
  });
});
