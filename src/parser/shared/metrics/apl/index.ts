import type Spell from 'common/SPELLS/Spell';
import {
  AnyEvent,
  EventType,
  UpdateSpellUsableEvent,
  CastEvent,
  BeginChannelEvent,
} from 'parser/core/Events';
import metric, { Info } from 'parser/core/metric';
import { ReactChild } from 'react';

export type PlayerInfo = Pick<Info, 'playerId' | 'combatant' | 'abilities'>;
export enum Tense {
  Past,
  Present,
}

/**
 * An event that triggers checking the APL. For instant cast spells and
 * abilities, this is `CastEvent`. For abilities with cast times,
 * `BeginChannelEvent` is used. This should be largely automatic because the
 * `BeginChannelEvent` comes first for cast-time spells and channels.
 */
export type AplTriggerEvent = CastEvent | BeginChannelEvent;

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
  lookahead?: number;
  // produce the initial state object
  init: (info: PlayerInfo) => T;
  // Update the internal condition state
  update: (state: T, event: AnyEvent) => T;
  // validate whether the condition applies for the supplied event.
  validate: (state: T, event: AplTriggerEvent, spell: Spell, lookahead: AnyEvent[]) => boolean;
  // describe the condition. it should fit following "This rule was active because..."
  describe: (tense?: Tense) => ReactChild;
  // tooltip description for checklist
  tooltip?: () => ReactChild | undefined;
}
export type StateFor<T> = T extends (...args: any[]) => Condition<infer R> ? R : never;
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
    .reduce((cnds: { [k: string]: Condition<any> }, cnd) => {
      cnds[cnd.key] = cnd;
      return cnds;
    }, {});
  const conditions = Object.values<Condition<any>>(conditionMap);

  return { rules, conditions };
}

export enum ResultKind {
  Success,
  Violation,
}

export interface Violation {
  kind: ResultKind.Violation;
  actualCast: AplTriggerEvent;
  expectedCast: Spell;
  rule: Rule;
}

type ConditionState = { [key: string]: any };
type AbilityState = { [spellId: number]: UpdateSpellUsableEvent };

export interface Success {
  kind: ResultKind.Success;
  rule: Rule;
  actualCast: AplTriggerEvent;
}

interface CheckState {
  successes: Success[];
  violations: Violation[];
  conditionState: ConditionState;
  abilityState: AbilityState;
  mostRecentBeginCast?: BeginChannelEvent;
}

export type CheckResult = Pick<CheckState, 'successes' | 'violations'>;

function initState(apl: Apl, info: PlayerInfo): ConditionState {
  return (
    apl.conditions?.reduce((state: ConditionState, cnd: Condition<any>) => {
      state[cnd.key] = cnd.init(info);
      return state;
    }, {}) || {}
  );
}

function updateState(apl: Apl, oldState: ConditionState, event: AnyEvent): ConditionState {
  return (
    apl.conditions?.reduce((state: ConditionState, cnd: Condition<any>) => {
      state[cnd.key] = cnd.update(oldState[cnd.key], event);
      return state;
    }, {}) || {}
  );
}

/**
 * If `tense` is `Tense.Present`, return `a`. Otherwise `b`.
 **/
export function tenseAlt<T>(tense: Tense | undefined, a: T, b: T): T {
  return tense === Tense.Present ? a : b;
}
export const spell = (rule: Rule): Spell => ('spell' in rule ? rule.spell : rule);

export const cooldownEnd = (event: UpdateSpellUsableEvent): number =>
  event.expectedDuration + event.start;

export function lookaheadSlice(
  events: AnyEvent[],
  startIx: number,
  duration: number | undefined,
): AnyEvent[] {
  if (!duration) {
    return [];
  }

  const event = events[startIx];
  const future = events.slice(startIx);
  const laterIndex = future.findIndex(({ timestamp }) => timestamp > event.timestamp + duration);
  if (laterIndex > 0) {
    return future.slice(0, laterIndex);
  } else {
    return future;
  }
}

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
  events: AnyEvent[],
  eventIndex: number,
): boolean {
  const event = events[eventIndex];
  if (event.type !== EventType.Cast && event.type !== EventType.BeginChannel) {
    console.error('attempted to apply APL rule to non-cast event, ignoring', event);
    return false;
  }
  return (
    abilities.has(spell(rule).id) &&
    (spell(rule).id === event.ability.guid ||
      result.abilityState[spell(rule).id] === undefined ||
      result.abilityState[spell(rule).id].isAvailable ||
      cooldownEnd(result.abilityState[spell(rule).id]) <= event.timestamp + 100) &&
    (!('condition' in rule) ||
      rule.condition.validate(
        result.conditionState[rule.condition.key],
        event,
        rule.spell,
        lookaheadSlice(events, eventIndex, rule.condition.lookahead),
      ))
  );
}

/**
 * Find the first applicable rule. See also: `ruleApplies`
 **/
function applicableRule(
  apl: Apl,
  abilities: Set<number>,
  result: CheckState,
  events: AnyEvent[],
  eventIndex: number,
): Rule | undefined {
  for (const rule of apl.rules) {
    if (ruleApplies(rule, abilities, result, events, eventIndex)) {
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
      (result, event, eventIndex) => {
        if (
          (event.type === EventType.BeginChannel ||
            (event.type === EventType.Cast &&
              event.ability.guid !== result.mostRecentBeginCast?.ability.guid)) &&
          applicableSpells.has(event.ability.guid)
        ) {
          const rule = applicableRule(apl, abilities, result, events, eventIndex);
          if (rule) {
            if (spell(rule).id === event.ability.guid) {
              // the player cast the correct spell
              result.successes.push({ rule, actualCast: event, kind: ResultKind.Success });
            } else if (event.timestamp >= info.combatant.owner.fight.start_time) {
              // condition prevents punishing precast spells
              result.violations.push({
                kind: ResultKind.Violation,
                rule,
                expectedCast: spell(rule),
                actualCast: event,
              });
            }
          }
        }

        if (event.type === EventType.BeginChannel) {
          result.mostRecentBeginCast = event;
        } else if (event.type === EventType.EndChannel) {
          result.mostRecentBeginCast = undefined;
        }

        result.abilityState = updateAbilities(result.abilityState, event);
        result.conditionState = updateState(apl, result.conditionState, event);

        return result;
      },
      { successes: [], violations: [], abilityState: {}, conditionState: initState(apl, info) },
    );
  });

export default aplCheck;
