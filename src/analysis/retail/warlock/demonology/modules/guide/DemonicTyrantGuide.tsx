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

  let dreadstalkerScore: number;
  if (cast.dreadstalkersActive) {
    dreadstalkerScore = cast.dreadstalkersTooEarly ? 11 : 15;
  } else if (cast.dreadstalkersCastDuringWindow) {
    dreadstalkerScore = 7; // cast inside the window wastes a GCD
  } else {
    dreadstalkerScore = 0;
  }

  // If the fight ended early, leftover shards aren't the player's fault — full points.
  const missedCasts =
    cast.fightEndedDuringWindow || cast.shardsAtWindowEnd === null
      ? 0
      : Math.floor(cast.shardsAtWindowEnd / 3);
  let shardsEndScore: number;
  if (missedCasts === 0) shardsEndScore = 15;
  else if (missedCasts === 1) shardsEndScore = 8;
  else if (missedCasts === 2) shardsEndScore = 3;
  else shardsEndScore = 0;

  // If grimoire was on CD when Tyrant was cast but used during the window, it came off CD naturally — full points.
  const grimoireCameOffCdDuringWindow = cast.grimoireCastDuringWindow && !cast.grimoireAvailable;
  let grimoireScore: number | null;
  if (cast.grimoireAvailable === null) {
    grimoireScore = null; // not talented — excluded from scoring
  } else if (cast.grimoireAvailable && !cast.grimoireCast && !cast.grimoireCastDuringWindow) {
    grimoireScore = 0; // available but never cast
  } else if (cast.grimoireCastDuringWindow && !grimoireCameOffCdDuringWindow) {
    grimoireScore = 2; // was available before Tyrant but cast during window instead (wastes a GCD)
  } else {
    grimoireScore = 5; // cast before the window, or came off CD during the window (both ideal)
  }

  let doomguardScore: number | null;
  if (cast.doomguardAvailable === null) {
    doomguardScore = null; // not talented — excluded from scoring
  } else if (cast.doomguardAvailable && !cast.doomguardCast) {
    doomguardScore = 0; // available but skipped
  } else {
    doomguardScore = 5;
  }

  // Diabolist: 1 point per shard, capped at 5.
  // Non-Diabolist: Tyrant grants 3 shards on cast, so 2 is ideal — each shard above 2 is wasted (overcaps on cast), costing 2 points.
  let shardsOnCastScore: number;
  if (isDialobist) {
    shardsOnCastScore = Math.min(cast.shardsOnCast, 5);
  } else {
    const wastedShards = Math.max(0, cast.shardsOnCast - 2);
    shardsOnCastScore = Math.max(0, 5 - wastedShards * 2);
  }

  // Fixed weights per component. Each raw score is already in range 0..weight, so raw scores
  // are used directly as contributions. Absent talents are excluded and the sum normalizes to 100.
  const grimoireWeight = grimoireScore !== null ? 5 : 0;
  const doomguardWeight = doomguardScore !== null ? 5 : 0;
  const totalWeight = 50 + 15 + 15 + grimoireWeight + doomguardWeight + 5;

  const hogRatio = Math.min(totalSpenderCasts, maxExpectedCasts) / maxExpectedCasts;
  const rawScore =
    hogRatio * 50 +
    dreadstalkerScore +
    shardsEndScore +
    (grimoireScore ?? 0) +
    (doomguardScore ?? 0) +
    shardsOnCastScore;
  const total = Math.round((rawScore / totalWeight) * 100);

  const spenderLabel = isDialobist
    ? `HoG / Ruination casts (${totalSpenderCasts} / ${maxExpectedCasts})`
    : `Hand of Gul'dan casts (${totalSpenderCasts} / ${maxExpectedCasts})`;

  const components: ScoreBreakdown['components'] = [
    { label: spenderLabel, score: Math.round(hogRatio * 50), max: 50 },
    { label: 'Dreadstalkers timing', score: dreadstalkerScore, max: 15 },
    { label: 'Shards at window end', score: shardsEndScore, max: 15 },
  ];
  if (grimoireScore !== null) {
    components.push({ label: 'Grimoire cast', score: grimoireScore, max: 5 });
  }
  if (doomguardScore !== null) {
    components.push({ label: 'Doomguard cast', score: doomguardScore, max: 5 });
  }
  components.push({ label: 'Soul Shards at cast', score: shardsOnCastScore, max: 5 });

  return { total, totalSpenderCasts, maxExpectedCasts, components };
}

// Maps a numeric window score to a performance rating.
// Perfect requires ≥ maxExpectedCasts spender casts; Good requires ≥ 6.
function scoreToPerf(
  score: number,
  totalSpenderCasts?: number,
  maxExpectedCasts = 8,
): QualitativePerformance {
  const spenderRequirementMet =
    totalSpenderCasts === undefined || totalSpenderCasts >= maxExpectedCasts;
  const goodSpenderRequirementMet = totalSpenderCasts === undefined || totalSpenderCasts >= 6;
  if (score >= 95 && spenderRequirementMet) return QualitativePerformance.Perfect;
  if (score >= 80 && goodSpenderRequirementMet) return QualitativePerformance.Good;
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
      "Grimoire was available but wasn't used this window. If you're holding it for a burn phase that's fine, otherwise cast it before Tyrant to avoid wasting GCDs during the window.",
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

  if (isDialobist) {
    if (shardsOnCast < 5)
      feedback.push(
        `You entered the Tyrant window with ${shardsOnCast} Soul Shard${shardsOnCast === 1 ? '' : 's'}. Try to pool at least 5 Soul Shards before casting Tyrant to fuel Hand of Gul'dan casts.`,
      );
  } else {
    // Tyrant grants 3 shards on cast — 2 is ideal, 0–1 is fine, 4+ is wasteful.
    if (shardsOnCast >= 4)
      feedback.push(
        `You entered the Tyrant window with ${shardsOnCast} Soul Shard${shardsOnCast === 1 ? '' : 's'}. Aim for around 2 — Tyrant grants 3 shards on cast, so higher counts cap your shards and waste resources.`,
      );
  }

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

  const [summary, ...details] = feedback;

  return (
    <div>
      <p>{summary}</p>
      {details.length > 0 && (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {details.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </div>
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
      let additionalContent;
      if (sequenceEntry) {
        const tyrantWindowEnd = cast.cast + TYRANT_WINDOW_MS;
        const inWindowCasts = sequenceEntry.casts.filter((c) => c.timestamp <= tyrantWindowEnd);
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
        additionalContent = {
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
      }

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
            tooltip:
              'Highest stacks of Demonic Power during the window. Each active demon (Wild Imps, Dreadstalkers, Felguard) grants one stack.',
          },
          {
            label: 'Soul Shards at Cast',
            value: Math.round(cast.shardsOnCast),
            tooltip:
              'Soul Shards available when Demonic Tyrant was cast. Aim for ~2 (Soul Harvester) — Tyrant grants 3 shards on cast, so 0–2 is fine while 4+ is wasteful. Diabolist should aim for 5.',
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
                {(cast.grimoireAvailable === null || cast.doomguardAvailable === null) && (
                  <div style={{ marginTop: 6, opacity: 0.6, fontStyle: 'italic' }}>
                    Untalented cooldowns excluded; total normalized to 100.
                  </div>
                )}
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
        additionalContent,
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
