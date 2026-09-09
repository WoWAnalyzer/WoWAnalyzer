import type { JSX, ReactNode } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import type Spell from 'common/SPELLS/Spell';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { useAnalyzer, useInfo } from 'interface/guide';
import type { Info } from 'parser/core/metric';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SoulShardTracker from 'analysis/retail/warlock/shared/resources/SoulShardTracker';
import ImprovementPriorities, {
  activeTimePriority,
  castEfficiencyPriority,
  linearScore,
  performanceForHigherIsBetter,
  performanceForLowerIsBetter,
  plural,
  type ImprovementPriority,
} from 'interface/guide/components/ImprovementPriorities';
import { soulShardWastePriority } from 'analysis/retail/warlock/shared/guide/priorities';
import AlwaysBeCasting from '../core/AlwaysBeCasting';
import CancelledCasts from '../core/CancelledCasts';
import Agony from '../analyzers/Agony';
import Corruption from '../analyzers/Corruption';
import UnstableAffliction from '../analyzers/UnstableAffliction';
import Haunt from '../analyzers/Haunt';
import Darkglare from '../analyzers/Darkglare';
import DarkHarvest from '../analyzers/DarkHarvest';
import Nightfall from '../analyzers/Nightfall';
import { castPerformance as darkHarvestCastPerformance } from './DarkHarvestGuide';

/**
 * How much each check matters to Affliction damage, relative to the other checks. Only the
 * ratios matter. A weight 10 check at a 50% score outranks a weight 5 check at a 0% score.
 */
const WEIGHTS = {
  activeTime: 10,
  agony: 9,
  darkglareCastEfficiency: 8,
  corruption: 7,
  unstableAffliction: 6,
  darkHarvestCastEfficiency: 6,
  haunt: 5,
  soulShards: 5,
  darkglareDots: 4,
  darkHarvestCoverage: 4,
  cancelledCasts: 4,
  nightfall: 3,
} as const;

interface DotUptimeOptions {
  id: string;
  spell: Spell;
  uptime: number;
  performance: QualitativePerformance;
  weight: number;
  /** The uptime at which the score reaches 0. */
  worst: number;
  tip: ReactNode;
}

/** Priority for a DoT the player must keep active. The analyzer of the DoT supplies the rating. */
function dotUptimePriority({
  id,
  spell,
  uptime,
  performance,
  weight,
  worst,
  tip,
}: DotUptimeOptions): ImprovementPriority {
  return {
    id,
    title: (
      <>
        Keep <SpellLink spell={spell} /> active
      </>
    ),
    description: (
      <>
        <SpellLink spell={spell} /> was active for {formatPercentage(uptime, 1)}% of the fight.{' '}
        {tip}
      </>
    ),
    score: linearScore(uptime, 1, worst),
    weight,
    performance,
  };
}

function cancelledCastsPriority(
  cancelledCasts: CancelledCasts | undefined,
): ImprovementPriority | null {
  if (!cancelledCasts || cancelledCasts.totalCasts === 0) {
    return null;
  }
  const { castsCancelled, totalCasts, canceled } = cancelledCasts;
  return {
    id: 'cancelled-casts',
    title: 'Cancel fewer casts',
    description: (
      <>
        You cancelled {castsCancelled} of {totalCasts} casts ({formatPercentage(canceled, 1)}%). A
        cancelled cast is a lost global. When you must move, start an instant spell instead of a
        cast that you cannot finish.
      </>
    ),
    score: linearScore(canceled, 0, 0.2),
    weight: WEIGHTS.cancelledCasts,
    performance: cancelledCasts.cancelledPerformance,
  };
}

function darkglareDotsPriority(
  darkglare: Darkglare | undefined,
  maxDots: number,
): ImprovementPriority | null {
  if (!darkglare?.active || darkglare.casts.length === 0) {
    return null;
  }
  const casts = darkglare.casts.length;
  const average = darkglare.casts.reduce((sum, cast) => sum + cast.dotCount, 0) / casts;
  const ratio = Math.min(1, average / maxDots);
  return {
    id: 'darkglare-dots',
    title: (
      <>
        Apply every DoT before <SpellLink spell={TALENTS.SUMMON_DARKGLARE_TALENT} />
      </>
    ),
    description: (
      <>
        Your {casts} Darkglare {plural(casts, 'cast')} found {average.toFixed(1)} DoTs on average,
        out of {maxDots}. Darkglare deals 10% more damage for each DoT it finds. Refresh{' '}
        <SpellLink spell={SPELLS.AGONY} />, <SpellLink spell={SPELLS.CORRUPTION_DEBUFF} /> and{' '}
        <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} />, then cast it.
      </>
    ),
    score: ratio,
    weight: WEIGHTS.darkglareDots,
    performance: performanceForHigherIsBetter(ratio, { perfect: 1, good: 0.85, ok: 0.65 }),
  };
}

function darkHarvestCoveragePriority(
  darkHarvest: DarkHarvest | undefined,
): ImprovementPriority | null {
  if (!darkHarvest?.active || darkHarvest.casts.length === 0) {
    return null;
  }
  const casts = darkHarvest.casts.length;
  const ratings = darkHarvest.casts.map(darkHarvestCastPerformance);
  const good = ratings.filter(
    (rating) => rating === QualitativePerformance.Good || rating === QualitativePerformance.Perfect,
  ).length;
  const missedEverything = darkHarvest.casts.filter((cast) => cast.hits.length === 0).length;
  const ratio = good / casts;
  return {
    id: 'dark-harvest-coverage',
    title: (
      <>
        Channel <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} /> into targets with every DoT
      </>
    ),
    description: (
      <>
        {casts - good} of {casts} Dark Harvest {plural(casts, 'cast')} hit a target that lacked 2 or
        more DoTs
        {missedEverything > 0 && <>, and {missedEverything} hit no afflicted target at all</>}.
        Refresh <SpellLink spell={SPELLS.AGONY} />, <SpellLink spell={SPELLS.CORRUPTION_DEBUFF} />{' '}
        and <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> before you channel it.
      </>
    ),
    score: ratio,
    weight: WEIGHTS.darkHarvestCoverage,
    performance: performanceForHigherIsBetter(ratio, { perfect: 1, good: 0.8, ok: 0.5 }),
  };
}

function nightfallPriority(
  nightfall: Nightfall | undefined,
  fightDuration: number,
): ImprovementPriority | null {
  if (!nightfall?.active) {
    return null;
  }
  const wasted = nightfall.wastedProcs;
  const perMinute = wasted / (fightDuration / 60000);
  return {
    id: 'nightfall',
    title: (
      <>
        Use <SpellLink spell={TALENTS.NIGHTFALL_TALENT} /> procs before they expire
      </>
    ),
    description: (
      <>
        You wasted {wasted} {plural(wasted, 'proc')} ({perMinute.toFixed(1)} per minute). A proc
        expired, or a new proc replaced one while you already had two. Cast the instant{' '}
        <SpellLink spell={SPELLS.SHADOW_BOLT_AFFLI} /> before you refresh a DoT that has time left.
      </>
    ),
    score: linearScore(perMinute, 0, 3),
    weight: WEIGHTS.nightfall,
    performance:
      wasted === 0
        ? QualitativePerformance.Perfect
        : performanceForLowerIsBetter(perMinute, { good: 0.5, ok: 1.5 }),
  };
}

export interface AfflictionPriorityInputs {
  info: Info;
  castEfficiency?: CastEfficiency;
  alwaysBeCasting?: AlwaysBeCasting;
  cancelledCasts?: CancelledCasts;
  agony?: Agony;
  corruption?: Corruption;
  unstableAffliction?: UnstableAffliction;
  haunt?: Haunt;
  darkglare?: Darkglare;
  darkHarvest?: DarkHarvest;
  nightfall?: Nightfall;
  soulShards?: SoulShardTracker;
}

/** Builds one priority for each check that applies to the talents of this player. */
export function buildAfflictionPriorities({
  info,
  castEfficiency,
  alwaysBeCasting,
  cancelledCasts,
  agony,
  corruption,
  unstableAffliction,
  haunt,
  darkglare,
  darkHarvest,
  nightfall,
  soulShards,
}: AfflictionPriorityInputs): ImprovementPriority[] {
  const { combatant, fightDuration } = info;
  const hasUnstableAffliction = combatant.hasTalent(TALENTS.UNSTABLE_AFFLICTION_TALENT);
  const corruptionSpell = combatant.hasTalent(TALENTS.WITHER_TALENT)
    ? SPELLS.WITHER_DEBUFF
    : SPELLS.CORRUPTION_DEBUFF;

  const candidates: (ImprovementPriority | null)[] = [
    activeTimePriority({
      alwaysBeCasting,
      fightDuration,
      weight: WEIGHTS.activeTime,
      thresholds: { perfect: 0.02, good: 0.1, ok: 0.15 },
      worst: 0.25,
      movementTips: (
        <>
          While you move, refresh DoTs with the instant <SpellLink spell={SPELLS.AGONY} /> and{' '}
          <SpellLink spell={SPELLS.CORRUPTION_CAST} />, and use{' '}
          <SpellLink spell={TALENTS.NIGHTFALL_TALENT} /> Shadow Bolts. Place{' '}
          <SpellLink spell={SPELLS.DEMONIC_CIRCLE} /> before you need it.
        </>
      ),
    }),
    cancelledCastsPriority(cancelledCasts),
    agony
      ? dotUptimePriority({
          id: 'agony-uptime',
          spell: SPELLS.AGONY,
          uptime: agony.uptime,
          performance: agony.DowntimePerformance,
          weight: WEIGHTS.agony,
          worst: 0.6,
          tip: 'It is your primary Soul Shard generator. Refresh it in its last 5 seconds, before it expires.',
        })
      : null,
    corruption
      ? dotUptimePriority({
          id: 'corruption-uptime',
          spell: corruptionSpell,
          uptime: corruption.uptime,
          performance: corruption.DowntimePerformance,
          weight: WEIGHTS.corruption,
          worst: 0.6,
          tip: (
            <>
              Refresh it in its last 4 seconds, before it expires.{' '}
              <SpellLink spell={TALENTS.NIGHTFALL_TALENT} /> procs come from it.
            </>
          ),
        })
      : null,
    hasUnstableAffliction && unstableAffliction
      ? dotUptimePriority({
          id: 'unstable-affliction-uptime',
          spell: SPELLS.UNSTABLE_AFFLICTION,
          uptime: unstableAffliction.uptime,
          performance: unstableAffliction.DowntimePerformance,
          weight: WEIGHTS.unstableAffliction,
          worst: 0.4,
          tip: (
            <>
              Cast it whenever it is not on your target and you have a Soul Shard. On fights with 2
              or more targets, <SpellLink spell={SPELLS.SEED_OF_CORRUPTION_DEBUFF} /> replaces it,
              and low uptime is correct play.
            </>
          ),
        })
      : null,
    haunt?.active
      ? dotUptimePriority({
          id: 'haunt-uptime',
          spell: TALENTS.HAUNT_TALENT,
          uptime: haunt.uptime,
          performance: haunt.DowntimePerformance,
          weight: WEIGHTS.haunt,
          worst: 0.5,
          tip: `It increases all your damage to the target by ${formatPercentage(haunt.hauntDamageBonus, 0)}%. Cast it when its cooldown ends.`,
        })
      : null,
    combatant.hasTalent(TALENTS.SUMMON_DARKGLARE_TALENT)
      ? castEfficiencyPriority({
          castEfficiency,
          spell: TALENTS.SUMMON_DARKGLARE_TALENT,
          weight: WEIGHTS.darkglareCastEfficiency,
          why: 'It is your largest cooldown. Hold it only for a burn phase that you know will come.',
        })
      : null,
    darkglareDotsPriority(darkglare, hasUnstableAffliction ? 3 : 2),
    combatant.hasTalent(TALENTS.DARK_HARVEST_TALENT)
      ? castEfficiencyPriority({
          castEfficiency,
          spell: TALENTS.DARK_HARVEST_TALENT,
          weight: WEIGHTS.darkHarvestCastEfficiency,
          why: (
            <>
              Each <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> cast reduces its cooldown, so it
              returns faster than the tooltip says.
            </>
          ),
        })
      : null,
    darkHarvestCoveragePriority(darkHarvest),
    soulShardWastePriority({
      tracker: soulShards,
      fightDuration,
      weight: WEIGHTS.soulShards,
      spender: SPELLS.UNSTABLE_AFFLICTION,
      shardsPerCast: 1,
    }),
    nightfallPriority(nightfall, fightDuration),
  ];
  return candidates.filter((p): p is ImprovementPriority => p !== null);
}

/** The "What to Focus On" section for Affliction. */
function ImprovementPrioritiesSection(): JSX.Element | null {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  const alwaysBeCasting = useAnalyzer(AlwaysBeCasting);
  const cancelledCasts = useAnalyzer(CancelledCasts);
  const agony = useAnalyzer(Agony);
  const corruption = useAnalyzer(Corruption);
  const unstableAffliction = useAnalyzer(UnstableAffliction);
  const haunt = useAnalyzer(Haunt);
  const darkglare = useAnalyzer(Darkglare);
  const darkHarvest = useAnalyzer(DarkHarvest);
  const nightfall = useAnalyzer(Nightfall);
  const soulShards = useAnalyzer(SoulShardTracker);

  if (!info) {
    return null;
  }

  const priorities = buildAfflictionPriorities({
    info,
    castEfficiency,
    alwaysBeCasting,
    cancelledCasts,
    agony,
    corruption,
    unstableAffliction,
    haunt,
    darkglare,
    darkHarvest,
    nightfall,
    soulShards,
  });

  return (
    <ImprovementPriorities
      priorities={priorities}
      intro={
        <>
          The changes most likely to raise your damage on this pull, ranked by value. Each one is
          something you control: DoT uptime, cooldown timing, resources, and casting. Gear and fight
          length are not included. The sections below give the details.
        </>
      }
    />
  );
}

export default ImprovementPrioritiesSection;
