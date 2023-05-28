import { Covenant } from 'parser/core/Events';

import { Condition, tenseAlt } from '../index';

/**
 * @deprecated
 */
export function hasCovenant(covenant: Covenant, inverse: boolean = false): Condition<boolean> {
  return {
    key: `hasCovenant-${covenant.id}`,
    init: () => false,
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
