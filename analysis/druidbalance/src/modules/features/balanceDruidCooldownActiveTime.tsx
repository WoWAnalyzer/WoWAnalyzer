import SPELLS from 'common/SPELLS';
import metric, { Info } from 'parser/core/metric';
import { AnyEvent } from 'parser/core/Events';
import cooldownActiveTime from 'parser/shared/metrics/cooldownActiveTime';
import { SuggestionImportance, WIPSuggestionFactory } from 'parser/core/CombatLogParser';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';
import { cooldownAbility } from '../../constants';
import COVENANTS from 'game/shadowlands/COVENANTS';
import React from 'react';
import Combatant from 'parser/core/Combatant';

const MAJOR_COOLDOWN_IDS: number[] = [
  SPELLS.CELESTIAL_ALIGNMENT.id,
  SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id,
  SPELLS.RAVENOUS_FRENZY.id,
];

const MINOR = 0.02;
const AVERAGE = 0.04;
const MAJOR = 0.08;

/** Gets the percentage of time the player was active during major cooldowns. */
const balanceDruidCooldownActiveTime = metric((events: AnyEvent[], info: Info): number => {
  return cooldownActiveTime(events, info, MAJOR_COOLDOWN_IDS);
});

// TODO how to feed this into the checklist?
export const balanceDruidCooldownActiveTimeThresholds = (
  events: AnyEvent[],
  info: Info,
): NumberThreshold => {
  return {
    actual: balanceDruidCooldownActiveTime(events, info),
    isLessThan: {
      minor: MINOR,
      average: AVERAGE,
      major: MAJOR,
    },
    style: ThresholdStyle.PERCENTAGE,
  };
};

// TODO handling of thresholds less manual
export const balanceDruidCooldownActiveTimeSuggestion = (): WIPSuggestionFactory => (events, info) => {
  const { playerId } = info;
  const combatant: Combatant = undefined; // TODO derive combatant
  const activeTime = balanceDruidCooldownActiveTime(events, info);
  let importance;
  if (activeTime > MINOR) {
    return [];
  } else if (activeTime > AVERAGE) {
    importance = SuggestionImportance.Minor;
  } else if (activeTime > MAJOR) {
    importance = SuggestionImportance.Regular;
  } else {
    importance = SuggestionImportance.Major;
  }
  return {
    text: (<>
      You had downtime during <SpellLink id={cooldownAbility(combatant).id} />
      {combatant.hasCovenant(COVENANTS.VENTHYR.id) && (<> and <SpellLink id={SPELLS.RAVENOUS_FRENZY.id} /></>)}.
      Making full use of your major damage cooldowns is extremely important towards doing good DPS,
      making any downtime at all very bad. Where the encounter requires, you should plan the timing
      of your cooldowns to ensure you won't be interrupted by mechanics.
    </>),
    importance,
    icon: 'spell_mage_altertime',
    actual: activeTime,
    recommended: '100%',
  };
};
