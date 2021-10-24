import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { EventType } from 'parser/core/Events';
import { Condition, tenseAlt } from 'parser/shared/metrics/apl';
import React from 'react';

const EXECUTE_RANGE = 0.2;
const EXECUTE_RANGE_MASSACRE = 0.35;
const EXECUTE_RANGE_VENTHYR = 0.8;

export type TargetHealthRange = { [targetId: number]: number; [threshold: string]: number };

export function inExecute(): Condition<TargetHealthRange> {
  return {
    key: `inExecuteWarrior`,
    init: ({ combatant }) => {
      const lowerThreshold = combatant.hasTalent(SPELLS.MASSACRE_TALENT_ARMS.id)
        ? EXECUTE_RANGE_MASSACRE
        : EXECUTE_RANGE;
      const upperThreshold = combatant.hasCovenant(COVENANTS.VENTHYR.id)
        ? EXECUTE_RANGE_VENTHYR
        : 100;

      return { lowerThreshold: lowerThreshold, upperThreshold: upperThreshold };
    },
    update: (state, event) => {
      if (
        (event.type === EventType.Damage || event.type === EventType.Heal) &&
        event.hitPoints &&
        event.maxHitPoints
      ) {
        // these events include target HP
        state[event.targetID] = event.hitPoints / event.maxHitPoints;
      } else if (event.type === EventType.Cast && event.hitPoints && event.maxHitPoints) {
        // includes source hit points
        state[event.sourceID] = event.hitPoints / event.maxHitPoints;
      }
      return state;
    },
    validate: (state, event) =>
      event.targetID
        ? state[event.targetID] <= state['lowerThreshold'] ||
          state[event.targetID] >= state['upperThreshold']
        : false,
    describe: (tense) => <>your target {tenseAlt(tense, 'is', 'was')} in Execute range</>,
  };
}

export function outsideExecute(): Condition<TargetHealthRange> {
  return {
    key: `outsideExecuteWarrior`,
    init: ({ combatant }) => {
      const lowerThreshold = combatant.hasTalent(SPELLS.MASSACRE_TALENT_ARMS.id)
        ? EXECUTE_RANGE_MASSACRE
        : EXECUTE_RANGE;
      const upperThreshold = combatant.hasCovenant(COVENANTS.VENTHYR.id)
        ? EXECUTE_RANGE_VENTHYR
        : 100;

      return { lowerThreshold: lowerThreshold, upperThreshold: upperThreshold };
    },
    update: (state, event) => {
      if (
        (event.type === EventType.Damage || event.type === EventType.Heal) &&
        event.hitPoints &&
        event.maxHitPoints
      ) {
        // these events include target HP
        state[event.targetID] = event.hitPoints / event.maxHitPoints;
      } else if (event.type === EventType.Cast && event.hitPoints && event.maxHitPoints) {
        // includes source hit points
        state[event.sourceID] = event.hitPoints / event.maxHitPoints;
      }
      return state;
    },
    validate: (state, event) =>
      event.targetID
        ? state[event.targetID] >= state['lowerThreshold'] ||
          state[event.targetID] <= state['upperThreshold']
        : false,
    describe: (tense) => <>your target {tenseAlt(tense, 'is', 'was')} outside Execute range</>,
  };
}
