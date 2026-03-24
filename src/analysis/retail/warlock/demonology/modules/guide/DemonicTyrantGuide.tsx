import type { JSX } from 'react';
import { useMemo } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import EventHistory from 'parser/shared/modules/EventHistory';
import {
  SpellSequence,
  type CastSequenceEntry,
  type CastInSequence,
} from 'interface/guide/components/CastSequence';
import DemonicTyrant, { TyrantCastData, TYRANT_WINDOW_MS } from '../features/DemonicTyrant';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useAnalyzer, useInfo } from 'interface/guide';

const TYRANT_PRE_WINDOW = 7000;
const TYRANT_POST_BUFFER = 3000;

interface ScoreBreakdown {
  total: number;
  totalSpenderCasts: number;
  maxExpectedCasts: number;
  components: {
    label: string;
    score: number;
    max: number;
    displayScore?: number;
    displayMax?: number;
  }[];
}

// Computes a weighted 0–100 score for a single Tyrant window across spender casts, cooldown usage, and resource management.
function scoreTyrantWindow(cast: TyrantCastData, isDialobist: boolean): ScoreBreakdown {
  const totalSpenderCasts = cast.handOfGuldanCasts;

  // Pro-rate the max HoG cast expectation based on how much of the window actually occurred.
  const windowFraction = cast.actualWindowDurationMs / TYRANT_WINDOW_MS;
  const maxExpectedCasts = cast.fightEndedDuringWindow
    ? Math.max(1, Math.round(8 * windowFraction))
    : 8;
  const dreadstalkerScore = cast.dreadstalkersActive
    ? cast.dreadstalkersTooEarly
      ? 11 // active but summoned in the first half of their duration (too early)
      : 15 // active and timed well
    : cast.dreadstalkersCastDuringWindow
      ? 7 // cast inside the window (wastes a GCD)
      : 0; // not active at all
  // If the fight ended early, leftover shards aren't the player's fault — full points.
  const missedCasts =
    cast.fightEndedDuringWindow || cast.shardsAtWindowEnd === null
      ? 0
      : Math.floor(cast.shardsAtWindowEnd / 3);
  const shardsEndScore = missedCasts === 0 ? 15 : missedCasts === 1 ? 8 : missedCasts === 2 ? 3 : 0; // penalizes leftover shards that could have been spender casts
  // If grimoire was on CD when Tyrant was cast but used during the window, it came off CD naturally — full points.
  const grimoireCameOffCdDuringWindow = cast.grimoireCastDuringWindow && !cast.grimoireAvailable;
  const grimoireScore =
    cast.grimoireAvailable === null
      ? null // not talented — excluded from scoring
      : cast.grimoireAvailable && !cast.grimoireCast && !cast.grimoireCastDuringWindow
        ? 0 // available but never cast
        : cast.grimoireCastDuringWindow && !grimoireCameOffCdDuringWindow
          ? 2 // was available before Tyrant but cast during window instead (wastes a GCD)
          : 5; // cast before the window, or came off CD during the window (both ideal)
  const doomguardScore =
    cast.doomguardAvailable === null
      ? null // not talented — excluded from scoring
      : cast.doomguardAvailable && !cast.doomguardCast
        ? 0 // available but skipped
        : 5;
  // Diabolist wants 5 shards to fuel HoG casts; Soul Harvester only needs 2.
  const shardsOnCastScore = isDialobist
    ? cast.shardsOnCast >= 5
      ? 5
      : cast.shardsOnCast >= 3
        ? 3
        : cast.shardsOnCast >= 1
          ? 1
          : 0
    : cast.shardsOnCast >= 2
      ? 5
      : cast.shardsOnCast === 1
        ? 3
        : 0;

  // Optional talents take a fixed 5pts each; the remaining pool is split proportionally among base components.
  // This means base component weights shift depending on which optional talents are taken.
  const grimoireMax = grimoireScore !== null ? 5 : 0;
  const doomguardMax = doomguardScore !== null ? 5 : 0;
  const basePool = 100 - grimoireMax - doomguardMax;

  // Raw relative weights for base components (must sum to a consistent total for scaling).
  const BASE_WEIGHTS = { hog: 50, dreadstalkers: 15, shardsEnd: 15, shardsOnCast: 5 };
  const BASE_WEIGHT_TOTAL = Object.values(BASE_WEIGHTS).reduce((a, b) => a + b, 0);
  const w = (weight: number) => Math.round((weight / BASE_WEIGHT_TOTAL) * basePool);

  const hogMax = w(BASE_WEIGHTS.hog);
  const dreadstalkerMax = w(BASE_WEIGHTS.dreadstalkers);
  const shardsEndMax = w(BASE_WEIGHTS.shardsEnd);
  const shardsOnCastMax = w(BASE_WEIGHTS.shardsOnCast);

  const scaledHog = Math.round(
    (Math.min(totalSpenderCasts, maxExpectedCasts) / maxExpectedCasts) * hogMax,
  );
  const scaledDreadstalker = Math.round((dreadstalkerScore / 15) * dreadstalkerMax);
  const scaledShardsEnd = Math.round((shardsEndScore / 15) * shardsEndMax);
  const scaledGrimoire = grimoireScore !== null ? Math.round((grimoireScore / 5) * grimoireMax) : 0;
  const scaledDoomguard =
    doomguardScore !== null ? Math.round((doomguardScore / 5) * doomguardMax) : 0;
  const scaledShardsOnCast = Math.round((shardsOnCastScore / 5) * shardsOnCastMax);

  const components: ScoreBreakdown['components'] = [
    {
      label: isDialobist
        ? `HoG / Ruination casts (${totalSpenderCasts} / ${maxExpectedCasts})`
        : `Hand of Gul'dan casts (${totalSpenderCasts} / ${maxExpectedCasts})`,
      score: scaledHog,
      max: hogMax,
    },
    { label: 'Dreadstalkers timing', score: scaledDreadstalker, max: dreadstalkerMax },
    { label: 'Shards at window end', score: scaledShardsEnd, max: shardsEndMax },
  ];
  if (grimoireScore !== null) {
    components.push({ label: 'Grimoire cast', score: scaledGrimoire, max: grimoireMax });
  }
  if (doomguardScore !== null) {
    components.push({ label: 'Doomguard cast', score: scaledDoomguard, max: doomguardMax });
  }
  components.push({
    label: 'Soul Shards at cast',
    score: scaledShardsOnCast,
    max: shardsOnCastMax,
    displayScore: shardsOnCastScore,
    displayMax: 5,
  });

  const rawScore =
    scaledHog +
    scaledDreadstalker +
    scaledShardsEnd +
    scaledGrimoire +
    scaledDoomguard +
    scaledShardsOnCast;
  const total = Math.min(100, rawScore);

  return { total, totalSpenderCasts, maxExpectedCasts, components };
}

// Maps a numeric window score to a performance rating, requiring ≥ maxExpectedCasts spender casts to qualify for Perfect.
function scoreToPerf(
  score: number,
  totalSpenderCasts?: number,
  maxExpectedCasts = 8,
): QualitativePerformance {
  const spenderRequirementMet =
    totalSpenderCasts === undefined || totalSpenderCasts >= maxExpectedCasts;
  if (score >= 95 && spenderRequirementMet) return QualitativePerformance.Perfect;
  if (score >= 70) return QualitativePerformance.Good;
  if (score >= 50) return QualitativePerformance.Ok;
  return QualitativePerformance.Fail;
}

function formatTimestampMs(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function getTyrantFeedback(
  cast: TyrantCastData,
  isDialobist: boolean,
  casts: CastInSequence[],
  isFirstWindow: boolean,
  perf: QualitativePerformance,
  maxExpectedCasts: number,
): JSX.Element {
  const {
    handOfGuldanCasts,
    maxDemonicPowerStacks,
    dreadstalkersActive,
    dreadstalkersTooEarly,
    dreadstalkersCastDuringWindow,
    grimoireAvailable,
    grimoireCast,
    grimoireCastDuringWindow,
    doomguardAvailable,
    doomguardCast,
    shardsOnCast,
    demonicCoresOnCast,
    shardsAtWindowEnd,
    fightEndedDuringWindow,
  } = cast;
  const feedback: string[] = [];
  const preTyrantCasts = casts.filter((c) => c.timestamp < cast.cast);
  const spenderLabel = isDialobist ? 'HoG / Ruination' : "Hand of Gul'dan";
  const grimoireCameOffCdDuringWindow = grimoireCastDuringWindow && !grimoireAvailable;

  if (fightEndedDuringWindow) {
    feedback.push(
      `The fight ended during this Tyrant window — score is pro-rated to ${maxExpectedCasts} expected ${spenderLabel} cast${maxExpectedCasts === 1 ? '' : 's'}.`,
    );
  }

  if (handOfGuldanCasts >= maxExpectedCasts && perf === QualitativePerformance.Perfect) {
    feedback.push(
      `Perfect Tyrant window. You maximized ${spenderLabel} casts during the Tyrant duration.`,
    );
  } else if (handOfGuldanCasts >= maxExpectedCasts) {
    feedback.push(
      `Good ${spenderLabel} count, but other issues prevented a perfect window — see below.`,
    );
  } else if (handOfGuldanCasts >= Math.round(maxExpectedCasts * 0.75)) {
    feedback.push(
      `${handOfGuldanCasts} ${spenderLabel} casts — good window. Aim for ${maxExpectedCasts} for a perfect window.`,
    );
  } else if (handOfGuldanCasts >= Math.round(maxExpectedCasts * 0.6)) {
    feedback.push(
      `Only ${handOfGuldanCasts} ${spenderLabel} cast${handOfGuldanCasts === 1 ? '' : 's'} during Tyrant. Aim for at least ${maxExpectedCasts}.`,
    );
  } else {
    feedback.push(
      `Only ${handOfGuldanCasts} ${spenderLabel} cast${handOfGuldanCasts === 1 ? '' : 's'} during Tyrant — this window was significantly underpowered.`,
    );
  }

  const castedPowerSiphon = preTyrantCasts.some(
    (cast) => cast.spellId === TALENTS.POWER_SIPHON_TALENT.id,
  );

  if (!dreadstalkersActive && !dreadstalkersCastDuringWindow) {
    feedback.push(
      "Cast Call Dreadstalkers before Demonic Tyrant to ensure you can immediately begin Hand of Gul'dan casts without wasting GCDs.",
    );
  } else if (dreadstalkersCastDuringWindow && !dreadstalkersActive) {
    // Only flag if there was no pre-Tyrant cast — an in-window cast alongside a pre-cast is a legitimate re-cast on cooldown.
    feedback.push(
      "Call Dreadstalkers was cast during the Tyrant window instead of before it, wasting GCDs you could have used on Hand of Gul'dan.",
    );
  } else if (dreadstalkersTooEarly) {
    feedback.push(
      'Call Dreadstalkers was cast too early before Tyrant. Try casting it closer to your Summon Demonic Tyrant window.',
    );
  }

  if (castedPowerSiphon)
    feedback.push('Power Siphon before Tyrant sacrifices imps that could increase Tyrant damage.');

  if (maxDemonicPowerStacks < 8)
    feedback.push(
      'Entering Tyrant with more imps already active will significantly increase its damage.',
    );

  if (grimoireAvailable && !grimoireCast && !grimoireCastDuringWindow)
    feedback.push(
      "Cast your Grimoire cooldown before Tyrant so you don't waste GCDs during the window.",
    );
  else if (grimoireAvailable && grimoireCastDuringWindow)
    // Only flag if Grimoire was available before Tyrant — if it came off CD during the window, the in-window cast is correct.
    feedback.push(
      'Your Grimoire cooldown was cast during the Tyrant window instead of before it, wasting a GCD.',
    );
  else if (grimoireCameOffCdDuringWindow)
    feedback.push(
      'Your Grimoire cooldown became available during the Tyrant window and was cast — good use.',
    );

  if (doomguardAvailable && !doomguardCast)
    feedback.push("Cast Summon Doomguard before Tyrant so you don't waste GCDs during the window.");

  const shardsThreshold = isDialobist ? 5 : 2;
  if (shardsOnCast < shardsThreshold)
    feedback.push(
      `You entered the Tyrant window with ${shardsOnCast} Soul Shard${shardsOnCast === 1 ? '' : 's'}. Try to pool at least ${shardsThreshold} Soul Shards before casting Tyrant${isDialobist ? ' to fuel Ruination casts' : ''}.`,
    );

  if (demonicCoresOnCast === 0 && !isFirstWindow)
    feedback.push(
      "You had no Demonic Core charges when casting Tyrant. Save Demonic Cores before your Tyrant window to fuel Hand of Gul'dan casts.",
    );
  else if (demonicCoresOnCast === 1 && !isFirstWindow)
    feedback.push(
      'You had only 1 Demonic Core when casting Tyrant. Try to save more charges before the window.',
    );

  if (!fightEndedDuringWindow && shardsAtWindowEnd !== null && shardsAtWindowEnd >= 3) {
    const missedCasts = Math.floor(shardsAtWindowEnd / 3);
    feedback.push(
      `You ended the Tyrant window with ${shardsAtWindowEnd} Soul Shards — that's ${missedCasts} missed Hand of Gul'dan cast${missedCasts === 1 ? '' : 's'}.`,
    );
  }

  return (
    <ul>
      {feedback.map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </ul>
  );
}

function DemonicTyrantGuide(): JSX.Element | null {
  const demonicTyrant = useAnalyzer(DemonicTyrant);
  const eventHistory = useAnalyzer(EventHistory);
  const info = useInfo();
  // Used to relabel spender casts and conditionally show the Demonic Cores stat.
  const isDialobist = info?.combatant.hasTalent(TALENTS.RUINATION_TALENT) ?? false;
  const hasPowerSiphon = info?.combatant.hasTalent(TALENTS.POWER_SIPHON_TALENT) ?? false;

  const tyrantSequenceEvents = useMemo((): CastSequenceEntry<TyrantCastData>[] => {
    if (!demonicTyrant || !eventHistory) return [];
    return demonicTyrant.tyrantData.map((cast) => {
      const windowStart = cast.cast - TYRANT_PRE_WINDOW;
      const windowEnd = cast.cast + TYRANT_WINDOW_MS + TYRANT_POST_BUFFER;

      const castEvents = eventHistory.getEvents([EventType.Cast], {
        searchBackwards: false,
        startTimestamp: windowStart,
        duration: windowEnd - windowStart,
      });

      const casts: CastInSequence[] = castEvents.map((event) => ({
        timestamp: event.timestamp,
        spellId: event.ability.guid,
        spellName: event.ability.name,
        icon: event.ability.abilityIcon.replace('.jpg', ''),
      }));

      return {
        data: cast,
        start: windowStart,
        end: windowEnd,
        casts,
      };
    });
  }, [demonicTyrant, eventHistory]);

  const perCastData: PerCastData[] = useMemo(() => {
    if (!demonicTyrant || !eventHistory) return [];
    const fightStart =
      eventHistory.getEvents([EventType.Cast], {
        searchBackwards: false,
        count: 1,
      })[0]?.timestamp ?? 0;

    return demonicTyrant.tyrantData.map((cast, index) => {
      const sequenceEntry = tyrantSequenceEvents[index];

      const scoreBreakdown = scoreTyrantWindow(cast, isDialobist);
      const score = scoreBreakdown.total;
      const perf = scoreToPerf(
        score,
        scoreBreakdown.totalSpenderCasts,
        scoreBreakdown.maxExpectedCasts,
      );
      return {
        performance: perf,
        timestamp: `${formatTimestampMs(cast.cast - fightStart)} – ${formatTimestampMs(cast.cast + cast.actualWindowDurationMs - fightStart)}`,
        stats: [
          {
            label: isDialobist ? 'HoG / Ruination Casts' : "Hand of Gul'dan Casts",
            value: cast.handOfGuldanCasts,
            tooltip: isDialobist
              ? "Number of Hand of Gul'dan and Ruination casts during the Tyrant window"
              : "Number of Hand of Gul'dan casts during the Tyrant window",
          },
          {
            label: 'Max Demonic Power Stacks',
            value: cast.maxDemonicPowerStacks,
            tooltip: 'Highest stacks of Demonic Power the Tyrant had during the window',
          },
          {
            label: 'Soul Shards at Cast',
            value: Math.round(cast.shardsOnCast),
            tooltip:
              'Soul Shards available when Demonic Tyrant was cast. Aim for 2+ (Soul Harvester) or 5 (Diabolist).',
          },
          ...(index > 0 || hasPowerSiphon
            ? [
                {
                  label: 'Demonic Cores at Cast',
                  value: cast.demonicCoresOnCast,
                  tooltip: 'Demonic Core stacks available when Demonic Tyrant was cast (max 4).',
                },
              ]
            : []),
          ...(cast.shardsAtWindowEnd !== null
            ? [
                {
                  label: 'Soul Shards at Window End',
                  value: cast.shardsAtWindowEnd,
                  tooltip:
                    "Soul Shards remaining when the Tyrant window ended. Aim for fewer than 3 — leftover shards could have been another Hand of Gul'dan.",
                },
              ]
            : []),
          {
            label: 'Score',
            value: `${score} / 100`,
            performance: perf,
            tooltip: (
              <div>
                <div style={{ marginBottom: 4, fontWeight: 700 }}>Score breakdown</div>
                {scoreBreakdown.components.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      opacity: c.score === 0 ? 0.5 : 1,
                    }}
                  >
                    <span>{c.label}</span>
                    <span>
                      {c.displayScore ?? c.score} / {c.displayMax ?? c.max}
                    </span>
                  </div>
                ))}
              </div>
            ),
          },
        ],
        details: getTyrantFeedback(
          cast,
          isDialobist,
          sequenceEntry?.casts ?? [],
          index === 0,
          perf,
          scoreBreakdown.maxExpectedCasts,
        ),
        // Splits casts into in-window and post-window groups, ghosting post-window entries.
        additionalContent: sequenceEntry
          ? (() => {
              const tyrantWindowEnd = cast.cast + TYRANT_WINDOW_MS;
              const inWindowCasts = sequenceEntry.casts.filter(
                (c) => c.timestamp <= tyrantWindowEnd,
              );
              const postWindowCasts = sequenceEntry.casts
                .filter((c) => c.timestamp > tyrantWindowEnd)
                .map((c) => ({
                  ...c,
                  ghosted: true as const,
                  tooltip: (
                    <div>
                      <strong>{c.spellName}</strong>
                      <p>
                        <em>Cast after the Tyrant window ended</em>
                      </p>
                    </div>
                  ),
                }));
              return {
                title: 'Cast Sequence',
                content: (
                  <>
                    <SpellSequence casts={inWindowCasts} iconSize={40} />
                    {postWindowCasts.length > 0 && (
                      <>
                        <div
                          style={{
                            fontSize: '1.1rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                            marginTop: 4,
                            marginBottom: 2,
                            fontStyle: 'italic',
                          }}
                        >
                          cast after the tyrant window ended
                        </div>
                        <SpellSequence casts={postWindowCasts} iconSize={40} />
                      </>
                    )}
                  </>
                ),
              };
            })()
          : undefined,
      };
    });
  }, [demonicTyrant, eventHistory, tyrantSequenceEvents, isDialobist, hasPowerSiphon]);

  if (!demonicTyrant || !eventHistory) return null;

  const tyrant = <SpellLink spell={SPELLS.SUMMON_DEMONIC_TYRANT} />;

  const explanation = (
    <>
      <p>
        <b>{tyrant}</b> deals increased damage based on the number of active demons during its
        duration. To maximize its effectiveness, summon as many pets as possible before and during
        the Tyrant window.
      </p>

      <p>The primary demons contributing to Tyrant damage are:</p>

      <ul>
        <li>
          <SpellLink spell={SPELLS.CALL_DREADSTALKERS} /> — summons two Dreadstalkers
        </li>
        <li>
          Wild Imps summoned from <SpellLink spell={SPELLS.HAND_OF_GULDAN_CAST} />
        </li>
        <li>
          Imp Gang Bosses summoned by <SpellLink spell={SPELLS.IMPLOSION_CAST} /> or{' '}
          <SpellLink spell={TALENTS.POWER_SIPHON_TALENT} /> with the talent{' '}
          <SpellLink spell={TALENTS.TO_HELL_AND_BACK_TALENT} />
        </li>
      </ul>

      <p>
        During the Tyrant window, aim to cast as many{' '}
        <SpellLink spell={SPELLS.HAND_OF_GULDAN_CAST} /> as possible to summon additional imps and
        increase Tyrant's damage.
      </p>
    </>
  );

  return (
    <GuideSection spell={SPELLS.SUMMON_DEMONIC_TYRANT} explanation={explanation}>
      <CastDetail title="Demonic Tyrant Casts" casts={perCastData} />
    </GuideSection>
  );
}

export default DemonicTyrantGuide;
