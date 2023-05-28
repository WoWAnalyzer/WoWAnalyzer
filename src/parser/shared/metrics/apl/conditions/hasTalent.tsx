import { Talent } from 'common/TALENTS/types';
import { SpellLink } from 'interface';

import { Condition, tenseAlt } from '../index';

export default function hasTalent(talent: Talent): Condition<boolean> {
  return {
    key: `hasTalent-${talent.id}`,
    init: ({ combatant }) => combatant.hasTalent(talent),
    update: (state, _event) => state,
    validate: (state, _event) => state,
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} <SpellLink id={talent.id} /> talented
      </>
    ),
  };
}
