import type { Condition } from '../index';
import { containsOptionalCondition } from './optionalRule';

type ConditionMap = { [k: string]: Condition<any> };

// TODO: this doesn't state-share with other conditions. don't think its a real big issue tho?
/**
   NOTE: this module is untested and may not work as intended. I implemented it
   then realized I didn't need it. It remains here because it *should* still
   work, but take care.
**/
export default function and(...conditions: Array<Condition<any>>): Condition<any> {
  const key = `and-${conditions.map((cnd) => cnd.key).join('-')}`;
  if (process.env.NODE_ENV !== 'production' && conditions.some(containsOptionalCondition)) {
    console.warn(
      `APL rule ${key} contains optional rules. Nesting optionalRule inside of and can produce confusing behavior and is discouraged.`,
      conditions,
    );
  }
  const cndMap: ConditionMap = conditions.reduce((map: ConditionMap, cnd) => {
    map[cnd.key] = cnd;
    return map;
  }, {});

  const lookahead = conditions.reduce(
    (val: number | undefined, cnd) => (!val || (cnd.lookahead || 0) > val ? cnd.lookahead : val),
    undefined,
  );

  return {
    key,
    init: (info) => Object.fromEntries(conditions.map(({ key, init }) => [key, init(info)])),
    update: (state, event) =>
      Object.keys(state).reduce((nextState: ConditionMap, key) => {
        nextState[key] = cndMap[key]!.update(state[key], event);
        return nextState;
      }, {}),
    lookahead,
    validate: (state, event, spell, lookahead) =>
      Object.keys(state).every((key) => cndMap[key]!.validate(state[key], event, spell, lookahead)),
    describe: (tense) =>
      conditions
        .map((cnd) => cnd.describe(tense))
        .reduce((cur, next) =>
          cur ? (
            <>
              {cur} and {next}
            </>
          ) : (
            next
          ),
        ),
  };
}
