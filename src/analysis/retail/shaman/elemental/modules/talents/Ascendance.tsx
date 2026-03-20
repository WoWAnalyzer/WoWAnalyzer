import { formatDurationMillisMinSec } from 'common/format';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Analyzer from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  BeginCastEvent,
  BeginChannelEvent,
  CastEvent,
  EndChannelEvent,
  EventType,
  FightEndEvent,
  GlobalCooldownEvent,
  RefreshBuffEvent,
  SpendResourceEvent,
} from 'parser/core/Events';
import {
  evaluateQualitativePerformanceByThreshold,
  getAveragePerf,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import { type JSX } from 'react';
import SpellLink from 'interface/SpellLink';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';
import MaelstromTracker from '../resources/MaelstromTracker';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Spell from 'common/SPELLS/Spell';
import { getGlobalCooldown } from 'analysis/retail/shaman/shared/shared';
import { ON_CAST_BUFF_REMOVAL_GRACE_MS, OVERLOAD_SPELLS } from '../../constants';

interface AscendanceTimeline {
  start: number;
  end?: number | null;
  events: AscendanceTimelineEvent[];
}

type CancelChannelEvent = AnyEvent<EventType.CancelChannel>;

type AscendanceTimelineEvent =
  | BeginCastEvent
  | CastEvent
  | BeginChannelEvent
  | EndChannelEvent
  | CancelChannelEvent;

interface AscendanceCooldownCast {
  event: CastEvent | ApplyBuffEvent | RefreshBuffEvent;
  timeline: AscendanceTimeline;
  endingMaelstrom: number;
  spendersCast: number;
  maelstromSpent: number;
}

interface CastWindowInterval {
  start: number;
  end: number;
  cancelled: boolean;
  triggerEvent: CastEvent | BeginCastEvent | BeginChannelEvent;
}

interface Spender {
  spell: Spell & { maelstromCost: number };
  costReduction: number;
}

const maelstromSpenders: number[] = [
  TALENTS.ELEMENTAL_BLAST_TALENT.id,
  TALENTS.EARTH_SHOCK_TALENT.id,
  TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT.id,
  TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT.id,
];

const overloadCapableSpellIds = new Set(OVERLOAD_SPELLS.map(({ spell }) => spell.id));

class Ascendance extends Analyzer.withDependencies({
  maelstromTracker: MaelstromTracker,
}) {
  protected cooldownWindows: AscendanceCooldownCast[] = [];
  protected currentCooldown: AscendanceCooldownCast | null = null;
  protected globalCooldownEnds = 0;
  protected ascendanceWasCast = false;
  protected spender: Spender = {
    spell: TALENTS.EARTH_SHOCK_TALENT,
    costReduction: this.selectedCombatant.hasTalent(TALENTS.EYE_OF_THE_STORM_TALENT) ? 5 : 0,
  };

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_TALENT)) {
      this.spender.spell = TALENTS.ELEMENTAL_BLAST_TALENT;
      this.spender.costReduction = this.selectedCombatant.hasTalent(TALENTS.EYE_OF_THE_STORM_TALENT)
        ? 10
        : 0;
    }

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.GlobalCooldown, this.onGlobalCooldown);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
      this.onApplyAscendance,
    );
    if (this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT)) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ASCENDANCE_ELEMENTAL_BUFF),
        this.onApplyAscendance,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
        this.onApplyAscendance,
      );
    }
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ASCENDANCE_ELEMENTAL_BUFF),
      this.onAscendanceEnd,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);

    this.addEventListener(Events.any.by(SELECTED_PLAYER), this.onTimelineEvent);
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);
  }

  onGlobalCooldown(event: GlobalCooldownEvent) {
    this.globalCooldownEnds = event.duration + event.timestamp;
  }

  onApplyAscendance(event: CastEvent | ApplyBuffEvent | RefreshBuffEvent) {
    if (event.type === EventType.Cast) {
      this.ascendanceWasCast = true;
    } else if (this.ascendanceWasCast && this.currentCooldown) {
      this.ascendanceWasCast = false;
      return;
    }

    if (!this.currentCooldown) {
      this.currentCooldown = {
        event: event,
        timeline: {
          start: Math.max(event.timestamp, this.globalCooldownEnds),
          events: [],
        },
        endingMaelstrom: this.deps.maelstromTracker.current,
        spendersCast: 0,
        maelstromSpent: 0,
      };
    }
  }

  onAscendanceEnd(event: AnyEvent | FightEndEvent) {
    if (this.currentCooldown) {
      this.currentCooldown.timeline.end = event.timestamp;
      this.cooldownWindows.push(this.currentCooldown);
      this.currentCooldown = null;
    }
  }

  onFightEnd(event: FightEndEvent) {
    this.onAscendanceEnd(event);
  }

  private isTimelineEvent(event: AnyEvent): event is AscendanceTimelineEvent {
    return (
      event.type === EventType.BeginCast ||
      event.type === EventType.Cast ||
      event.type === EventType.BeginChannel ||
      event.type === EventType.EndChannel ||
      event.type === EventType.CancelChannel
    );
  }

  onTimelineEvent(event: AnyEvent) {
    if (!this.currentCooldown || !this.isTimelineEvent(event)) {
      return;
    }

    this.currentCooldown.timeline.events.push(event);
  }

  onSpendResource(event: SpendResourceEvent) {
    if (!this.currentCooldown) {
      return;
    }

    this.currentCooldown.endingMaelstrom = this.deps.maelstromTracker.current;

    if (maelstromSpenders.includes(event.ability.guid)) {
      this.currentCooldown.spendersCast += 1;
      this.currentCooldown.maelstromSpent += event.resourceChange;
    }
  }

  private getGlobalCooldownEnd(event: CastEvent | BeginCastEvent | BeginChannelEvent) {
    const cooldown = getGlobalCooldown(event);
    return cooldown ? cooldown.timestamp + cooldown.duration : event.timestamp;
  }

  private findMatchingChannelInterval(
    intervals: CastWindowInterval[],
    beginChannel: BeginChannelEvent,
  ) {
    return intervals.find(
      (interval) =>
        interval.triggerEvent.type === EventType.BeginChannel &&
        interval.triggerEvent === beginChannel,
    );
  }

  private findMatchingIntervalForBeginChannel(
    intervals: CastWindowInterval[],
    beginChannel: BeginChannelEvent,
  ) {
    if (beginChannel.trigger?.type === EventType.BeginCast) {
      return intervals.find(
        (interval) =>
          (interval.triggerEvent.type === EventType.BeginChannel &&
            interval.triggerEvent === beginChannel) ||
          (interval.triggerEvent.type === EventType.BeginCast &&
            interval.triggerEvent === beginChannel.trigger),
      );
    }

    return this.findMatchingChannelInterval(intervals, beginChannel);
  }

  private findMatchingBeginCastInterval(intervals: CastWindowInterval[], castEvent: CastEvent) {
    return intervals.find(
      (interval) =>
        interval.triggerEvent.type === EventType.BeginCast &&
        interval.triggerEvent.castEvent === castEvent,
    );
  }

  private getCancelledChannelTarget(event: CancelChannelEvent): BeginChannelEvent | undefined {
    const cancelEvent = event as CancelChannelEvent & {
      beginChannel?: BeginChannelEvent;
      trigger?: AnyEvent;
    };

    if (cancelEvent.beginChannel) {
      return cancelEvent.beginChannel;
    }

    if (cancelEvent.trigger?.type === EventType.BeginChannel) {
      return cancelEvent.trigger;
    }

    return undefined;
  }

  private buildCastIntervals(cast: AscendanceCooldownCast): CastWindowInterval[] {
    const intervals: CastWindowInterval[] = [];

    for (const event of cast.timeline.events) {
      if (event.type === EventType.BeginCast) {
        intervals.push({
          start: event.timestamp,
          end: this.getGlobalCooldownEnd(event),
          cancelled: event.isCancelled,
          triggerEvent: event,
        });
        continue;
      }

      if (event.type === EventType.Cast) {
        const beginCastInterval = this.findMatchingBeginCastInterval(intervals, event);
        if (beginCastInterval) {
          beginCastInterval.end = Math.max(beginCastInterval.end, this.getGlobalCooldownEnd(event));
          beginCastInterval.cancelled = beginCastInterval.cancelled || false;
          continue;
        }

        intervals.push({
          start: event.timestamp,
          end: this.getGlobalCooldownEnd(event),
          cancelled: false,
          triggerEvent: event,
        });
        continue;
      }

      if (event.type === EventType.BeginChannel) {
        const existingInterval = this.findMatchingIntervalForBeginChannel(intervals, event);
        if (existingInterval) {
          existingInterval.end = Math.max(existingInterval.end, this.getGlobalCooldownEnd(event));
          existingInterval.cancelled = existingInterval.cancelled || event.isCancelled;
          continue;
        }

        intervals.push({
          start: event.timestamp,
          end: this.getGlobalCooldownEnd(event),
          cancelled: event.isCancelled,
          triggerEvent: event,
        });
        continue;
      }

      if (event.type === EventType.EndChannel) {
        const interval = this.findMatchingIntervalForBeginChannel(intervals, event.beginChannel);
        if (interval) {
          interval.end = Math.max(interval.end, event.timestamp);
          interval.cancelled = interval.cancelled || event.beginChannel.isCancelled;
        }
        continue;
      }

      if (event.type === EventType.CancelChannel) {
        const beginChannel = this.getCancelledChannelTarget(event);
        if (!beginChannel) {
          continue;
        }

        const interval = this.findMatchingIntervalForBeginChannel(intervals, beginChannel);
        if (interval) {
          interval.end = Math.max(interval.end, event.timestamp);
          interval.cancelled = true;
        }
      }
    }

    return intervals.sort((left, right) => left.start - right.start);
  }

  private getDowntime(cast: AscendanceCooldownCast) {
    const windowEnd = cast.timeline.end ?? cast.event.timestamp;
    const intervals = this.buildCastIntervals(cast);

    if (windowEnd <= cast.timeline.start) {
      return 0;
    }

    if (intervals.length === 0) {
      return windowEnd - cast.timeline.start;
    }

    let downtime = 0;
    let cursor = cast.timeline.start;

    for (const interval of intervals) {
      const start = Math.max(interval.start, cast.timeline.start);
      const end = Math.min(interval.end, windowEnd);

      if (start > cursor) {
        downtime += start - cursor;
      }

      cursor = Math.max(cursor, end);
    }

    if (windowEnd > cursor) {
      downtime += windowEnd - cursor;
    }

    return downtime;
  }

  private getTrailingAvailableTime(cast: AscendanceCooldownCast) {
    return Math.max(
      (cast.timeline.end ?? cast.event.timestamp) -
        this.buildCastIntervals(cast).reduce(
          (currentMax, interval) => Math.max(currentMax, interval.end),
          cast.timeline.start,
        ),
      0,
    );
  }

  private getAverageGlobalCooldown(cast: AscendanceCooldownCast) {
    const gcdDurations = this.buildCastIntervals(cast)
      .map((interval) => getGlobalCooldown(interval.triggerEvent))
      .filter((event): event is GlobalCooldownEvent => event !== undefined)
      .map((event) => event.duration);

    if (gcdDurations.length === 0) {
      return 1500;
    }

    return gcdDurations.reduce((total, duration) => total + duration, 0) / gcdDurations.length;
  }

  private getSpenderPerformance(cast: AscendanceCooldownCast): PerCastStat {
    return {
      value: `${cast.spendersCast}`,
      label: 'Spenders',
      performance: evaluateQualitativePerformanceByThreshold({
        actual: cast.spendersCast,
        isGreaterThanOrEqual: {
          perfect: 2,
          ok: 1,
        },
      }),
    };
  }

  private getDowntimePerformance(cast: AscendanceCooldownCast): PerCastStat {
    const downtime = this.getDowntime(cast);

    return {
      value: formatDurationMillisMinSec(downtime, 1),
      label: 'Downtime',
      performance: evaluateQualitativePerformanceByThreshold({
        actual: downtime,
        isLessThan: {
          perfect: 500,
          good: 1250,
          ok: 2000,
        },
      }),
    };
  }

  private getNonOverloadCapableSpellCount(cast: AscendanceCooldownCast) {
    return this.buildCastIntervals(cast).filter((interval) => {
      const event = interval.triggerEvent;

      return (
        event.sourceID === this.selectedCombatant.id &&
        getGlobalCooldown(event) !== undefined &&
        !(
          event.ability.guid === TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id &&
          event.timestamp === cast.timeline.start
        ) &&
        !overloadCapableSpellIds.has(event.ability.guid)
      );
    }).length;
  }

  private getNonOverloadCapableSpellBreakdown(cast: AscendanceCooldownCast) {
    const spellCounts = new Map<number, { name: string; count: number }>();

    this.buildCastIntervals(cast).forEach((interval) => {
      const event = interval.triggerEvent;
      if (
        event.sourceID !== this.selectedCombatant.id ||
        getGlobalCooldown(event) === undefined ||
        (event.ability.guid === TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id &&
          event.timestamp === cast.timeline.start) ||
        overloadCapableSpellIds.has(event.ability.guid)
      ) {
        return;
      }

      const existing = spellCounts.get(event.ability.guid);
      if (existing) {
        existing.count += 1;
        return;
      }

      spellCounts.set(event.ability.guid, {
        name: event.ability.name,
        count: 1,
      });
    });

    return Array.from(spellCounts.entries())
      .map(([spellId, spellData]) => ({ spellId, ...spellData }))
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
  }

  private getNonOverloadPerformance(cast: AscendanceCooldownCast): PerCastStat {
    const nonOverloadSpellCount = this.getNonOverloadCapableSpellCount(cast);
    const nonOverloadSpellBreakdown = this.getNonOverloadCapableSpellBreakdown(cast);

    return {
      value: `${nonOverloadSpellCount}`,
      label: 'Non-Overload Spells',
      tooltip: (
        <>
          Spells cast that cannot trigger <SpellLink spell={SPELLS.ELEMENTAL_MASTERY} />:
          {nonOverloadSpellBreakdown.length > 0 ? (
            <ul>
              {nonOverloadSpellBreakdown.map((spell) => (
                <li key={spell.spellId}>
                  <SpellLink spell={spell.spellId} />: {spell.count}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ),
      performance: evaluateQualitativePerformanceByThreshold({
        actual: nonOverloadSpellCount,
        isLessThanOrEqual: {
          perfect: 0,
          good: 1,
          ok: 2,
        },
      }),
    };
  }

  private buildSpellSequence(cast: AscendanceCooldownCast): CastInSequence[] {
    return this.buildCastIntervals(cast)
      .filter((interval) => interval.triggerEvent.sourceID === this.selectedCombatant.id)
      .map((interval) => {
        const event = interval.triggerEvent;
        const ability = event.ability;
        const isCancelled =
          (event.type === EventType.BeginChannel || event.type === EventType.BeginCast) &&
          (interval.cancelled || event.isCancelled);
        const verb =
          event.type === EventType.BeginChannel || event.type === EventType.BeginCast
            ? 'Started'
            : 'Cast';

        return {
          timestamp: event.timestamp,
          spellId: ability.guid,
          spellName: ability.name,
          icon: ability.abilityIcon.replace('.jpg', ''),
          performance: isCancelled ? QualitativePerformance.Fail : undefined,
          tooltip: (
            <>
              <strong>
                {event.type === EventType.BeginChannel || event.type === EventType.BeginCast
                  ? 'Started'
                  : 'Cast'}
              </strong>{' '}
              <SpellLink spell={ability.guid} />
              <div>@ {this.owner.formatTimestamp(event.timestamp)}</div>
              {isCancelled ? <div>Cast never finished.</div> : null}
            </>
          ),
        };
      });
  }

  get spenderCost() {
    return this.spender.spell.maelstromCost - this.spender.costReduction;
  }

  private isValidSpenderReplacement(event: CastEvent | BeginCastEvent | BeginChannelEvent) {
    return (
      event.ability.guid === SPELLS.TEMPEST_CAST.id ||
      (event.ability.guid === SPELLS.LIGHTNING_BOLT.id &&
        this.selectedCombatant.hasBuff(
          SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
          event.timestamp,
          ON_CAST_BUFF_REMOVAL_GRACE_MS,
        ))
    );
  }

  private getMissedSpendersPerformance(cast: AscendanceCooldownCast): PerCastStat {
    const possibleAdditionalSpenders = Math.min(
      Math.floor(cast.endingMaelstrom / this.spenderCost),
      Math.floor(this.getTrailingAvailableTime(cast) / this.getAverageGlobalCooldown(cast)),
    );
    const validReplacementCasts = this.buildCastIntervals(cast).filter(
      (interval) =>
        interval.triggerEvent.sourceID === this.selectedCombatant.id &&
        !interval.cancelled &&
        this.isValidSpenderReplacement(interval.triggerEvent),
    ).length;
    const missedSpenders = Math.max(possibleAdditionalSpenders - validReplacementCasts, 0);

    return {
      value: `${missedSpenders}`,
      label: 'Missed Spenders',
      tooltip: (
        <>
          Additional <SpellLink spell={this.spender.spell} /> casts that could have fit into the
          window.
        </>
      ),
      performance: evaluateQualitativePerformanceByThreshold({
        actual: missedSpenders,
        isLessThanOrEqual: {
          perfect: 1,
          ok: 2,
        },
      }),
    };
  }

  private buildPerCastData(): PerCastData[] {
    return this.cooldownWindows.map((cast) => {
      const sequence = this.buildSpellSequence(cast);
      const spendersStat = this.getSpenderPerformance(cast);
      const downtimeStat = this.getDowntimePerformance(cast);
      const nonOverloadStat = this.getNonOverloadPerformance(cast);
      const extraSpendersStat = this.getMissedSpendersPerformance(cast);
      const scoredStats = [spendersStat, downtimeStat, nonOverloadStat, extraSpendersStat];

      return {
        performance: getAveragePerf(
          scoredStats.flatMap((stat) => (stat.performance === undefined ? [] : [stat.performance])),
        ),
        timestamp: this.owner.formatTimestamp(cast.event.timestamp),
        stats: [
          ...scoredStats,
          {
            value: `${cast.endingMaelstrom}`,
            label: 'Ending Maelstrom',
            performance: extraSpendersStat.performance,
          },
        ],
        details: null,
        additionalContent:
          sequence.length > 0
            ? {
                title: 'Cast Sequence',
                content: <SpellSequence casts={sequence} iconSize={36} />,
              }
            : undefined,
      };
    });
  }

  get guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <>
        <ol>
          <li>
            <strong>Uptime</strong>: You want to maximize the number of casts inside each{' '}
            <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} /> window. Pairing it with{' '}
            <SpellLink spell={TALENTS.SPIRITWALKERS_GRACE_TALENT} /> can help preserve uptime while
            moving.
          </li>
          <li>
            Try to avoid spending globals on spells that do not contribute much during{' '}
            <SpellLink spell={SPELLS.ELEMENTAL_MASTERY} />, such as{' '}
            <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} /> or{' '}
            <SpellLink spell={SPELLS.FLAME_SHOCK} /> refreshes.
          </li>
          <li>
            If possible, cast <SpellLink spell={TALENTS.STORMKEEPER_TALENT} /> before{' '}
            <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} /> so the window is not spent on
            setup.
          </li>
        </ol>
      </>
    );

    return (
      <GuideSection
        spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT}
        explanation={explanation}
        explanationPercent={30}
      >
        <CastDetail title="Ascendance Windows" casts={this.buildPerCastData()} />
      </GuideSection>
    );
  }
}

export default Ascendance;
