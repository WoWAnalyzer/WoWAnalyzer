import type Spell from 'common/SPELLS/Spell';
import { AnyEvent, EventType, UpdateSpellUsableEvent, CastEvent } from 'parser/core/Events';
import metric, { Info } from 'parser/core/metric';
import { ReactChild } from 'react';

export type PlayerInfo = Pick<Info, 'playerId' | 'combatant' | 'abilities'>;
export enum Tense {
  Past,
  Present,
}

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
  init: (info: PlayerInfo) => T;
  // Update the internal condition state
  update: (state: T, event: AnyEvent) => T;
  // validate whether the condition applies for the supplied event.
  validate: (state: T, event: CastEvent, spell: Spell) => boolean;
  // describe the condition. it should fit following "This rule was active because..."
  describe: (tense?: Tense) => ReactChild;
  // tooltip description for checklist
  tooltip?: () => ReactChild | undefined;
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

export enum ResultKind {
  Success,
  Violation,
}

export interface Violation {
  kind: ResultKind.Violation;
  actualCast: CastEvent;
  expectedCast: Spell;
  rule: Rule;
}

type ConditionState = { [key: string]: any };
type AbilityState = { [spellId: number]: UpdateSpellUsableEvent };

export interface Success {
  kind: ResultKind.Success;
  rule: Rule;
  actualCast: CastEvent;
}

interface CheckState {
  successes: Success[];
  violations: Violation[];
  conditionState: ConditionState;
  abilityState: AbilityState;
}

export type CheckResult = Pick<CheckState, 'successes' | 'violations'>;

function initState(apl: Apl, info: PlayerInfo): ConditionState {
  return (
    apl.conditions?.reduce(
      (state: ConditionState, cnd: Condition<any>) => ({
        ...state,
        [cnd.key]: cnd.init(info),
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

/**
 * If `tense` is `Tense.Present`, return `a`. Otherwise `b`.
 **/
export function tenseAlt<T>(tense: Tense | undefined, a: T, b: T): T {
  return tense === Tense.Present ? a : b;
}
export const spell = (rule: Rule): Spell => ('spell' in rule ? rule.spell : rule);

const cooldownEnd = (event: UpdateSpellUsableEvent): number => event.expectedDuration + event.start;

/**
 * Check whether a rule applies to the given cast. There are two checks:
 *
 * 1. The spell the rule governs is available, and
 * 2. The condition for the rule is validated *or* the rule is unconditional.
 *
 * Note that if a spell is cast that we think is unavailable, we'll assume our data is stale and apply the rule anyway.
 **/
function ruleApplies(
  rule: Rule,
  abilities: Set<number>,
  result: CheckState,
  event: CastEvent,
): boolean {
  return (
    abilities.has(spell(rule).id) &&
    (spell(rule).id === event.ability.guid ||
      result.abilityState[spell(rule).id] === undefined ||
      result.abilityState[spell(rule).id].isAvailable ||
      cooldownEnd(result.abilityState[spell(rule).id]) <= event.timestamp + 100) &&
    (!('condition' in rule) ||
      rule.condition.validate(result.conditionState[rule.condition.key], event, rule.spell))
  );
}

/**
 * Find the first applicable rule. See also: `ruleApplies`
 **/
function applicableRule(
  apl: Apl,
  abilities: Set<number>,
  result: CheckState,
  event: CastEvent,
): Rule | undefined {
  for (const rule of apl.rules) {
    if (ruleApplies(rule, abilities, result, event)) {
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
  metric<[PlayerInfo], CheckResult>((events, info) => {
    // rules for spells that aren't known are automatically ignored
    const abilities = new Set(
      info.abilities
        .filter((ability) => ability.enabled)
        .flatMap((ability) =>
          typeof ability.spell === 'number' ? [ability.spell] : ability.spell,
        ),
    );
    const applicableSpells = new Set(apl.rules.map((rule) => spell(rule).id));
    return events.reduce<CheckState>(
      (result, event) => {
        if (event.type === EventType.Cast && applicableSpells.has(event.ability.guid)) {
          const rule = applicableRule(apl, abilities, result, event);
          if (rule) {
            if (spell(rule).id === event.ability.guid) {
              // the player cast the correct spell
              result.successes.push({ rule, actualCast: event, kind: ResultKind.Success });
            } else {
              result.violations.push({
                kind: ResultKind.Violation,
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
      { successes: [], violations: [], abilityState: {}, conditionState: initState(apl, info) },
    );
  });

export default aplCheck;
