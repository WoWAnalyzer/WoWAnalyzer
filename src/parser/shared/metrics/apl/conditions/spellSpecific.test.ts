import { buffPresent } from './buffPresent';
import spellSpecific from './spellSpecific';
import { cast, dummyBuff, dummyCast, runCondition } from './test-tools';
import { EventType } from 'parser/core/Events';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';

const otherCast = { id: 3, name: 'Other Cast', icon: 'other' };

describe('spellSpecific', () => {
  it('validates each spell against only its own condition', () => {
    const firstBuff = dummyBuff;
    const secondBuff = { id: 4, name: 'Second Buff', icon: 'second' };
    const condition = spellSpecific([
      { spell: dummyCast, condition: buffPresent(firstBuff) },
      { spell: otherCast, condition: buffPresent(secondBuff) },
    ]);
    const state = runCondition(condition, [
      {
        timestamp: 1,
        type: EventType.ApplyBuff,
        ability: {
          guid: firstBuff.id,
          name: firstBuff.name,
          abilityIcon: firstBuff.icon,
          type: MAGIC_SCHOOLS.ids.PHYSICAL,
        },
        sourceID: 1,
        targetID: 1,
        sourceIsFriendly: true,
        targetIsFriendly: true,
      },
    ]);

    expect(condition.validate(state, cast(2, dummyCast), dummyCast, [])).toBe(true);
    expect(condition.validate(state, cast(2, otherCast), otherCast, [])).toBe(false);
  });
});
