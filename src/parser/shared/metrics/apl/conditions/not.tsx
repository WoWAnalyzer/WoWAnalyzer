import type { Condition } from '../index';

export default function not(cnd: Condition<any>, showDont = true): Condition<any> {
  return {
    ...cnd,
    key: `not-${cnd.key}`,
    validate: (state, event, spell, lookahead) => !cnd.validate(state, event, spell, lookahead),
    describe: (tense) => (
      <>
        {showDont && "don't"} {cnd.describe(tense)}
      </>
    ),
  };
}
