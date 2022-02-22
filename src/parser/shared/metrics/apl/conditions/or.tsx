import type { Condition } from '../index';

type ConditionMap = { [k: string]: Condition<any> };

// TODO: this has some copypasta
export default function or(...conditions: Array<Condition<any>>): Condition<any> {
  const cndMap: ConditionMap = conditions.reduce((map: ConditionMap, cnd) => {
    map[cnd.key] = cnd;
    return map;
  }, {});

  const lookahead = conditions.reduce(
    (val: number | undefined, cnd) => (!val || (cnd.lookahead || 0) > val ? cnd.lookahead : val),
    undefined,
  );

  return {
    key: `or-${conditions.map((cnd) => cnd.key).join('-')}`,
    init: (info) => Object.fromEntries(conditions.map(({ key, init }) => [key, init(info)])),
    update: (state, event) =>
      Object.keys(state).reduce((nextState: ConditionMap, key) => {
        nextState[key] = cndMap[key]!.update(state[key], event);
        return nextState;
      }, {}),
    lookahead,
    validate: (state, event, spell, lookahead) =>
      Object.keys(state).some((key) => cndMap[key]!.validate(state[key], event, spell, lookahead)),
    describe: (tense) =>
      conditions
        .map((cnd) => cnd.describe(tense))
        .reduce((cur, next) =>
          cur ? (
            <>
              {cur} or {next}
            </>
          ) : (
            next
          ),
        ),
  };
}
