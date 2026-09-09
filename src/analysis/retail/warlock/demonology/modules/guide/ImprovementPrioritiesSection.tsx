import type { JSX, ReactNode } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { formatDuration, formatPercentage } from 'common/format';
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
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import DemonicTyrant, { type TyrantCastData } from '../features/DemonicTyrant';
import DemonboltHardcasts from '../features/DemonboltHardcasts';
import DemonicCalling from '../talents/DemonicCalling';
import Doom from '../talents/Doom';
import PowerSiphon from '../talents/PowerSiphon';
import { scoreToPerf, scoreTyrantWindow } from './DemonicTyrantGuide';

/**
 * How much each check matters to Demonology damage, relative to the other checks. Only the
 * ratios matter. A weight 10 check at a 50% score outranks a weight 5 check at a 0% score.
 */
const WEIGHTS = {
  activeTime: 10,
  tyrantWindows: 12,
  tyrantCastEfficiency: 9,
  dreadstalkers: 7,
  grimoire: 5,
  doomguard: 5,
  soulShards: 5,
  powerSiphon: 4,
  demonboltHardcasts: 4,
  doomUptime: 3,
  demonicCalling: 3,
  powerSiphonImps: 2,
} as const;

interface ScoredWindow {
  window: TyrantCastData;
  index: number;
  score: number;
  maxSpenderCasts: number;
  performance: QualitativePerformance;
}

/**
 * Turns the scores of all Tyrant windows into one priority. It uses the same scoring as the
 * Demonic Tyrant section. The weak windows set the rating. The problems that repeat across all
 * windows set the advice, because a habit that also shows in a Good window is still worth a fix.
 */
function tyrantWindowsPriority(
  tyrant: DemonicTyrant | undefined,
  isDiabolist: boolean,
  fightStart: number,
): ImprovementPriority | null {
  if (!tyrant || tyrant.tyrantData.length === 0) {
    // The cast efficiency check covers a Tyrant that was never cast.
    return null;
  }

  const windows: ScoredWindow[] = tyrant.tyrantData.map((window, index) => {
    const breakdown = scoreTyrantWindow(window, isDiabolist);
    return {
      window,
      index,
      score: breakdown.total,
      maxSpenderCasts: breakdown.maxExpectedCasts,
      performance: scoreToPerf(
        breakdown.total,
        breakdown.totalSpenderCasts,
        breakdown.maxExpectedCasts,
      ),
    };
  });
  const total = windows.length;
  const average = windows.reduce((sum, w) => sum + w.score, 0) / total / 100;
  const weak = windows.filter(
    (w) =>
      w.performance === QualitativePerformance.Ok || w.performance === QualitativePerformance.Fail,
  );
  const failed = windows.filter((w) => w.performance === QualitativePerformance.Fail);
  const goodFraction = 1 - weak.length / total;

  let performance: QualitativePerformance;
  if (weak.length === 0) {
    performance = average >= 0.95 ? QualitativePerformance.Perfect : QualitativePerformance.Good;
  } else if (failed.length * 2 >= total || average < 0.6) {
    performance = QualitativePerformance.Fail;
  } else {
    performance = QualitativePerformance.Ok;
  }

  const spender = isDiabolist ? (
    <>
      <SpellLink spell={SPELLS.HAND_OF_GULDAN_CAST} /> or{' '}
      <SpellLink spell={SPELLS.RUINATION_CAST} />
    </>
  ) : (
    <SpellLink spell={SPELLS.HAND_OF_GULDAN_CAST} />
  );

  const count = (predicate: (w: ScoredWindow) => boolean) => windows.filter(predicate).length;
  const issues: { label: ReactNode; count: number }[] = [
    {
      label: 'ended with 3 or more unspent Soul Shards',
      count: count(
        (w) => !w.window.fightEndedDuringWindow && (w.window.shardsAtWindowEnd ?? 0) >= 3,
      ),
    },
    {
      label: <>fewer than 6 {spender} casts in the window</>,
      count: count(
        (w) => w.window.handOfGuldanCasts < Math.min(6, Math.round(w.maxSpenderCasts * 0.75)),
      ),
    },
    {
      label: (
        <>
          no <SpellLink spell={SPELLS.CALL_DREADSTALKERS} /> active at the cast
        </>
      ),
      count: count((w) => !w.window.dreadstalkersActive),
    },
    {
      label: (
        <>
          <SpellLink spell={SPELLS.CALL_DREADSTALKERS} /> cast too early before Tyrant
        </>
      ),
      count: count((w) => w.window.dreadstalkersTooEarly),
    },
    {
      label: (
        <>
          1 or fewer <SpellLink spell={SPELLS.DEMONIC_CORE_BUFF} /> at the cast
        </>
      ),
      // The opener cannot have Cores banked, so the first window is skipped.
      count: count((w) => w.index > 0 && w.window.demonicCoresOnCast <= 1),
    },
    {
      label: 'Grimoire demon available but not used',
      count: count(
        (w) =>
          w.window.grimoireAvailable === true &&
          !w.window.grimoireCast &&
          !w.window.grimoireCastDuringWindow,
      ),
    },
    {
      label: (
        <>
          <SpellLink spell={TALENTS.SUMMON_DOOMGUARD_TALENT} /> available but not used
        </>
      ),
      count: count((w) => w.window.doomguardAvailable === true && !w.window.doomguardCast),
    },
    isDiabolist
      ? {
          label: 'fewer than 5 Soul Shards at the cast',
          count: count((w) => w.window.shardsOnCast < 5),
        }
      : {
          label: '4 or more Soul Shards at the cast (Tyrant gives 3, so those overcap)',
          count: count((w) => w.window.shardsOnCast >= 4),
        },
  ]
    .filter((issue) => issue.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const weakList = weak
    .map((w) => `${formatDuration(w.window.cast - fightStart)} (${w.score}/100)`)
    .join(', ');

  return {
    id: 'tyrant-windows',
    title: (
      <>
        Prepare stronger <SpellLink spell={SPELLS.SUMMON_DEMONIC_TYRANT} /> windows
      </>
    ),
    description: (
      <>
        {weak.length === 0 ? (
          <>All {total} windows rated Good or better.</>
        ) : (
          <>
            {weak.length} of {total} {plural(total, 'window')} rated below Good: {weakList}.
          </>
        )}{' '}
        The average score was {Math.round(average * 100)}/100.
        {issues.length > 0 && (
          <>
            {' '}
            Recurring problems:{' '}
            {issues.map((issue, i) => (
              <span key={i}>
                {i > 0 && ', '}
                {issue.label} ({issue.count} of {total})
              </span>
            ))}
            .
          </>
        )}{' '}
        Before each Tyrant, cast <SpellLink spell={SPELLS.CALL_DREADSTALKERS} /> and your Grimoire
        demon. Bank {isDiabolist ? '5 Soul Shards' : 'about 2 Soul Shards'} and 4{' '}
        <SpellLink spell={SPELLS.DEMONIC_CORE_BUFF} />. Then spend everything on {spender} inside
        the window.
      </>
    ),
    score: 0.5 * average + 0.5 * goodFraction,
    weight: WEIGHTS.tyrantWindows,
    performance,
  };
}

function demonboltHardcastPriority(
  analyzer: DemonboltHardcasts | undefined,
): ImprovementPriority | null {
  if (!analyzer) {
    return null;
  }
  const { hardcasts, casts, hardcastsPerMinute } = analyzer;
  return {
    id: 'demonbolt-hardcasts',
    title: (
      <>
        Cast <SpellLink spell={SPELLS.DEMONBOLT} /> only with{' '}
        <SpellLink spell={SPELLS.DEMONIC_CORE_BUFF} />
      </>
    ),
    description: (
      <>
        You hard cast {hardcasts} of your {casts} Demonbolts without a Demonic Core (
        {hardcastsPerMinute.toFixed(1)} per minute). A hard cast Demonbolt takes much longer than{' '}
        <SpellLink spell={SPELLS.SHADOW_BOLT_DEMO} /> for the same shard. Use Shadow Bolt as the
        filler and keep Demonbolt for Core procs.
      </>
    ),
    score: linearScore(hardcastsPerMinute, 0, 2),
    weight: WEIGHTS.demonboltHardcasts,
    performance:
      hardcasts === 0
        ? QualitativePerformance.Perfect
        : performanceForLowerIsBetter(hardcastsPerMinute, { good: 0.25, ok: 1 }),
  };
}

function doomUptimePriority(doom: Doom | undefined): ImprovementPriority | null {
  if (!doom?.active) {
    return null;
  }
  const uptime = doom.uptime;
  return {
    id: 'doom-uptime',
    title: (
      <>
        Keep <SpellLink spell={SPELLS.DOOM_DEBUFF} /> active
      </>
    ),
    description: (
      <>
        Doom was on your target for {formatPercentage(uptime, 1)}% of the fight. Each{' '}
        <SpellLink spell={SPELLS.DEMONIC_CORE_BUFF} /> Demonbolt applies it. Outside of Tyrant
        preparation, spend a Core before Doom expires. Do not hold all four.
      </>
    ),
    score: linearScore(uptime, 1, 0.6),
    weight: WEIGHTS.doomUptime,
    performance: performanceForHigherIsBetter(uptime, { perfect: 0.98, good: 0.95, ok: 0.85 }),
  };
}

function demonicCallingPriority(
  demonicCalling: DemonicCalling | undefined,
  fightDuration: number,
): ImprovementPriority | null {
  if (!demonicCalling?.active) {
    return null;
  }
  const wasted = demonicCalling.wastedProcs;
  const perMinute = wasted / (fightDuration / 60000);
  return {
    id: 'demonic-calling',
    title: (
      <>
        Use <SpellLink spell={TALENTS.DEMONIC_CALLING_TALENT} /> procs before they expire
      </>
    ),
    description: (
      <>
        You wasted {wasted} {plural(wasted, 'proc')} ({perMinute.toFixed(1)} per minute). The buff
        expired, or a new proc replaced it while <SpellLink spell={SPELLS.CALL_DREADSTALKERS} /> was
        available. When you have the proc and Dreadstalkers is ready, cast it at once.
      </>
    ),
    score: linearScore(perMinute, 0, 3),
    weight: WEIGHTS.demonicCalling,
    performance:
      wasted === 0
        ? QualitativePerformance.Perfect
        : performanceForLowerIsBetter(perMinute, { good: 1, ok: 2 }),
  };
}

function powerSiphonImpsPriority(powerSiphon: PowerSiphon | undefined): ImprovementPriority | null {
  if (!powerSiphon?.active || powerSiphon.numCasts === 0) {
    return null;
  }
  const { numCasts, doubleImpSiphons, singleImpSiphons } = powerSiphon;
  const ratio = doubleImpSiphons / numCasts;
  return {
    id: 'power-siphon-imps',
    title: (
      <>
        Cast <SpellLink spell={TALENTS.POWER_SIPHON_TALENT} /> with 2 Wild Imps out
      </>
    ),
    description: (
      <>
        {singleImpSiphons} of {numCasts} Power Siphon {plural(numCasts, 'cast')} had only one Wild
        Imp to sacrifice. Each of those gave one <SpellLink spell={SPELLS.DEMONIC_CORE_BUFF} />{' '}
        instead of two. Cast it after a <SpellLink spell={SPELLS.HAND_OF_GULDAN_CAST} /> lands.
      </>
    ),
    score: ratio,
    weight: WEIGHTS.powerSiphonImps,
    performance: performanceForHigherIsBetter(ratio, { perfect: 1, good: 0.8, ok: 0.5 }),
  };
}

export interface DemonologyPriorityInputs {
  info: Info;
  castEfficiency?: CastEfficiency;
  alwaysBeCasting?: AlwaysBeCasting;
  tyrant?: DemonicTyrant;
  soulShards?: SoulShardTracker;
  demonboltHardcasts?: DemonboltHardcasts;
  demonicCalling?: DemonicCalling;
  doom?: Doom;
  powerSiphon?: PowerSiphon;
}

/** Builds one priority for each check that applies to the talents of this player. */
export function buildDemonologyPriorities({
  info,
  castEfficiency,
  alwaysBeCasting,
  tyrant,
  soulShards,
  demonboltHardcasts,
  demonicCalling,
  doom,
  powerSiphon,
}: DemonologyPriorityInputs): ImprovementPriority[] {
  const { combatant, fightDuration, fightStart } = info;
  const isDiabolist = combatant.hasTalent(TALENTS.RUINATION_TALENT);
  const grimoire = combatant.hasTalent(TALENTS.GRIMOIRE_IMP_LORD_TALENT)
    ? TALENTS.GRIMOIRE_IMP_LORD_TALENT
    : combatant.hasTalent(TALENTS.GRIMOIRE_FEL_RAVAGER_TALENT)
      ? TALENTS.GRIMOIRE_FEL_RAVAGER_TALENT
      : null;

  const candidates: (ImprovementPriority | null)[] = [
    activeTimePriority({
      alwaysBeCasting,
      fightDuration,
      weight: WEIGHTS.activeTime,
      thresholds: { perfect: 0.02, good: 0.1, ok: 0.2 },
      worst: 0.3,
      movementTips: (
        <>
          While you move, use instant <SpellLink spell={SPELLS.DEMONBOLT} />s from{' '}
          <SpellLink spell={SPELLS.DEMONIC_CORE_BUFF} /> and{' '}
          <SpellLink spell={SPELLS.IMPLOSION_CAST} />. Place{' '}
          <SpellLink spell={SPELLS.DEMONIC_CIRCLE} /> before you need it, so that each move costs
          fewer globals.
        </>
      ),
    }),
    tyrantWindowsPriority(tyrant, isDiabolist, fightStart),
    castEfficiencyPriority({
      castEfficiency,
      spell: SPELLS.SUMMON_DEMONIC_TYRANT,
      weight: WEIGHTS.tyrantCastEfficiency,
      why: 'Each delay pushes a full Tyrant window later into the fight. The last window can then not happen at all.',
    }),
    castEfficiencyPriority({
      castEfficiency,
      spell: SPELLS.CALL_DREADSTALKERS,
      weight: WEIGHTS.dreadstalkers,
      why: (
        <>
          Dreadstalkers are your main source of <SpellLink spell={SPELLS.DEMONIC_CORE_BUFF} />. A
          late cast also delays your Demonbolts.
        </>
      ),
    }),
    grimoire
      ? castEfficiencyPriority({
          castEfficiency,
          spell: grimoire,
          weight: WEIGHTS.grimoire,
          why: 'It aligns with every second Tyrant. Hold it only for a burn phase that you know will come.',
        })
      : null,
    combatant.hasTalent(TALENTS.SUMMON_DOOMGUARD_TALENT)
      ? castEfficiencyPriority({
          castEfficiency,
          spell: TALENTS.SUMMON_DOOMGUARD_TALENT,
          weight: WEIGHTS.doomguard,
          why: (
            <>
              Demonic Core Demonbolts reduce its cooldown. Cast it before{' '}
              <SpellLink spell={SPELLS.SUMMON_DEMONIC_TYRANT} />.
            </>
          ),
        })
      : null,
    combatant.hasTalent(TALENTS.POWER_SIPHON_TALENT)
      ? castEfficiencyPriority({
          castEfficiency,
          spell: TALENTS.POWER_SIPHON_TALENT,
          weight: WEIGHTS.powerSiphon,
          why: 'Two free Demonic Cores every 30 seconds is a lot of Demonbolts.',
        })
      : null,
    powerSiphonImpsPriority(powerSiphon),
    soulShardWastePriority({
      tracker: soulShards,
      fightDuration,
      weight: WEIGHTS.soulShards,
      spender: SPELLS.HAND_OF_GULDAN_CAST,
      shardsPerCast: 3,
    }),
    demonboltHardcastPriority(demonboltHardcasts),
    doomUptimePriority(doom),
    demonicCallingPriority(demonicCalling, fightDuration),
  ];
  return candidates.filter((p): p is ImprovementPriority => p !== null);
}

/** The "What to Focus On" section for Demonology. */
function ImprovementPrioritiesSection(): JSX.Element | null {
  const info = useInfo();
  const castEfficiency = useAnalyzer(CastEfficiency);
  const alwaysBeCasting = useAnalyzer(AlwaysBeCasting);
  const tyrant = useAnalyzer(DemonicTyrant);
  const soulShards = useAnalyzer(SoulShardTracker);
  const demonboltHardcasts = useAnalyzer(DemonboltHardcasts);
  const demonicCalling = useAnalyzer(DemonicCalling);
  const doom = useAnalyzer(Doom);
  const powerSiphon = useAnalyzer(PowerSiphon);

  if (!info) {
    return null;
  }

  const priorities = buildDemonologyPriorities({
    info,
    castEfficiency,
    alwaysBeCasting,
    tyrant,
    soulShards,
    demonboltHardcasts,
    demonicCalling,
    doom,
    powerSiphon,
  });

  return (
    <ImprovementPriorities
      priorities={priorities}
      intro={
        <>
          The changes most likely to raise your damage on this pull, ranked by value. Each one is
          something you control: cooldown timing, Tyrant preparation, resources, and uptime. Gear
          and fight length are not included. The sections below give the details.
        </>
      }
    />
  );
}

export default ImprovementPrioritiesSection;
