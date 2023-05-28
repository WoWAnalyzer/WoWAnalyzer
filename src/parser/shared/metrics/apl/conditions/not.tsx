import type { Condition } from '../index';

export default function not(cnd: Condition<any>, showDont: boolean = true): Condition<any> {
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
