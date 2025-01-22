import { Uptime } from 'parser/ui/UptimeBar';
import { BadColor, OkColor, Section, SubSection, useAnalyzer, useEvents, useInfo } from '../index';
import { FoundationHighlight as HL } from './shared';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import {
  AnyEvent,
  ApplyDebuffEvent,
  CastEvent,
  EventType,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { useEffect, useMemo, useState } from 'react';
import { fetchEvents } from 'common/fetchWclApi';
import { MeleeUptimeAnalyzer } from './analyzers/MeleeUptimeAnalyzer';
import SpellIcon from 'interface/SpellIcon';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import TimelineDiagram, {
  TimelineTrack,
  useTimelinePosition,
} from 'interface/timeline-diagram/TimelineDiagram';
import { Info } from 'parser/core/metric';
import Spell from 'common/SPELLS/Spell';
import Tooltip, { TooltipElement } from 'interface/Tooltip';
import PerformanceStrong from 'interface/PerformanceStrong';
import SuggestionBox from 'interface/suggestion-box/SuggestionBox';
import { ByRole, Role } from './ByRole';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { useFight } from 'interface/report/context/FightContext';
import { useResults } from 'interface/report/Results/ResultsContext';
import { useConfig } from 'interface/report/ConfigContext';
import { EncounterTimelineAbility, findByBossId } from 'game/raids';
import ExplanationRow from '../components/ExplanationRow';
import Para from '../Para';
import { InfoIcon } from 'interface/icons';
import styled from '@emotion/styled';
import Suggestion from 'interface/report/Results/Suggestion';
import Suggestions from '../components/Suggestions/Suggestions';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

export default function FoundationDowntimeSectionV2(): JSX.Element | null {
  const info = useInfo();
  const abc = useAnalyzer(AlwaysBeCasting);
  const melee = useAnalyzer(MeleeUptimeAnalyzer);

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

  if (!info || !abc) {
    return null;
  }

  const uptimeHistory = abc.activeTimeSegments;

  // intentionally not including the "hide explanation" options for right now

  return (
    <Section title="Always Be Casting (v2)">
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
            {melee && (
              <>
                <dt>
                  <PerformanceStrong performance={melee.meleeUptimePerformance}>
                    {formatPercentage(melee.meleeUptimePercentage, 1)}%
                  </PerformanceStrong>{' '}
                </dt>
                <dd>
                  <TooltipElement content="The percentage of time that your basic melee swings were active, excluding time spent casting.">
                    Melee Uptime
                  </TooltipElement>
                </dd>
              </>
            )}
          </UptimeStatistics>
        </div>
        <div>
          <Para>
            The foundation of good play in <em>WoW</em> is having good <HL>uptime.</HL>{' '}
            <ByRole>
              <Role.Melee>
                There should be no gaps between the end of one <GCD /> and the start of the next.
              </Role.Melee>
              <Role.Caster>
                There should be no gaps between the end of one spell cast and the start of the next.
              </Role.Caster>
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
          meleeGaps={melee?.meleeUptimeGaps}
          globalMeleeGaps={globalMeleeUptime}
        />
      </SubSection>
      <SubSection>
        <ul className="list issues">
          <SmallGapsSuggestion />
        </ul>
      </SubSection>
    </Section>
  );
}

interface Props {
  uptimeHistory: Segment[];
  meleeGaps?: Array<Segment>;
  globalMeleeGaps?: Array<Segment>;
}

interface Segment {
  start: number;
  end: number;
}

interface DisplaySegment extends Segment {
  /**
   * If set, show an ability icon at the start of the segment.
   */
  abilityId?: number;
  /**
   * If set, override the segment default foreground color.
   */
  color?: string;
  /**
   * If set, show this as the tooltip on hovering the segment.
   */
  tooltip?: React.ReactNode;
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
  meleeGaps,
  globalMeleeGaps,
}: Props): JSX.Element | null {
  const info = useInfo();
  const { fight } = useFight();

  const boss = findByBossId(fight.boss);
  const debuffSegments = useBossDebuffs(info?.playerId, boss?.fight.timeline?.debuffs ?? []);

  const tracks: TimelineTrack[] = useMemo(() => {
    if (!info) {
      return [];
    }

    return [
      // reserve space for boss abilities overlay
      {
        height: 24,
        element: null,
      },
      {
        height: 16,
        element: (
          <SegmentTimeline
            fgColor="purple"
            fgStroke="black"
            segments={debuffSegments}
            info={info}
            segmentProps={{ height: 12, y: 4 }}
            disableMerging
          />
        ),
      },
      {
        height: 25,
        element: (
          <SegmentTimeline fgColor="#222" bgColor={BadColor} segments={uptimeHistory} info={info} />
        ),
      },
      // this stacks the melee uptime segment timelines on top of each other.
      {
        height: 10,
        element: (
          <>
            {meleeGaps && (
              <SegmentTimeline
                bgColor="#1a1a1a"
                fgColor={BadColor}
                segments={meleeGaps}
                info={info}
                segmentProps={{
                  opacity: 0.9,
                }}
              />
            )}
            {globalMeleeGaps && (
              <SegmentTimeline
                fgColor={OkColor}
                segments={globalMeleeGaps.map((segment) => ({
                  ...segment,
                  tooltip: 'All melee had downtime here',
                }))}
                info={info}
              />
            )}
          </>
        ),
      },
      {
        height: 16,
        element: <PlayerAbilityTimeline info={info} />,
        hidden(x) {
          return x(info.fightStart + 1000) - x(info.fightStart) < 16;
        },
      },
    ];
  }, [debuffSegments, uptimeHistory, info, meleeGaps, globalMeleeGaps]);

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

function PlayerAbilityTimeline({ info }: { info: Info }) {
  const playerTimeline = usePlayerGcdSegments();
  const { width } = useTimelinePosition();

  const segments = useMemo(
    () =>
      playerTimeline.map((segment) => ({ ...segment, color: segment.channel ? 'yellow' : '#666' })),
    [playerTimeline],
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
}

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

interface SegmentTimelineProps {
  bgColor?: string;
  fgColor: string;
  fgStroke?: string;
  segments: DisplaySegment[];
  info: Info;
  segmentProps?: React.ComponentProps<'rect'>;
  disableMerging?: boolean;
}

function SegmentTimeline({
  bgColor,
  fgColor,
  segments,
  info,
  fgStroke,
  segmentProps,
  disableMerging,
}: SegmentTimelineProps): JSX.Element {
  const { x, width } = useTimelinePosition();
  // merge segments that would have sub-pixel gaps between them to avoid render artifacts
  const mergedSegments = useMemo(() => {
    if (disableMerging) {
      return segments;
    }
    const result = [];
    let currentSegment = undefined;
    for (const segment of segments) {
      if (!currentSegment) {
        currentSegment = { ...segment };
        continue;
      }

      if (
        width(currentSegment.end, segment.start) < 1 ||
        segment.start - currentSegment.end < 100
      ) {
        currentSegment.end = segment.end;
      } else {
        result.push(currentSegment);
        currentSegment = { ...segment };
      }
    }

    if (currentSegment) {
      result.push(currentSegment);
    }
    return result;
  }, [segments, width, disableMerging]);

  return (
    <>
      {bgColor && <rect x={0} y={0} height="100%" width="100%" fill={bgColor} />}
      <g>
        {mergedSegments.map((segment, i) => (
          <g key={i}>
            <rect
              x={x(segment.start)}
              width={width(segment.start, segment.end)}
              y={0}
              height="100%"
              fill={segment.color ?? fgColor}
              stroke={fgStroke}
              {...segmentProps}
            >
              <title>
                {formatDuration(segment.start - info.fightStart, 3)} -{' '}
                {formatDuration(segment.end - info.fightStart, 3)}
              </title>
            </rect>
            {segment.tooltip && (
              <foreignObject
                x={x(segment.start)}
                width={width(segment.start, segment.end)}
                y={0}
                height="100%"
              >
                <Tooltip content={segment.tooltip}>
                  <div style={{ width: '100%', height: '100%' }} />
                </Tooltip>
              </foreignObject>
            )}
            {segment.abilityId && (
              <TimelineAbility y={0} x={x(segment.start)} size={16} spell={segment.abilityId} />
            )}
          </g>
        ))}
      </g>
    </>
  );
}

function TimelineAbility({
  x,
  y,
  spell,
  size,
}: {
  x: number;
  y: number;
  size: number;
  spell: number | Spell;
}): JSX.Element | null {
  return (
    <foreignObject x={x} y={y} width={1} height={1} style={{ overflow: 'visible' }}>
      <div style={{ lineHeight: `${size}px` }}>
        <SpellIcon
          spell={spell}
          style={{ border: '1px solid #555', borderRadius: 'unset', width: size, height: size }}
        />
      </div>
    </foreignObject>
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

function useReportEvents(
  reportCode: string | undefined,
  startTime: number | undefined,
  endTime: number | undefined,
  filter: string,
): AnyEvent[] | undefined {
  const [data, setData] = useState<AnyEvent[] | undefined>();

  useEffect(() => {
    if (!reportCode || !startTime || !endTime) {
      return;
    }
    if (filter.length === 0) {
      console.error('attempted useReportEvents with no filter');
      return;
    }
    let cancelled = false;

    const run = async () => {
      const events = await fetchEvents(reportCode, startTime, endTime, undefined, filter);

      if (!cancelled) {
        setData(events);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [reportCode, startTime, endTime, filter]);

  return data;
}

function useBossAbilities(
  reportCode: string | undefined,
  startTime: number | undefined,
  endTime: number | undefined,
  abilities: EncounterTimelineAbility[],
): CastEvent[] | undefined {
  const filter = useMemo(() => {
    const casts = abilities
      .filter((def) => def.type === 'cast' && !def.bossOnly)
      .map((def) => def.id)
      .join(',');
    const begins = abilities
      .filter((def) => def.type === 'begincast' && !def.bossOnly)
      .map((def) => def.id)
      .join(',');

    const bossOnly = abilities
      .filter((def) => def.bossOnly)
      .map((def) => `(type='${def.type}' and ability.id = ${def.id} and source.role = 'Boss')`)
      .join(' and ');

    const bossSuffix = bossOnly ? ' or ' + bossOnly : '';

    return `(type='cast' and ability.id in (${casts})) or (type='begincast' and ability.id in (${begins})) ${bossSuffix}`;
  }, [abilities]);
  return useReportEvents(reportCode, startTime, endTime, filter) as CastEvent[] | undefined;
}

function useBossDebuffs(playerId: number | undefined, debuffs: { id: number }[]) {
  const info = useInfo();
  const allEvents = useEvents();
  const debuffEvents = useMemo(() => {
    const debuffIds = debuffs.map((entry) => entry.id);
    return allEvents.filter((event): event is ApplyDebuffEvent | RemoveDebuffEvent => {
      return (
        (event.type === EventType.ApplyDebuff || event.type === EventType.RemoveDebuff) &&
        event.targetID === playerId &&
        debuffIds.includes(event.ability.guid)
      );
    });
  }, [allEvents, debuffs, playerId]);

  const debuffSegments = useMemo(() => {
    const pendingDebuffs: Map<number, number> = new Map();
    const result = [];
    for (const event of debuffEvents) {
      if (event.type === EventType.ApplyDebuff) {
        pendingDebuffs.set(event.ability.guid, event.timestamp);
      } else if (event.type === EventType.RemoveDebuff) {
        const startTime = pendingDebuffs.get(event.ability.guid) ?? info?.fightStart ?? 0;
        pendingDebuffs.delete(event.ability.guid);
        result.push({
          start: startTime,
          end: event.timestamp,
          abilityId: event.ability.guid,
        });
      }
    }

    // deal with any that didn't expire before fight end
    if (info) {
      for (const [abilityId, startTime] of pendingDebuffs) {
        result.push({
          start: startTime,
          end: info.fightEnd,
          abilityId,
        });
      }
    }

    return result.filter((segment) => segment.end - segment.start >= 4000);
  }, [debuffEvents, info]);

  return debuffSegments;
}

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

function SmallGapsSuggestion(): JSX.Element | null {
  const abc = useAnalyzer(AlwaysBeCasting);
  const threshold = useMemo(() => abc?.smallGapsSuggestionThreshold, [abc]);
  if (!threshold || !threshold.isGreaterThan || typeof threshold.isGreaterThan !== 'object') {
    return null;
  }

  if (threshold.actual <= (threshold.isGreaterThan.minor ?? 0)) {
    return null;
  }

  const importance =
    threshold.actual <= (threshold.isGreaterThan.major ?? 0)
      ? ISSUE_IMPORTANCE.REGULAR
      : ISSUE_IMPORTANCE.MAJOR;

  return (
    <Suggestion
      icon="inv_misc_key_12"
      importance={importance}
      stat={
        <>
          {formatNumber(threshold.actual)} small gaps per minute (&lt;{' '}
          {threshold.isGreaterThan.minor} is recommended)
        </>
      }
    >
      You have a large number of small gaps between your abilities. Make sure to{' '}
      <TooltipElement
        content={
          <>
            <p>
              WoW has a <em>spell queue</em> system built-in. If you push an ability during the{' '}
              <em>queue window</em>, it will immediately begin casting when your current ability
              finishes&mdash;faster than you could cast it yourself because of network latency.
            </p>
            <p>
              The default queue window begins <strong>400ms</strong> before your next ability could
              be used and should generally not be changed.
            </p>
          </>
        }
      >
        queue
      </TooltipElement>{' '}
      up your next ability while your current one finishes.
    </Suggestion>
  );
}
