import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { AnyEvent, CastEvent } from 'parser/core/Events';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Combatant from 'parser/core/Combatant';
import Spell from 'common/SPELLS/Spell';
import { ChecklistUsageInfo } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Fight from 'parser/core/Fight';

export const GARROTE_BASE_DURATION = 18000;
export const getGarroteDuration = (): number => GARROTE_BASE_DURATION;

const animachargedFinisherComboPoints = 7;

const getMaxComboPoints = (c: Combatant) => {
  return 5 + c.getTalentRank(TALENTS.DEEPER_STRATAGEM_TALENT);
};

export const getTargetComboPoints = (c: Combatant) => {
  return 4;
};

export const RUPTURE_BASE_DURATION = 4000;
const RUPTURE_DURATION_PR_CP_SPENT = 4000;
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
const CRIMSON_TEMPEST_DURATION_PR_CP_SPENT = 2000;
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

export const OPENER_MAX_DURATION_MS = 30000;

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
  TALENTS.SEPSIS_TALENT,
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

const AnimachargedFinisherSummary = () => <div>Consumed Animacharged CP</div>;
const AnimachargedFinisherDetails = () => <div>You consumed an Animacharged CP.</div>;

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

export const isInOpener = (event: AnyEvent, fight: Fight) =>
  event.timestamp - fight.start_time <= OPENER_MAX_DURATION_MS;
