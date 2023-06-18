import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';

import { Condition, tenseAlt } from '../index';

/**
 * @deprecated
 */
export default function hasConduit(conduit: Spell): Condition<boolean> {
  return {
    key: `hasConduit-${conduit.id}`,
    init: () => false,
    update: (state) => state,
    validate: (state) => state,
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} <SpellLink spell={conduit.id} /> equipped
      </>
    ),
  };
}
