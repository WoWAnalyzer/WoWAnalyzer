import { Uptime } from 'parser/ui/UptimeBar';
import {
  BadColor,
  OkColor,
  PerfectColor,
  SubSection,
  useAnalyzer,
  useEvents,
  useInfo,
} from '../index';
import { FoundationHighlight as HL } from './shared';
import { Highlight } from 'interface/Highlight';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { CastEvent, EventType } from 'parser/core/Events';
import { useMemo } from 'react';
import { MeleeUptimeAnalyzer } from './analyzers/MeleeUptimeAnalyzer';
import { formatDuration, formatPercentage } from 'common/format';
import TimelineDiagram, {
  TimelineTrack,
  useTimelinePosition,
} from 'interface/timeline-diagram/TimelineDiagram';
import { Info } from 'parser/core/metric';
import { TooltipElement } from 'interface/Tooltip';
import PerformanceStrong from 'interface/PerformanceStrong';
import { ByRole, Role } from './ByRole';
import { useFight } from 'interface/report/context/FightContext';
import { EncounterTimelineAbility, findByBossId } from 'game/raids';
import Para from '../Para';
import styled from '@emotion/styled';
import React from 'react';
import SegmentTimeline, {
  DisplaySegment,
  TimelineAbility,
} from 'interface/timeline-diagram/SegmentTimeline';
import useReportEvents from '../hooks/useReportEvents';
import DowntimeDebuffAnalyzer from './analyzers/DowntimeDebuffAnalyzer';
import CancelledCasts, { CancelGap } from 'parser/shared/modules/CancelledCasts';
import ROLES from 'game/ROLES';
import SpellLink from 'interface/SpellLink';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';

export default function FoundationDowntimeSectionV2(): JSX.Element | null {
  const info = useInfo();
  const abc = useAnalyzer(AlwaysBeCasting);
  const melee = useAnalyzer(MeleeUptimeAnalyzer);
  const debuffs = useAnalyzer(DowntimeDebuffAnalyzer);
  const cancelledCasts = useAnalyzer(CancelledCasts);

  const globalMeleeEvents = useReportEvents(
    info?.reportCode,
    info?.fightStart,
    info?.fightEnd,
    'ability.id = 1 and source.type = "Player" and type = "cast"',
  );
  const globalMeleeUptime = useMemo(
    () =>
      info &&
      globalMeleeEvents &&
      estimateGlobalMeleeUptime(info.fightStart, info.fightEnd, globalMeleeEvents as CastEvent[]),
    [info, globalMeleeEvents],
  );

  const healingUptime = useMemo(() => {
    const uptime = abc?.activeHealingTimePercentage ?? 0.0;
    // extremely lax "performance" value is just used for icon/stat value.
    const perf = evaluateQualitativePerformanceByThreshold({
      actual: uptime,
      max: 1,
      isGreaterThanOrEqual: {
        good: 0.7 * (abc?.activeTimePercentage ?? 0.8),
        ok: 0.0,
      },
    });
    return {
      uptime,
      perf,
    };
  }, [abc]);

  if (!info || !abc) {
    return null;
  }

  const uptimeHistory = abc.activeTimeSegments;
  const nonHealingUptimeHistory = abc.activeNonHealingTimeSegments;

  // intentionally not including the "hide explanation" options for right now

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '3em',
        }}
      >
        <div
          style={{
            display: 'grid',
            alignItems: 'start',
            justifyItems: 'left',
          }}
        >
          <UptimeStatistics>
            <dt>
              <PerformanceStrong performance={abc.DowntimePerformance}>
                {formatPercentage(abc.activeTimePercentage, 1)}%
              </PerformanceStrong>
            </dt>
            <dd>
              <TooltipElement content="The percentage of time that you spent casting, waiting for the Global Cooldown, or with no abilities off-cooldown.">
                Ability Uptime
              </TooltipElement>
            </dd>
            <ByRole>
              <Role.Melee>
                {melee && (
                  <>
                    <dt>
                      <PerformanceStrong performance={melee.meleeUptimePerformance}>
                        {formatPercentage(melee.meleeUptimePercentage, 1)}%
                      </PerformanceStrong>
                    </dt>
                    <dd>
                      <TooltipElement content="The percentage of time that your basic melee swings were active, excluding time spent casting.">
                        Melee Uptime
                      </TooltipElement>
                    </dd>
                  </>
                )}
              </Role.Melee>
              <Role.Healer>
                <>
                  <dt>
                    <PerformanceStrong performance={healingUptime.perf}>
                      {formatPercentage(healingUptime.uptime, 1)}%
                    </PerformanceStrong>
                  </dt>
                  <dd>
                    <TooltipElement content="The percentage of time that you spent actively healing. A low percentage with high ability uptime might mean that you are over-healing and should have some healers play DPS instead.">
                      Healing Uptime
                    </TooltipElement>
                  </dd>
                </>
              </Role.Healer>
              <Role roles={[ROLES.HEALER, ROLES.DPS.RANGED]}>
                {cancelledCasts && (
                  <>
                    <dt>
                      <PerformanceStrong performance={cancelledCasts.CancelledPerformance}>
                        {formatPercentage(cancelledCasts.cancelledPercentage, 1)}%
                      </PerformanceStrong>
                    </dt>
                    <dd>
                      <TooltipElement content="The percentage of casts that you cancelled before finishing.">
                        Cancelled Casts
                      </TooltipElement>
                    </dd>
                  </>
                )}
              </Role>
            </ByRole>
          </UptimeStatistics>
        </div>
        <div>
          <Para>
            <ByRole>
              The foundation of good play in <em>WoW</em> is having good <HL>uptime.</HL>{' '}
              <Role.Melee>
                There should be no gaps between the end of one <GCD /> and the start of the next.
              </Role.Melee>
              <Role.Caster>
                There should be no gaps between the end of one spell cast and the start of the next.
              </Role.Caster>{' '}
              This diagram shows gaps in your uptime in{' '}
              <Highlight color={BadColor} textColor="white">
                red
              </Highlight>
              <Role.Healer>
                {' '}
                and non-healing uptime in{' '}
                <Highlight color={PerfectColor} textColor="black">
                  blue
                </Highlight>
              </Role.Healer>
              .
            </ByRole>
          </Para>
          <Para>
            With practice, you will be able to maintain uptime <em>and</em> pick the right abilities
            for each moment, but remember that{' '}
            <strong>doing something is better than doing nothing</strong>.
          </Para>
        </div>
      </div>
      <SubSection>
        <ComplexUptimeDisplay
          uptimeHistory={uptimeHistory}
          nonHealingUptimeHistory={nonHealingUptimeHistory}
          meleeGaps={melee?.meleeUptimeGaps}
          cancelGaps={cancelledCasts?.cancelGaps}
          globalMeleeGaps={globalMeleeUptime}
          debuffSegments={debuffs?.debuffSegments}
        />
      </SubSection>
    </>
  );
}

interface Props {
  uptimeHistory: Segment[];
  nonHealingUptimeHistory?: Segment[];
  meleeGaps?: Segment[];
  cancelGaps?: CancelGap[];
  globalMeleeGaps?: Segment[];
  debuffSegments?: DisplaySegment[];
}

interface Segment {
  start: number;
  end: number;
}

const UptimeStatistics = styled.dl`
  display: grid;
  grid-template-columns: max-content max-content;
  grid-gap: 0 0.75em;
  font-size: 2rem;
  align-items: baseline;

  & dd {
    font-size: 1.7rem;
    opacity: 80%;

    & dfn {
      border-bottom: unset;
      text-decoration: underline;
      text-decoration-style: dotted;
    }
  }
`;

function ComplexUptimeDisplay({
  uptimeHistory,
  nonHealingUptimeHistory,
  meleeGaps,
  cancelGaps,
  globalMeleeGaps,
  debuffSegments,
}: Props): JSX.Element | null {
  const info = useInfo();
  const { fight } = useFight();

  const boss = findByBossId(fight.boss);

  const isHealer = info?.combatant.owner.config.spec.role === ROLES.HEALER;

  const meleeGapsWithTooltips = useMemo(
    () =>
      info &&
      meleeGaps?.map((segment) => ({
        ...segment,
        tooltip: (
          <>
            Melee downtime from {formatDuration(segment.start - info.fightStart, 1)} to{' '}
            {formatDuration(segment.end - info.fightStart, 1)}{' '}
          </>
        ),
      })),
    [meleeGaps, info],
  );

  const cancelGapsWithTooltips = useMemo(
    () =>
      info &&
      cancelGaps?.map((gap) => ({
        ...gap,
        abilityId: undefined,
        tooltip: (
          <>
            <SpellLink spell={gap.abilityId} /> cast started at{' '}
            {formatDuration(gap.start - info.fightStart, 1)}, cancelled at {gap.capped ? '~' : ''}
            {formatDuration(gap.end - info.fightStart, 1)}
          </>
        ),
      })),
    [info, cancelGaps],
  );

  const tracks: TimelineTrack[] = useMemo(() => {
    if (!info) {
      return [];
    }

    const subline: TimelineTrack = isHealer
      ? {
          height: 10,
          zIndex: -1,
          element: nonHealingUptimeHistory ? (
            <>
              <SegmentTimeline
                bgColor="#1a1a1a"
                fgColor={PerfectColor}
                segments={nonHealingUptimeHistory.map((segment) => ({
                  ...segment,
                  tooltip: 'Non-Healing uptime',
                }))}
                info={info}
                segmentProps={{ opacity: 0.9 }}
              />
              {cancelGapsWithTooltips && (
                <SegmentTimeline
                  fgColor={BadColor}
                  segments={cancelGapsWithTooltips}
                  info={info}
                  segmentProps={{ opacity: 0.9 }}
                />
              )}
            </>
          ) : null,
        }
      : {
          height: 10,
          zIndex: -1,
          // this stacks the melee uptime segment timelines on top of each other.
          element: (
            <>
              {meleeGapsWithTooltips && (
                <SegmentTimeline
                  bgColor="#1a1a1a"
                  fgColor={BadColor}
                  segments={meleeGapsWithTooltips}
                  info={info}
                  segmentProps={{
                    opacity: 0.9,
                  }}
                />
              )}
              {cancelGapsWithTooltips && (
                <SegmentTimeline
                  bgColor="#1a1a1a"
                  fgColor={BadColor}
                  segments={cancelGapsWithTooltips}
                  info={info}
                  segmentProps={{ opacity: 0.9 }}
                />
              )}
              {globalMeleeGaps && (
                <SegmentTimeline
                  fgColor={OkColor}
                  segments={globalMeleeGaps.map((segment) => ({
                    ...segment,
                    tooltip:
                      'All melee had downtime here, which may mean that no enemies were attackable.',
                  }))}
                  info={info}
                />
              )}
            </>
          ),
        };

    const base = [
      // reserve space for boss abilities overlay
      {
        height: 24,
        element: null,
        hidden() {
          return (boss?.fight.timeline?.abilities?.length ?? 0) === 0;
        },
      },
      {
        height: 16,
        element: (
          <SegmentTimeline
            fgColor="purple"
            fgStroke="black"
            segments={debuffSegments ?? []}
            info={info}
            segmentProps={{ height: 12, y: 4 }}
            disableMerging
          />
        ),
        hidden() {
          return (boss?.fight.timeline?.debuffs?.length ?? 0) === 0;
        },
      },
      {
        height: 25,
        element: (
          <SegmentTimeline
            fgColor="#222"
            bgColor={BadColor}
            segments={uptimeHistory}
            info={info}
            containerProps={{
              style: {
                filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25))',
              },
            }}
          />
        ),
      },
      subline,
      {
        height: 2,
        element: null,
        hidden: whenSecondWidthLT(info.fightStart, MIN_ABILITY_TIMELINE_SECOND_WIDTH),
      },
      {
        height: 18,
        element: <PlayerAbilityTimeline info={info} />,
        hidden: whenSecondWidthLT(info.fightStart, MIN_ABILITY_TIMELINE_SECOND_WIDTH),
      },
    ];

    return base;
  }, [
    info,
    isHealer,
    nonHealingUptimeHistory,
    cancelGapsWithTooltips,
    meleeGapsWithTooltips,
    globalMeleeGaps,
    debuffSegments,
    uptimeHistory,
    boss?.fight.timeline?.abilities?.length,
    boss?.fight.timeline?.debuffs?.length,
  ]);

  if (!info) {
    return null;
  }

  return (
    <TimelineDiagram
      info={info}
      overlays={[<BossAbilityOverlay info={info} key="boss-abilities" />]}
    >
      {tracks}
    </TimelineDiagram>
  );
}

// how wide a second needs to be (in pixels) before the player ability timeline is shown. at sizes smaller than this, the icons start to overlap.
const MIN_ABILITY_TIMELINE_SECOND_WIDTH = 18;

/**
 * Check how wide a second is (in pixels) according to the `x` position helper from the `TimelineDiagram`.
 *
 * This requires the `fightStart` to be specified to make sure weirdness doesn't happen due to large negative
 * numbers being produced by `x`. It is calculated by the difference in position from 1 second after the
 * start time and the start time itself.
 */
const whenSecondWidthLT =
  (fightStart: number, minSecondWidthPx: number): ((x: (timestamp: number) => number) => boolean) =>
  (x) =>
    x(fightStart + 1000) - x(fightStart) < minSecondWidthPx;

const PlayerAbilityTimeline = React.memo(({ info }: { info: Info }) => {
  const playerTimeline = usePlayerGcdSegments();
  const { width } = useTimelinePosition();

  const segments = useMemo(
    () =>
      playerTimeline.map((segment) => ({
        ...segment,
        color: segment.channel ? 'hsl(44 60% 60%)' : '#666',
        tooltip: `${segment.channel ? 'Cast' : 'GCD'} from ${formatDuration(segment.start - info.fightStart, 1)} to ${formatDuration(segment.end - info.fightStart, 1)}`,
      })),
    [playerTimeline, info.fightStart],
  );

  if (width(info.fightStart, info.fightStart + 1000) < 16) {
    return null;
  }

  return (
    <SegmentTimeline
      segments={segments}
      fgColor="#666"
      info={info}
      disableMerging
      segmentProps={{ height: '60%', y: '20%' }}
    />
  );
});

function BossAbilityOverlay({ info }: { info?: Info }) {
  const { fight } = useFight();
  const boss = findByBossId(fight.boss);
  const bossAbilities = useBossAbilities(
    info?.reportCode,
    info?.fightStart,
    info?.fightEnd,
    boss?.fight.timeline?.abilities ?? [],
  );

  const { x } = useTimelinePosition();

  return (
    <svg width="100%" height="75px">
      {bossAbilities?.map((castEvent, i) => (
        <g key={i}>
          <line
            x1={x(castEvent.timestamp)}
            x2={x(castEvent.timestamp)}
            y1={1}
            y2="100%"
            stroke="#999"
          />
          <TimelineAbility
            x={x(castEvent.timestamp) - 1}
            y={0}
            size={18}
            spell={castEvent.ability.guid}
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * Estimate global melee uptime, i.e. the ability of a melee player to hit *something* at each point in time. While `MeleeUptimeAnalyzer` does this in detail for a player, this takes a large-scale view and tries to identify large downtime spans (like transition phases) rather than individual gaps in melee hits per player.
 *
 * This is not an analyzer because it operates on separately-loaded event data.
 */
function estimateGlobalMeleeUptime(
  startTime: number,
  endTime: number,
  meleeEvents: CastEvent[],
): Uptime[] {
  const gaps: Uptime[] = [];
  let lastMeleeTimestamp = startTime;
  for (const event of meleeEvents) {
    if (event.timestamp - lastMeleeTimestamp >= MIN_GLOBAL_GAP) {
      gaps.push({
        start: lastMeleeTimestamp,
        end: event.timestamp,
      });
    }
    lastMeleeTimestamp = event.timestamp;
  }

  if (endTime - lastMeleeTimestamp >= MIN_GLOBAL_GAP) {
    gaps.push({
      start: lastMeleeTimestamp,
      end: endTime,
    });
  }
  return gaps;
}

const MIN_GLOBAL_GAP = 3000;

export function useBossAbilities(
  reportCode: string | undefined,
  startTime: number | undefined,
  endTime: number | undefined,
  abilities: EncounterTimelineAbility[],
): CastEvent[] | undefined {
  const filter = useMemo(() => {
    const byType = abilities.reduce((byType: Record<string, number[]>, def) => {
      if (def.bossOnly) {
        return byType; // don't handle boss-only mechanics here
      }
      if (!byType[def.type]) {
        byType[def.type] = [];
      }
      byType[def.type].push(def.id);
      return byType;
    }, {});

    const bossOnly = abilities
      .filter((def) => def.bossOnly)
      .map((def) => `(type='${def.type}' and ability.id = ${def.id} and source.role = 'Boss')`)
      .join(' and ');

    const anyNpc = Object.entries(byType)
      .map(([type, abilities]) => `(type='${type}' and ability.id in (${abilities.join(',')}))`)
      .join(' or ');

    const bossSuffix = bossOnly ? `or ${bossOnly}` : '';

    return `${anyNpc} ${bossSuffix}`;
  }, [abilities]);
  const events = useReportEvents(reportCode, startTime, endTime, filter) as CastEvent[] | undefined;

  // remove adjacent duplicates. this comes up on a few classic bosses
  return events?.filter(
    (event, index, list) =>
      event.ability?.guid !== list[index - 1]?.ability?.guid ||
      event.type !== list[index - 1]?.type ||
      event.timestamp > (list[index - 1]?.timestamp ?? 0) + BOSS_ABILITY_MIN_GAP,
  );
}

const BOSS_ABILITY_MIN_GAP = 500;

function usePlayerGcdSegments() {
  const events = useEvents();

  return useMemo(() => {
    const segments = [];
    for (const event of events) {
      if (event.type === EventType.Cast && (event.globalCooldown || event.channel)) {
        // if we're dealing with a spell cast or channel, there is no gcd for the cast event (only the `begincast`).
        // we also need to handle the cases where the channel may be shorter than the gcd
        const gcd = event.channel
          ? event.channel.beginChannel.globalCooldown
          : event.globalCooldown;
        const start = event.channel ? event.channel.beginChannel.timestamp : event.timestamp;
        let end = start + (gcd?.duration ?? 0);
        let channel = false;
        if (event.channel && event.channel.timestamp > end) {
          end = event.channel.timestamp;
          channel = true;
        }
        segments.push({
          start,
          end,
          abilityId: event.ability.guid,
          channel,
        });
      }
    }
    return segments;
  }, [events]);
}

const GCD = () => (
  <TooltipElement
    content={
      <>
        Most abilities share a <em>Global Cooldown</em> of <strong>1.5s</strong>, reduced by Haste.
        Specs using energy usually have a fixed <strong>1s</strong> GCD instead.
      </>
    }
  >
    GCD
  </TooltipElement>
);
