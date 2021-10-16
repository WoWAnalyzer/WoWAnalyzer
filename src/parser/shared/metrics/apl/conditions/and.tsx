import React from 'react';

import type { Condition } from '../index';

// TODO: this doesn't state-share with other conditions. don't think its a real big issue tho?
export default function and(...conditions: Array<Condition<any>>): Condition<any> {
  const cndMap: { [k: string]: Condition<any> } = conditions.reduce(
    (map, cnd) => ({ ...map, [cnd.key]: cnd }),
    {},
  );

  return {
    key: `and-${conditions.map((cnd) => cnd.key).join('-')}`,
    init: (info) => Object.fromEntries(conditions.map(({ key, init }) => [key, init(info)])),
    update: (state, event) =>
      Object.keys(state).reduce(
        (nextState, key) => ({ ...nextState, [key]: cndMap[key]!.update(state[key], event) }),
        {},
      ),
    validate: (state, event, spell) =>
      Object.keys(state).every((key) => cndMap[key]!.validate(state[key], event, spell)),
    describe: () =>
      conditions
        .map((cnd) => cnd.describe())
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
