import Spell from 'common/SPELLS/Spell';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, CastEvent, DamageEvent, EventType } from 'parser/core/Events';

import { cast, dummyBuff, dummyCast, runCondition } from './test-tools';
import targetDebuffStacks from './targetDebuffStacks';

type StackEventType =
  | EventType.ApplyDebuff
  | EventType.ApplyDebuffStack
  | EventType.RemoveDebuffStack
  | EventType.RemoveDebuff;

function stackEvent<T extends StackEventType>(
  timestamp: number,
  spell: Spell,
  type: T,
  targetID: number,
  stack?: number,
  targetInstance?: number,
): AnyEvent<T> {
  return {
    timestamp,
    type,
    ability: {
      guid: spell.id,
      name: spell.name,
      type: MAGIC_SCHOOLS.ids.FROST,
      abilityIcon: spell.icon,
    },
    sourceID: 1,
    targetID,
    targetInstance,
    sourceIsFriendly: true,
    targetIsFriendly: false,
    ...(stack === undefined ? {} : { stack }),
  } as AnyEvent<T>;
}

describe('targetDebuffStacks', () => {
  it('tracks stacks independently by target and target instance', () => {
    const condition = targetDebuffStacks(dummyBuff, { atLeast: 5 });
    const state = runCondition(condition, [
      stackEvent(1000, dummyBuff, EventType.ApplyDebuffStack, 100, 5),
      stackEvent(1000, dummyBuff, EventType.ApplyDebuffStack, 200, 4, 1),
    ]);

    expect(condition.validate(state, cast(2000, dummyCast, 100), dummyCast, [])).toBe(true);
    expect(condition.validate(state, cast(2000, dummyCast, 200, 1), dummyCast, [])).toBe(false);
    expect(condition.validate(state, cast(2000, dummyCast, 200, 2), dummyCast, [])).toBe(false);
  });

  it('updates and removes only the affected target', () => {
    const condition = targetDebuffStacks(dummyBuff, { atMost: 1 });
    const initial = runCondition(condition, [
      stackEvent(1000, dummyBuff, EventType.ApplyDebuffStack, 100, 5),
      stackEvent(1000, dummyBuff, EventType.ApplyDebuffStack, 200, 5),
    ]);
    const reduced = runCondition(
      condition,
      [stackEvent(2000, dummyBuff, EventType.RemoveDebuffStack, 100, 1)],
      initial,
    );

    expect(condition.validate(reduced, cast(3000, dummyCast, 100), dummyCast, [])).toBe(true);
    expect(condition.validate(reduced, cast(3000, dummyCast, 200), dummyCast, [])).toBe(false);

    const removed = runCondition(
      condition,
      [stackEvent(4000, dummyBuff, EventType.RemoveDebuff, 200)],
      reduced,
    );
    expect(condition.validate(removed, cast(5000, dummyCast, 200), dummyCast, [])).toBe(true);
  });

  it('does not guess when an event has no trustworthy target', () => {
    const condition = targetDebuffStacks(dummyBuff, { atLeast: 5 });
    const state = runCondition(condition, [
      stackEvent(1000, dummyBuff, EventType.ApplyDebuffStack, 100, 5),
    ]);
    const untargeted = { ...cast(2000, dummyCast), targetID: undefined } as unknown as CastEvent;

    expect(condition.validate(state, untargeted, dummyCast, [])).toBe(false);
  });

  it("does not use another player's debuff stacks", () => {
    const condition = targetDebuffStacks(dummyBuff, { atLeast: 5 });
    const event = stackEvent(1000, dummyBuff, EventType.ApplyDebuffStack, 100, 5);
    const state = runCondition(condition, [{ ...event, sourceID: 2 }]);

    expect(condition.validate(state, cast(2000, dummyCast, 100), dummyCast, [])).toBe(false);
  });

  it('can resolve an untargeted cast through linked damage', () => {
    const condition = targetDebuffStacks(
      dummyBuff,
      { atLeast: 5 },
      { targetLinkRelation: 'test-target-link' },
    );
    const state = runCondition(condition, [
      stackEvent(1000, dummyBuff, EventType.ApplyDebuffStack, 100, 5),
    ]);
    const linkedCast: CastEvent = {
      ...cast(2000, dummyCast, 200),
      _linkedEvents: [
        {
          relation: 'test-target-link',
          event: {
            type: EventType.Damage,
            targetID: 100,
          } as unknown as DamageEvent,
        },
      ],
    };

    expect(condition.validate(state, linkedCast, dummyCast, [])).toBe(true);
  });
});
