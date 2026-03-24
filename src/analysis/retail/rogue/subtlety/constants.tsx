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
import Enemies from 'parser/shared/modules/Enemies';

export const RUPTURE_BASE_DURATION = 4000;
export const RUPTURE_DURATION_PER_CP = 4000;
export const SHADOW_TECHNIQUES_CP_GEN = 1;
export const SHURIKEN_TORNADO_DURATION = 4000;
export const PANDEMIC_WINDOW = 3000;

const ANIMACHARGED_FINISHER_CP = 7;

const getMaxComboPoints = (c: Combatant) => {
  return 5 + c.getTalentRank(TALENTS.DEEPER_STRATAGEM_TALENT);
};

export const getRuptureDuration = (c: Combatant, cast: CastEvent): number => {
  if (isAnimachargedFinisherCast(c, cast)) {
    return getRuptureFullDuration(c);
  }
  return (
    RUPTURE_BASE_DURATION +
    RUPTURE_DURATION_PER_CP * getResourceSpent(cast, RESOURCE_TYPES.COMBO_POINTS)
  );
};

export const getRuptureFullDuration = (c: Combatant) => {
  if (c.hasTalent(TALENTS.ECHOING_REPRIMAND_TALENT)) {
    return RUPTURE_BASE_DURATION + RUPTURE_DURATION_PER_CP * ANIMACHARGED_FINISHER_CP;
  }
  return RUPTURE_BASE_DURATION + RUPTURE_DURATION_PER_CP * getMaxComboPoints(c);
};

export const isRuptureRefreshTooEarly = (
  c: Combatant,
  cast: CastEvent,
  lastApplication?: number,
): boolean => {
  if (lastApplication === undefined) {
    return false;
  }

  const duration = getRuptureDuration(c, cast);
  const pandemicThreshold = duration * 0.3;
  return cast.timestamp - lastApplication < pandemicThreshold;
};

export const isRuptureActive = (enemies: Enemies, timestamp: number): boolean => {
  return enemies.getBuffUptime(SPELLS.RUPTURE.id, timestamp) > 0;
};

export const getTargetComboPoints = (c: Combatant) => {
  return 4;
};

export const getNightbladeFullDuration = (c: Combatant) => {
  return RUPTURE_BASE_DURATION + RUPTURE_DURATION_PER_CP * getMaxComboPoints(c);
};

export const SNAPSHOT_DOWNGRADE_BUFFER = 2000;
export const OPENER_MAX_DURATION_MS = 30000;

export const getBuilderSpells = (c: Combatant): Spell[] => {
  return [
    c.hasTalent(TALENTS.GLOOMBLADE_TALENT) ? TALENTS.GLOOMBLADE_TALENT : SPELLS.BACKSTAB,
    SPELLS.SHURIKEN_STORM,
    SPELLS.SHADOWSTRIKE,
  ];
};

export const FINISHERS: Spell[] = [
  SPELLS.RUPTURE,
  SPELLS.EVISCERATE,
  TALENTS.SECRET_TECHNIQUE_TALENT,
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

  return (
    (cpsSpent === 2 && hasAnimacharged2CP) ||
    (cpsSpent === 3 && hasAnimacharged3CP) ||
    (cpsSpent === 4 && hasAnimacharged4CP)
  );
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
