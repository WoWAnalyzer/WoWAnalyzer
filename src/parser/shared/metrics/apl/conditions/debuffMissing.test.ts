import Spell from 'common/SPELLS/Spell';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { CastEvent, DamageEvent, EventType, MappedEvent } from 'parser/core/Events';
import { debuffMissing } from './debuffMissing';
import { cast, dummyBuff, dummyCast, runCondition } from './test-tools';

type DebuffEventType =
  | EventType.ApplyDebuff
  | EventType.RefreshDebuff
  | EventType.RemoveDebuff
  | EventType.ApplyDebuffStack;
function debuff<T extends DebuffEventType>(
  timestamp: number,
  spell: Spell,
  type: T,
  targetID: number,
  targetInstance?: number,
): MappedEvent<T> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
    targetID,
    targetInstance,
    sourceIsFriendly: true,
    targetIsFriendly: false,
  } as MappedEvent<T>;
}

describe('debuffMissing', () => {
  describe('non-pandemic case', () => {
    it('should validate a cast that occurs when no debuffs have been seen', () => {
      const cnd = debuffMissing(dummyBuff);
      const state = runCondition(cnd, []);

      expect(cnd.validate(state, cast(1000, dummyCast), dummyCast, [])).toBe(true);
    });

    it('should validate a cast that occurs after the debuff expires, not during the debuff', () => {
      const cnd = debuffMissing(dummyBuff);
      const state = runCondition(cnd, [debuff(1000, dummyBuff, EventType.ApplyDebuff, 100)]);

      expect(cnd.validate(state, cast(2000, dummyCast, 100), dummyCast, [])).toBe(false);

      const nextState = runCondition(
        cnd,
        [debuff(9000, dummyBuff, EventType.RemoveDebuff, 100)],
        state,
      );
      expect(cnd.validate(nextState, cast(9001, dummyCast, 100), dummyCast, [])).toBe(true);
    });

    it('should not validate a cast that occurs after a buff has been refreshed', () => {
      const cnd = debuffMissing(dummyBuff);
      const state = runCondition(cnd, [
        debuff(1000, dummyBuff, EventType.ApplyDebuff, 100),
        debuff(4000, dummyBuff, EventType.RefreshDebuff, 100),
      ]);

      expect(cnd.validate(state, cast(5000, dummyCast, 100), dummyCast, [])).toBe(false);

      const nextState = runCondition(
        cnd,
        [debuff(9000, dummyBuff, EventType.RemoveDebuff, 100)],
        state,
      );
      expect(cnd.validate(nextState, cast(9001, dummyCast, 100), dummyCast, [])).toBe(true);
    });

    it('should validate casts based on target and target instance', () => {
      const cnd = debuffMissing(dummyBuff);
      const state = runCondition(cnd, [
        debuff(1000, dummyBuff, EventType.ApplyDebuff, 100),
        debuff(1000, dummyBuff, EventType.ApplyDebuff, 200, 1),
      ]);

      expect(cnd.validate(state, cast(5000, dummyCast, 100), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(5000, dummyCast, 200, 1), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(5000, dummyCast, 200, 2), dummyCast, [])).toBe(true);
      expect(cnd.validate(state, cast(5000, dummyCast, 300), dummyCast, [])).toBe(true);
    });

    it('should use target config to locate targets via linked events', () => {
      const cnd = debuffMissing(dummyBuff, undefined, {
        targetLinkRelation: 'test-target-link',
      });

      const state = runCondition(cnd, [
        debuff(1000, dummyBuff, EventType.ApplyDebuff, 100),
        debuff(1000, dummyBuff, EventType.ApplyDebuff, 200, 1),
      ]);

      // note: when `targetLinkRelation` is used, it takes precedence over the cast target
      const linkedCast = (targetID: number, targetInstance?: number): CastEvent => ({
        ...cast(5000, dummyCast, 100),
        _linkedEvents: [
          {
            relation: 'test-target-link',
            event: {
              type: EventType.Damage,
              targetID,
              targetInstance,
            } as unknown as DamageEvent,
          },
        ],
      });

      expect(cnd.validate(state, cast(5000, dummyCast, 100), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, linkedCast(200, 1), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, linkedCast(200, 2), dummyCast, [])).toBe(true);
      expect(cnd.validate(state, linkedCast(300), dummyCast, [])).toBe(true);
    });
  });

  describe('pandemic case', () => {
    it('should validate early refreshes based on `timeRemaining`', () => {
      const cnd = debuffMissing(dummyBuff, {
        duration: 8000,
        timeRemaining: 2000,
        pandemicCap: 1,
      });

      const state = runCondition(cnd, [
        debuff(100, dummyBuff, EventType.ApplyDebuff, 100),
        debuff(1000, dummyBuff, EventType.RefreshDebuff, 100),
      ]);

      expect(cnd.validate(state, cast(5000, dummyCast, 100), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(7001, dummyCast, 100), dummyCast, [])).toBe(true);
      expect(cnd.validate(state, cast(10000, dummyCast, 100), dummyCast, [])).toBe(true);
    });

    it('should do a partial extend if less than (cap - 100%) of the debuff remains', () => {
      const cnd = debuffMissing(dummyBuff, {
        duration: 8000,
        // turning off early refresh to check duration calculations more easily
        timeRemaining: 0,
        pandemicCap: 1.5,
      });
      const state = runCondition(cnd, [
        debuff(1000, dummyBuff, EventType.ApplyDebuff, 100),
        debuff(6500, dummyBuff, EventType.RefreshDebuff, 100),
      ]);

      // debuff should expire at 6500 + 8000 + (8000 - (6500 - 1000)) = 14500 + 8000 - 5500 = 17000
      // (bugged) full extension would be at 6500 + 8000 + 4000 = 18500
      // un-pandemic expiration would be at 14500

      expect(cnd.validate(state, cast(14000, dummyCast, 100), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(15000, dummyCast, 100), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(17000, dummyCast, 100), dummyCast, [])).toBe(false);
      expect(cnd.validate(state, cast(17001, dummyCast, 100), dummyCast, [])).toBe(true);
    });

    it("should respect event-based removal prior to tracked duration's expiration", () => {
      const cnd = debuffMissing(dummyBuff, {
        duration: 8000,
        // turning off early refresh to check duration calculations more easily
        timeRemaining: 2000,
        pandemicCap: 1.5,
      });
      const state = runCondition(cnd, [
        debuff(1000, dummyBuff, EventType.ApplyDebuff, 100),
        debuff(6500, dummyBuff, EventType.RefreshDebuff, 100),
      ]);

      expect(cnd.validate(state, cast(10000, dummyCast, 100), dummyCast, [])).toBe(false);

      const nextState = runCondition(
        cnd,
        [debuff(12000, dummyBuff, EventType.RemoveDebuff, 100)],
        state,
      );
      expect(cnd.validate(nextState, cast(12001, dummyCast, 100), dummyCast, [])).toBe(true);
    });
  });
});
