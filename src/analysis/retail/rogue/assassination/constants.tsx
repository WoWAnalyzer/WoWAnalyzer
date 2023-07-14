import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { MappedEvent, CastEvent } from 'parser/core/Events';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Combatant from 'parser/core/Combatant';
import Spell from 'common/SPELLS/Spell';
import { ChecklistUsageInfo } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Fight from 'parser/core/Fight';

// from https://www.wowhead.com/spell=137037/assassination-rogue
export const ABILITIES_AFFECTED_BY_DAMAGE_INCREASES = [
  SPELLS.MELEE,
  // SPELLS.BLINDSIDE_TALENT,
  // SPELLS.CRIMSON_TEMPEST_TALENT,
  SPELLS.ENVENOM,
  SPELLS.FAN_OF_KNIVES,
  SPELLS.GARROTE,
  SPELLS.MUTILATE,
  SPELLS.MUTILATE_MAINHAND,
  SPELLS.MUTILATE_OFFHAND,
  SPELLS.POISON_BOMB,
  SPELLS.POISONED_KNIFE,
  SPELLS.RUPTURE,
  // SPELLS.INTERNAL_BLEEDING_TALENT,
  SPELLS.DEADLY_POISON_DOT,
  SPELLS.DEADLY_POISON_PROC,
  SPELLS.WOUND_POISON,
];

// from https://www.wowhead.com/spell=196864/master-poisoner
export const ABILITIES_AFFECTED_BY_POISON_DAMAGE_INCREASES = [
  SPELLS.DEADLY_POISON_DOT,
  SPELLS.DEADLY_POISON_PROC,
  SPELLS.WOUND_POISON,
];

export const NIGHTSTALKER_BLACKLIST = [
  SPELLS.MELEE,
  SPELLS.RUPTURE,
  SPELLS.GARROTE,
  // SPELLS.CRIMSON_TEMPEST_TALENT,
  SPELLS.DEADLY_POISON_DOT,
];

export const GARROTE_BASE_DURATION = 18000;
export const getGarroteDuration = (): number => GARROTE_BASE_DURATION;

export const animachargedFinisherComboPoints = 7;

export const getMaxComboPoints = (c: Combatant) => {
  return 5 + c.getTalentRank(TALENTS.DEEPER_STRATAGEM_TALENT);
};

export const RUPTURE_BASE_DURATION = 4000;
export const RUPTURE_DURATION_PR_CP_SPENT = 4000;
export const getRuptureDuration = (c: Combatant, cast: CastEvent): number => {
  if (isAnimachargedFinisherCast(c, cast)) {
    return getRuptureFullDuration(c);
  }
  return (
    RUPTURE_BASE_DURATION +
    RUPTURE_DURATION_PR_CP_SPENT * getResourceSpent(cast, RESOURCE_TYPES.COMBO_POINTS)
  );
};

export const getRuptureFullDuration = (c: Combatant) => {
  if (c.hasTalent(TALENTS.ECHOING_REPRIMAND_TALENT)) {
    return RUPTURE_BASE_DURATION + RUPTURE_DURATION_PR_CP_SPENT * animachargedFinisherComboPoints;
  }
  return RUPTURE_BASE_DURATION + RUPTURE_DURATION_PR_CP_SPENT * getMaxComboPoints(c);
};

export const CRIMSON_TEMPEST_BASE_DURATION = 2000;
export const CRIMSON_TEMPEST_DURATION_PR_CP_SPENT = 2000;
export const getCrimsonTempestDuration = (cast: CastEvent): number =>
  CRIMSON_TEMPEST_BASE_DURATION +
  CRIMSON_TEMPEST_DURATION_PR_CP_SPENT * getResourceSpent(cast, RESOURCE_TYPES.COMBO_POINTS);

export const getCrimsonTempestFullDuration = (c: Combatant) => {
  if (c.hasTalent(TALENTS.ECHOING_REPRIMAND_TALENT)) {
    return (
      CRIMSON_TEMPEST_BASE_DURATION +
      CRIMSON_TEMPEST_DURATION_PR_CP_SPENT * animachargedFinisherComboPoints
    );
  }
  return (
    CRIMSON_TEMPEST_BASE_DURATION + CRIMSON_TEMPEST_DURATION_PR_CP_SPENT * getMaxComboPoints(c)
  );
};

/** Max time left on a DoT for us to not yell if snapshot is downgraded */
export const SNAPSHOT_DOWNGRADE_BUFFER = 2000;

export const OPENER_MAX_DURATION_MS = 15000;

export const BUILDERS: Spell[] = [
  SPELLS.MUTILATE,
  SPELLS.GARROTE,
  SPELLS.AMBUSH,
  SPELLS.FAN_OF_KNIVES,
  SPELLS.POISONED_KNIFE,
  SPELLS.CHEAP_SHOT,
  TALENTS.SHIV_TALENT,
  TALENTS.GOUGE_TALENT,
  TALENTS.ECHOING_REPRIMAND_TALENT,
  TALENTS.MARKED_FOR_DEATH_TALENT,
  TALENTS.SEPSIS_TALENT,
  TALENTS.SERRATED_BONE_SPIKE_TALENT,
  TALENTS.KINGSBANE_TALENT,
];

export const FINISHERS: Spell[] = [
  SPELLS.RUPTURE,
  SPELLS.ENVENOM,
  TALENTS.CRIMSON_TEMPEST_TALENT,
  SPELLS.SLICE_AND_DICE,
  SPELLS.KIDNEY_SHOT,
];

// Adjust for possible log latency
const ANIMACHARGED_FINISHER_BUFFER = 200;

export const isAnimachargedFinisherCast = (c: Combatant, event: CastEvent): boolean => {
  const cpsSpent = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
  const hasAnimacharged2CP = c.hasBuff(
    SPELLS.ANIMACHARGED_CP2.id,
    event.timestamp,
    ANIMACHARGED_FINISHER_BUFFER,
  );
  const hasAnimacharged3CP = c.hasBuff(
    SPELLS.ANIMACHARGED_CP3.id,
    event.timestamp,
    ANIMACHARGED_FINISHER_BUFFER,
  );
  const hasAnimacharged4CP = c.hasBuff(
    SPELLS.ANIMACHARGED_CP4.id,
    event.timestamp,
    ANIMACHARGED_FINISHER_BUFFER,
  );

  if (cpsSpent === 2 && hasAnimacharged2CP) {
    return true;
  }
  if (cpsSpent === 3 && hasAnimacharged3CP) {
    return true;
  }
  if (cpsSpent === 4 && hasAnimacharged4CP) {
    return true;
  }
  return false;
};

export const AnimachargedFinisherSummary = () => <div>Consumed Animacharged CP</div>;
export const AnimachargedFinisherDetails = () => <div>You consumed an Animacharged CP.</div>;

export const animachargedCheckedUsageInfo = (
  c: Combatant,
  event: CastEvent,
  previousCheckedUsageInfo: ChecklistUsageInfo[],
): ChecklistUsageInfo[] => {
  if (!isAnimachargedFinisherCast(c, event)) {
    return previousCheckedUsageInfo;
  }
  return [
    {
      check: 'animacharged',
      performance: QualitativePerformance.Perfect,
      timestamp: event.timestamp,
      summary: <AnimachargedFinisherSummary />,
      details: <AnimachargedFinisherDetails />,
    },
  ];
};

export const pandemicMaxDuration = (duration: number) => duration * 1.3;

export const isInOpener = (event: MappedEvent, fight: Fight) =>
  event.timestamp - fight.start_time <= OPENER_MAX_DURATION_MS;
