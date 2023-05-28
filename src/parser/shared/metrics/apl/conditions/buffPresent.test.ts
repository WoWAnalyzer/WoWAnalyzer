import Spell from 'common/SPELLS/Spell';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { ApplyBuffEvent, EventType, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { buffMissing } from './buffPresent';
import { cast, dummyBuff, dummyCast, runCondition } from './test-tools';

function buff(
  timestamp: number,
  spell: Spell,
  type: EventType.ApplyBuff | EventType.RemoveBuff | EventType.RefreshBuff,
): ApplyBuffEvent | RemoveBuffEvent | RefreshBuffEvent {
  return {
    timestamp,
    type,
    ability: {
      guid: spell.id,
      name: spell.name,
      type: MAGIC_SCHOOLS.ids.PHYSICAL,
      abilityIcon: spell.icon,
    },
    sourceID: 1,
    targetID: 1,
    sourceIsFriendly: true,
    targetIsFriendly: true,
  };
}

describe('buffMissing', () => {
  describe('non-pandemic case', () => {
    it('should validate a cast that occurs when no buff has been seen', () => {
      const cnd = buffMissing(dummyBuff);
      const state = runCondition(cnd, []);

      expect(cnd.validate(state, cast(1000, dummyCast), dummyCast, [])).toBe(true);
    });

    it('should validate a cast that occurs after a buff expires', () => {
      const cnd = buffMissing(dummyBuff);
      const state = runCondition(cnd, [
        buff(1000, dummyBuff, EventType.ApplyBuff),
        buff(9000, dummyBuff, EventType.RemoveBuff),
      ]);

      expect(cnd.validate(state, cast(10000, dummyCast), dummyCast, [])).toBe(true);
    });

    it('should not validate a cast that occurs during a buff', () => {
      const cnd = buffMissing(dummyBuff);
      const state = runCondition(cnd, [buff(1000, dummyBuff, EventType.ApplyBuff)]);

      expect(cnd.validate(state, cast(10000, dummyCast), dummyCast, [])).toBe(false);

      const nextState = runCondition(cnd, [buff(9000, dummyBuff, EventType.RemoveBuff)], state);

      expect(cnd.validate(nextState, cast(12000, dummyCast), dummyCast, [])).toBe(true);
    });

    it('should not validate a cast that occurs after a buff has been refreshed', () => {
      const cnd = buffMissing(dummyBuff);
      const state = runCondition(cnd, [
        buff(1000, dummyBuff, EventType.ApplyBuff),
        buff(9000, dummyBuff, EventType.RefreshBuff),
      ]);

      expect(cnd.validate(state, cast(10000, dummyCast), dummyCast, [])).toBe(false);

      const nextState = runCondition(cnd, [buff(9000, dummyBuff, EventType.RemoveBuff)], state);

      expect(cnd.validate(nextState, cast(12000, dummyCast), dummyCast, [])).toBe(true);
    });

    it('should use buff duration data to validate the expiration', () => {
      const cnd = buffMissing(dummyBuff, {
        duration: 8000,
        timeRemaining: 0,
        pandemicCap: 1,
      });
      const state = runCondition(cnd, [
        buff(100, dummyBuff, EventType.ApplyBuff),
        buff(1000, dummyBuff, EventType.RefreshBuff),
      ]);

      expect(cnd.validate(state, cast(7000, dummyCast), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(9001, dummyCast), dummyCast, [])).toBe(true);

      const nextState = runCondition(cnd, [buff(9000, dummyBuff, EventType.RemoveBuff)], state);

      expect(cnd.validate(nextState, cast(12000, dummyCast), dummyCast, [])).toBe(true);
    });
  });

  describe('pandemic case', () => {
    it('should validate early casts based on `timeRemaining`', () => {
      const cnd = buffMissing(dummyBuff, {
        duration: 8000,
        timeRemaining: 2000,
        pandemicCap: 1,
      });
      const state = runCondition(cnd, [
        buff(100, dummyBuff, EventType.ApplyBuff),
        buff(1000, dummyBuff, EventType.RefreshBuff),
      ]);

      expect(cnd.validate(state, cast(5000, dummyCast), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(7001, dummyCast), dummyCast, [])).toBe(true);
      expect(cnd.validate(state, cast(10000, dummyCast), dummyCast, [])).toBe(true);
    });

    it('should extend the tracked buff duration up to the pandemic cap and use that for validation', () => {
      const cnd = buffMissing(dummyBuff, {
        duration: 8000,
        timeRemaining: 2000,
        pandemicCap: 1.5,
      });
      const state = runCondition(cnd, [
        buff(100, dummyBuff, EventType.ApplyBuff),
        buff(1000, dummyBuff, EventType.RefreshBuff),
      ]);

      // buff should expire at 1000 + 1.5 * 8000 = 1000 + 8000 + 4000 = 13000

      expect(cnd.validate(state, cast(5000, dummyCast), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(7001, dummyCast), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(11000, dummyCast), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(11001, dummyCast), dummyCast, [])).toBe(true);
      expect(cnd.validate(state, cast(13001, dummyCast), dummyCast, [])).toBe(true);
    });

    it('should do a partial extend if less than (cap - 100%) of the buff remains', () => {
      const cnd = buffMissing(dummyBuff, {
        duration: 8000,
        // turning off early refresh to check duration calculations more easily
        timeRemaining: 0,
        pandemicCap: 1.5,
      });
      const state = runCondition(cnd, [
        buff(1000, dummyBuff, EventType.ApplyBuff),
        buff(6500, dummyBuff, EventType.RefreshBuff),
      ]);

      // buff should expire at 6500 + 8000 + (8000 - (6500 - 1000)) = 14500 + 8000 - 5500 = 17000
      // un-pandemic expiration would be at 14500

      expect(cnd.validate(state, cast(14000, dummyCast), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(15000, dummyCast), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(17000, dummyCast), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(17001, dummyCast), dummyCast, [])).toBe(true);
    });

    it('should correctly validate an event in the refresh window with partial extension', () => {
      const cnd = buffMissing(dummyBuff, {
        duration: 8000,
        // turning off early refresh to check duration calculations more easily
        timeRemaining: 2000,
        pandemicCap: 1.5,
      });
      const state = runCondition(cnd, [
        buff(1000, dummyBuff, EventType.ApplyBuff),
        buff(6500, dummyBuff, EventType.RefreshBuff),
      ]);

      // buff should expire at 6500 + 8000 + (8000 - (6500 - 1000)) = 14500 + 8000 - 5500 = 17000
      // un-pandemic expiration would be at 14500
      // refresh window starts at 15001
      expect(cnd.validate(state, cast(14000, dummyCast), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(15000, dummyCast), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(15001, dummyCast), dummyCast, [])).toBe(true);
      expect(cnd.validate(state, cast(17000, dummyCast), dummyCast, [])).toBe(true);
    });

    it("should respect event-based removal prior to tracked duration's expiration", () => {
      const cnd = buffMissing(dummyBuff, {
        duration: 8000,
        // turning off early refresh to check duration calculations more easily
        timeRemaining: 2000,
        pandemicCap: 1.5,
      });
      const state = runCondition(cnd, [
        buff(1000, dummyBuff, EventType.ApplyBuff),
        buff(6500, dummyBuff, EventType.RefreshBuff),
      ]);

      expect(cnd.validate(state, cast(10000, dummyCast), dummyCast, [])).toBe(false);

      const nextState = runCondition(cnd, [buff(12000, dummyBuff, EventType.RemoveBuff)], state);
      expect(cnd.validate(nextState, cast(12001, dummyCast), dummyCast, [])).toBe(true);
    });
  });
});
