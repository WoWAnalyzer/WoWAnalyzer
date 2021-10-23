import type { Condition } from '../index';

// A condition that should apply if the correct spell is cast, even if the other underlying condition doesn't match.
//
// This is useful for untrackable things like Ashen Hallow or Grand Crusader.
//
// This behavior is present for unconditional spells, but adding a condition
// disables it because we can't automatically tell if it is correct.
export default function always<T>(cnd: Condition<T>): Condition<T> {
  return {
    ...cnd,
    key: `always-${cnd.key}`,
    validate: (state, event, spell) =>
      event.ability.guid === spell.id || cnd.validate(state, event, spell),
  };
}
