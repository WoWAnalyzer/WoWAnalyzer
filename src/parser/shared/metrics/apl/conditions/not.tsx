import type { Condition } from '../index';

export default function not<T>(cnd: Condition<T>, showDont = true): Condition<T> {
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
