import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';

import { Condition, tenseAlt } from '../index';

export default function hasConduit(conduit: Spell): Condition<boolean> {
  return {
    key: `hasConduit-${conduit.id}`,
    init: ({ combatant }) => combatant.hasConduitBySpellID(conduit.id),
    update: (state) => state,
    validate: (state) => state,
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} <SpellLink id={conduit.id} /> equipped
      </>
    ),
  };
}
