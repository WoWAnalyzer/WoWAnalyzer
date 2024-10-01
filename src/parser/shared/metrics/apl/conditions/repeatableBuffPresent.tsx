import Spell from 'common/SPELLS/Spell';
import { formatRange, Range } from './util';
import { Condition, tenseAlt } from '../index';
import { EventType } from 'parser/core/Events';
import SpellLink from 'interface/SpellLink';

/**
 * Buffs that can occur as multiple unique instances, but do not stack. Examples include the buffs granted by each Elemental Spirit from Enhancement Shaman
 * @param spell {@link Spell} or array of spells the condition should match
 * @param range Range of occurances to match
 * @param latencyOffset
 */
export function repeatableBuffPresent(
  spell: Spell | Spell[],
  range: Range,
  latencyOffset: number = 0,
): Condition<{ [spellId: number]: number }> {
  if (!Array.isArray(spell)) {
    spell = [spell];
  }
  const spellId = spell.map((s) => s.id);
  return {
    key: `repeatableBuffPresent-${spellId.join('-')}`,
    init: () => [],
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyBuff:
          if (spellId.includes(event.ability.guid)) {
            state[event.ability.guid] ??= 0;
            state[event.ability.guid] += 1;
          }
          break;
        case EventType.RemoveBuff:
          if (spellId.includes(event.ability.guid)) {
            state[event.ability.guid] ??= 0;
            state[event.ability.guid] -= 1;
            if (state[event.ability.guid] === 0) {
              delete state[event.ability.guid];
            }
          }
          break;
      }
      return state;
    },
    validate: (state, _event) => {
      const count = Object.keys(state).reduce((total, id) => (total += state[Number(id)]), 0);
      return count >= (range.atLeast || 0) && (range.atMost === undefined || count <= range.atMost);
    },
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} {formatRange(range)} of{' '}
        {spell.reduce((value: React.ReactNode, s: Spell, index: number) => {
          const spellLink = <SpellLink spell={s} />;
          if (value === null) {
            value = <>{spellLink}</>;
          } else {
            value = (
              <>
                {value}, {index === spell.length - 1 ? ' or ' : ''}
                {spellLink}
              </>
            );
          }
          return value;
        }, null)}
      </>
    ),
  };
}
