import type { LegendarySpell } from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import React from 'react';

import { Condition, tenseAlt } from '../index';

export default function hasLegendary(legendary: LegendarySpell): Condition<boolean> {
  return {
    key: `hasLegendary-${legendary.id}`,
    init: ({ combatant }) => combatant.hasLegendaryByBonusID(legendary.bonusID!),
    update: (state, _event) => state,
    validate: (state, _event) => state,
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')}
        <SpellLink id={legendary.id} /> equipped
      </>
    ),
  };
}
