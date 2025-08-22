import { Talent } from 'common/TALENTS/types';
import { SpellLink } from 'interface';

import { Condition, tenseAlt } from '../index';
import Spell from 'common/SPELLS/Spell';

export default function hasTalent(talent: Talent): Condition<boolean> {
  return {
    key: `hasTalent-${talent.id}`,
    init: ({ combatant }) => combatant.hasTalent(talent),
    update: (state, _event) => state,
    validate: (state, _event) => state,
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} <SpellLink spell={talent.id} /> talented
      </>
    ),
  };
}

export function hasClassicTalent(talent: Spell): Condition<boolean> {
  return {
    key: `hasClassicTalent-${talent.id}`,
    init: ({ combatant }) => combatant.hasClassicTalent(talent),
    update: (state, _event) => state,
    validate: (state, _event) => state,
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} <SpellLink spell={talent.id} /> talented
      </>
    ),
  };
}
