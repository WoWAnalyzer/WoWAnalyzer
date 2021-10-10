import type Spell from 'common/SPELLS/Spell';
import { AnyEvent, EventType, UpdateSpellUsableEvent, CastEvent } from 'parser/core/Events';
import metric, { Info } from 'parser/core/metric';
import { ReactChild } from 'react';
export { default as buffPresent } from './buffPresent';

/**
 * A Condition can be used to determine whether a [[Rule]] can applies to the
 * current fight situation. See [[buffPresent]] for a simple example.
 *
 * Each condition must have an `init` function that creates an initial state
 * object, along with an `update` method that produces a *new* state object (it
 * should avoid mutation unless absolutely needed), and a `validate` method that
 * checks whether the condition applies to the current event.
 *
 * In the simplest case, T is `boolean` and `validate = (state, _event) => state`.
 **/
export interface Condition<T> {
  key: string;
  // produce the initial state object
  init: () => T;
  // Update the internal condition state
  update: (state: T, event: AnyEvent) => T;
  // validate whether the condition applies for the supplied event.
  validate: (state: T, event: AnyEvent) => boolean;
  // describe the condition. it should fit following "This rule was active because..."
  describe: () => ReactChild;
}
export interface ConditionalRule {
  spell: Spell;
  condition: Condition<any>;
}
export type Rule = Spell | ConditionalRule;

export interface Apl {
  conditions?: Array<Condition<any>>;
  rules: Rule[];
}

/**
 * Build an APL from a list of Rule objects.
 *
 * Use this instead of direct construction because it will maintain the
 * `conditions` key for you automatically.
 */
export function build(rules: Rule[]): Apl {
  const conditionMap = rules
    .filter((rule) => 'condition' in rule)
    .map((rule) => (rule as ConditionalRule).condition)
    .reduce((cnds, cnd) => ({ ...cnds, [cnd.key]: cnd }), {});
  const conditions = Object.values<Condition<any>>(conditionMap);

  return { rules, conditions };
}

interface Violation {
  actualCast: CastEvent;
  expectedCast: Spell;
  rule: Rule;
}

type ConditionState = { [key: string]: any };
type AbilityState = { [spellId: number]: UpdateSpellUsableEvent };

interface CheckState {
  successes: Rule[];
  violations: Violation[];
  conditionState: ConditionState;
  abilityState: AbilityState;
}

export type CheckResult = Pick<CheckState, 'successes' | 'violations'>;

function initState(apl: Apl): ConditionState {
  return (
    apl.conditions?.reduce(
      (state: ConditionState, cnd: Condition<any>) => ({
        ...state,
        [cnd.key]: cnd.init(),
      }),
      {},
    ) || {}
  );
}

function updateState(apl: Apl, oldState: ConditionState, event: AnyEvent): ConditionState {
  return (
    apl.conditions?.reduce(
      (state: ConditionState, cnd: Condition<any>) => ({
        ...state,
        [cnd.key]: cnd.update(oldState[cnd.key], event),
      }),
      {},
    ) || {}
  );
}

const spell = (rule: Rule): Spell => ('spell' in rule ? rule.spell : rule);

/**
 * Check whether a rule applies to the given cast. There are two checks:
 *
 * 1. The spell the rule governs is available, and
 * 2. The condition for the rule is validated *or* the rule is unconditional.
 **/
function ruleApplies(rule: Rule, result: CheckState, event: CastEvent): boolean {
  return (
    (result.abilityState[spell(rule).id] === undefined ||
      result.abilityState[spell(rule).id].isAvailable) &&
    (!('condition' in rule) ||
      rule.condition.validate(result.conditionState[rule.condition.key], event))
  );
}

/**
 * Find the first applicable rule. See also: `ruleApplies`
 **/
function applicableRule(apl: Apl, result: CheckState, event: CastEvent): Rule | undefined {
  for (const rule of apl.rules) {
    if (ruleApplies(rule, result, event)) {
      return rule;
    }
  }
}

function updateAbilities(state: AbilityState, event: AnyEvent): AbilityState {
  if (event.type === EventType.UpdateSpellUsable) {
    state[event.ability.guid] = event;
  }
  return state;
}

const aplCheck = (apl: Apl) =>
  metric<[Info], CheckResult>((events, { playerId }) => {
    const applicableSpells = new Set(apl.rules.map((rule) => spell(rule).id));
    return events.reduce<CheckState>(
      (result, event) => {
        if (event.type === EventType.Cast && applicableSpells.has(event.ability.guid)) {
          const rule = applicableRule(apl, result, event);
          if (rule) {
            if (spell(rule).id === event.ability.guid) {
              // the player cast the correct spell
              result.successes.push(rule);
            } else {
              result.violations.push({
                rule,
                expectedCast: spell(rule),
                actualCast: event,
              });
            }
          }
        }

        return {
          ...result,
          abilityState: updateAbilities(result.abilityState, event),
          conditionState: updateState(apl, result.conditionState, event),
        };
      },
      { successes: [], violations: [], abilityState: {}, conditionState: initState(apl) },
    );
  });

export default aplCheck;
