import type Spell from 'common/SPELLS/Spell';
import { Range, formatRange } from './index';
import { tenseAlt, Condition } from '../index';
import { HasAbility, HasTarget, EventType, CastEvent } from 'parser/core/Events';

export default function targetsHit(
  range: Range,
  lookahead: number = 100,
  type: EventType = EventType.Damage,
  targetSpell?: Spell,
): Condition<void> {
  return {
    key: `targets-hit-${range.atLeast}-${range.atMost}-${lookahead}`,
    lookahead,
    init: () => {
      return;
    },
    update: () => {
      return;
    },
    validate: (_state, event, spell, lookahead) => {
      if (event.ability.guid !== spell.id) {
        return false;
      }
      const targets = new Set();

      const targetSpellId = targetSpell ? targetSpell.id : spell.id;
      for (const fwdEvent of lookahead) {
        if (
          fwdEvent.type === type &&
          HasAbility(fwdEvent) &&
          HasTarget(fwdEvent) &&
          fwdEvent.ability.guid === targetSpellId
        ) {
          targets.add(`${fwdEvent.targetID}-${fwdEvent.targetInstance || 'none'}`);
        }
      }
      return (
        targets.size >= (range.atLeast || 0) && (!range.atMost || targets.size <= range.atMost)
      );
    },
    describe: (tense) => `it ${tenseAlt(tense, 'would', 'will')} hit ${formatRange(range)} targets`,
  };
}
