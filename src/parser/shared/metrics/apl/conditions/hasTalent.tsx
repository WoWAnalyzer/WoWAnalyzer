import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import React from 'react';

import { Condition, tenseAlt } from '../index';

export default function hasTalent(talent: Spell): Condition<boolean> {
  return {
    key: `hasTalent-${talent.id}`,
    init: ({ combatant }) => combatant.hasTalent(talent.id),
    update: (state, _event) => state,
    validate: (state, _event) => state,
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} <SpellLink id={talent.id} /> talented
      </>
    ),
  };
}
