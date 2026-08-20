import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';

import { Condition } from '../index';

export interface SpellSpecificAlternative<T = unknown> {
  spell: Spell;
  condition: Condition<T>;
}

/**
 * Creates a condition for a spell-list rule where each spell has its own
 * condition. This lets an APL express source-supported alternatives without
 * making every spell in the list valid whenever any one condition is true.
 */
export default function spellSpecific(
  alternatives: SpellSpecificAlternative<any>[], // oxlint-disable-line typescript-eslint/no-explicit-any -- heterogeneous condition states
): Condition<Record<string, unknown>> {
  const entries = alternatives.map((alternative, index) => ({
    ...alternative,
    stateKey: `${index}-${alternative.spell.id}-${alternative.condition.key}`,
  }));

  return {
    key: `spellSpecific-${entries.map(({ stateKey }) => stateKey).join('-')}`,
    lookahead: entries.reduce<number | undefined>(
      (longest, { condition }) => Math.max(longest ?? 0, condition.lookahead ?? 0) || undefined,
      undefined,
    ),
    init: (info) =>
      Object.fromEntries(
        entries.map(({ stateKey, condition }) => [stateKey, condition.init(info)]),
      ),
    update: (state, event) =>
      Object.fromEntries(
        entries.map(({ stateKey, condition }) => [
          stateKey,
          condition.update(state[stateKey], event),
        ]),
      ),
    validate: (state, event, spell, lookahead) =>
      entries
        .filter((entry) => entry.spell.id === spell.id)
        .some(({ stateKey, condition }) =>
          condition.validate(state[stateKey], event, spell, lookahead),
        ),
    describe: (tense) => (
      <>
        a source-supported condition for{' '}
        {entries.map(({ spell, stateKey }, index) => (
          <span key={stateKey}>
            {index > 0 && ' or '}
            <SpellLink spell={spell} />
          </span>
        ))}{' '}
        is met
      </>
    ),
  };
}
