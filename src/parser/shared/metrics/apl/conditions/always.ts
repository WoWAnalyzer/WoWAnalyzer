import type { Condition } from '../index';

// A condition that should apply if the correct spell is cast, even if the other
// underlying condition doesn't match.
//
// This is useful for untrackable things like Ashen Hallow or Grand Crusader,
// spells that are supposed to be only castable during other buffs, etc.
// Basically any time that the condition is used to prevent being marked wrong
// for casting a spell that is off cooldown but otherwise uncastable.
//
// This behavior is already present for unconditional spells.
export default function always<T>(cnd: Condition<T>): Condition<T> {
  return {
    ...cnd,
    key: `always-${cnd.key}`,
    validate: (state, event, spell, lookahead) =>
      event.ability.guid === spell.id || cnd.validate(state, event, spell, lookahead),
  };
}
