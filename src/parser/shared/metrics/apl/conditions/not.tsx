import React from 'react';

import type { Condition } from '../index';

export default function not(cnd: Condition<any>, showDont: boolean = true): Condition<any> {
  return {
    ...cnd,
    key: `not-${cnd.key}`,
    validate: (state, event, spell) => !cnd.validate(state, event, spell),
    describe: (tense) => (
      <>
        {showDont && "don't"} {cnd.describe(tense)}
      </>
    ),
  };
}
