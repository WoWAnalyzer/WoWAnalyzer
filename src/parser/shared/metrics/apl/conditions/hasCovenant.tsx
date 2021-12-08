import { Covenant } from 'parser/core/Events';

import { Condition, tenseAlt } from '../index';

export function hasCovenant(covenant: Covenant, inverse: boolean = false): Condition<boolean> {
  return {
    key: `hasCovenant-${covenant.id}`,
    init: ({ combatant }) => combatant.hasCovenant(covenant.id),
    update: (state) => state,
    validate: (state) => state,
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'are', 'were')}
        {inverse ? "n't" : ''} {covenant.name}
      </>
    ),
  };
}
