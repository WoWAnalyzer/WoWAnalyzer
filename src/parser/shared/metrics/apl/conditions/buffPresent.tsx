import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';

import { AplTriggerEvent, Condition, tenseAlt } from '../index';
import { buffDuration, DurationData, PandemicData } from './util';

export function buffPresent(spell: Spell, latencyOffset: number = 0): Condition<number | null> {
  return {
    key: `buffPresent-${spell.id}`,
    init: () => null,
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyBuff:
          if (event.ability.guid === spell.id) {
            return event.timestamp;
          }
          break;
        case EventType.RemoveBuff:
          if (event.ability.guid === spell.id) {
            return null;
          }
          break;
      }

      return state;
    },
    validate: (state, event) => (state ? event.timestamp > state + latencyOffset : false),
    describe: (tense) => (
      <>
        <SpellLink spell={spell.id} /> {tenseAlt(tense, 'is', 'was')} present
      </>
    ),
  };
}

/**
 * Internal helper function shared with debuff code for handling `buffMissing` / `debuffMissing` with pandemic.
 */
export function validateBuffMissing(
  event: AplTriggerEvent,
  ruleSpell: Spell,
  state: DurationData | undefined,
  pandemic: PandemicData | undefined,
): boolean {
  if (state === undefined) {
    // buff is missing
    return true;
  } else if (state.referenceTime + 200 > event.timestamp) {
    // buff was *just* applied, possibly by this very spell. treat it as optional
    return event.ability.guid === ruleSpell.id;
  } else if (pandemic && state.timeRemaining !== undefined) {
    // otherwise, return true if we can pandemic this buff
    return (
      ruleSpell.id === event.ability.guid &&
      state.referenceTime + state.timeRemaining < event.timestamp + pandemic.timeRemaining
    );
  } else {
    // finally, return false if we have no pandemic info. this means we only remove the buff when we get a RemoveBuff event.
    return false;
  }
}

/**
   The rule applies when the buff `spell` is missing. The `optPandemic`
   parameter gives the ability to allow early refreshes to prevent a buff
   dropping, but this will not *require* early refreshes.

   Unless otherwise specified by `optPandemic.pandemicCap`, the buff is
   assumed to refresh to up to 3x duration.
 **/
export function buffMissing(
  spell: Spell,
  optPandemic?: PandemicData,
): Condition<DurationData | undefined> {
  return {
    key: `buffMissing-${spell.id}`,
    init: () => undefined,
    update: (state, event) => {
      switch (event.type) {
        case EventType.RefreshBuff:
        case EventType.ApplyBuff:
          if (event.ability.guid === spell.id) {
            return {
              referenceTime: event.timestamp,
              timeRemaining: optPandemic
                ? buffDuration(event.timestamp, state, optPandemic)
                : undefined,
            };
          }
          break;
        case EventType.RemoveBuff:
          if (event.ability.guid === spell.id) {
            return undefined;
          }
          break;
      }

      return state;
    },
    validate: (state, event, ruleSpell) =>
      validateBuffMissing(event, ruleSpell, state, optPandemic),
    describe: (tense) => (
      <>
        <SpellLink spell={spell.id} /> {tenseAlt(tense, 'is', 'was')} missing{' '}
        {optPandemic && <>or about to expire</>}
      </>
    ),
  };
}
