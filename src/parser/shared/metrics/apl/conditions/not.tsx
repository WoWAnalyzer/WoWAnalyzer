import React from 'react';

import type { Condition } from '../index';

export default function not(cnd: Condition<any>): Condition<any> {
  return {
    ...cnd,
    key: `not-${cnd.key}`,
    validate: (state, event, spell, lookahead) => !cnd.validate(state, event, spell, lookahead),
    describe: (tense) => <>don't {cnd.describe(tense)}</>,
  };
}
