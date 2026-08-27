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
  EventType,
  FightEndEvent,
  GetRelatedEvents,
  GlobalCooldownEvent,
  ResourceChangeEvent,
  RefreshBuffEvent,
  SpendResourceEvent,
  DamageEvent,
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
import MaelstromSpenderInfo, { type Spender } from '../core/MaelstromSpenderInfo';
import MaelstromTracker from '../resources/MaelstromTracker';
import ResourceLink from 'interface/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { getGlobalCooldown } from 'analysis/retail/shaman/shared/shared';
import { EVENT_LINKS, OVERLOAD_SPELLS } from '../../constants';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import EventHistory from 'parser/shared/modules/EventHistory';
import { plural } from '@lingui/core/macro';

interface AscendanceCooldownCast {
  event: CastEvent | ApplyBuffEvent | RefreshBuffEvent;
  start: number;
  end: number | null;
  startingMaelstrom: number;
  endingMaelstrom: number;
  spendersCast: number;
  maelstromSpent: number;
  resourceChanges: ResourceChangeEvent[];
}

const overloadCapableSpellIds = new Set(OVERLOAD_SPELLS.map(({ spell }) => spell.id));

const PURGING_FLAMES_TARGET_THRESHOLD = 2;

class Ascendance extends Analyzer.withDependencies({
  maelstromTracker: MaelstromTracker,
  spenderInfo: MaelstromSpenderInfo,
  alwaysBeCasting: AlwaysBeCasting,
  eventHistory: EventHistory,
}) {
  protected cooldownWindows: AscendanceCooldownCast[] = [];
  protected currentCooldown: AscendanceCooldownCast | null = null;
  protected globalCooldownEnds = 0;
  protected ascendanceWasCast = false;
  protected hasPurgingFlames = false;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);

    if (!this.active) {
      return;
    }

    this.hasPurgingFlames = this.selectedCombatant.hasTalent(TALENTS.PURGING_FLAMES_TALENT);

    this.addEventListener(Events.GlobalCooldown, this.onGlobalCooldown);
    this.addEventListener(Events.resourcechange.to(SELECTED_PLAYER), this.onResourceChange);
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
        start: Math.max(event.timestamp, this.globalCooldownEnds, this.owner.fight.start_time),
        end: null,
        startingMaelstrom: this.deps.maelstromTracker.current,
        endingMaelstrom: this.deps.maelstromTracker.current,
        spendersCast: 0,
        maelstromSpent: 0,
        resourceChanges: [],
      };
    }
  }

  onAscendanceEnd(event: AnyEvent | FightEndEvent) {
    if (this.currentCooldown) {
      this.currentCooldown.end = event.timestamp;
      this.currentCooldown.endingMaelstrom = this.deps.maelstromTracker.current;
      this.cooldownWindows.push(this.currentCooldown);
      this.currentCooldown = null;
    }
  }

  onFightEnd(event: FightEndEvent) {
    this.onAscendanceEnd(event);
  }

  onSpendResource(event: SpendResourceEvent) {
    if (!this.currentCooldown) {
      return;
    }

    this.currentCooldown.endingMaelstrom = this.deps.maelstromTracker.current;

    if (this.deps.spenderInfo.isMaelstromSpender(event.ability.guid)) {
      this.currentCooldown.spendersCast += 1;
      this.currentCooldown.maelstromSpent += event.resourceChange;
    }
  }

  onResourceChange(event: ResourceChangeEvent) {
    if (
      !this.currentCooldown ||
      event.resourceChangeType !== RESOURCE_TYPES.MAELSTROM.id ||
      event.targetID !== this.selectedCombatant.id
    ) {
      return;
    }

    this.currentCooldown.resourceChanges.push(event);
  }

  private getGlobalCooldownEnd(event: CastEvent | BeginCastEvent | BeginChannelEvent) {
    const cooldown = getGlobalCooldown(event);
    return cooldown ? cooldown.timestamp + cooldown.duration : event.timestamp;
  }

  private isAscendanceActivationEvent(event: CastEvent | BeginCastEvent | BeginChannelEvent) {
    return event.ability.guid === TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id;
  }

  private getWindowEnd(cast: AscendanceCooldownCast) {
    return cast.end ?? cast.event.timestamp;
  }

  private getActionableCastEvents(cast: AscendanceCooldownCast): CastEvent[] {
    const end = this.getWindowEnd(cast);
    if (end <= cast.start) {
      return [];
    }

    return this.deps.eventHistory
      .getEvents(EventType.Cast, {
        searchBackwards: false,
        startTimestamp: cast.start,
        duration: end - cast.start,
      })
      .filter((event) => !this.isAscendanceActivationEvent(event));
  }

  private getCancelledBeginEvents(
    cast: AscendanceCooldownCast,
  ): (BeginCastEvent | BeginChannelEvent)[] {
    const end = this.getWindowEnd(cast);
    if (end <= cast.start) {
      return [];
    }

    return this.deps.eventHistory
      .getEvents([EventType.BeginCast, EventType.BeginChannel], {
        searchBackwards: false,
        startTimestamp: cast.start,
        duration: end - cast.start,
      })
      .filter((event) => event.isCancelled && !this.isAscendanceActivationEvent(event)) as (
      | BeginCastEvent
      | BeginChannelEvent
    )[];
  }

  private getDowntime(cast: AscendanceCooldownCast) {
    const end = this.getWindowEnd(cast);
    if (end <= cast.start) {
      return 0;
    }

    const activeTime = this.deps.alwaysBeCasting.getActiveTimeMillisecondsInWindow(cast.start, end);
    return Math.max(end - cast.start - activeTime, 0);
  }

  private getTrailingAvailableTime(cast: AscendanceCooldownCast, castEvents: CastEvent[]) {
    const end = this.getWindowEnd(cast);
    const lastGcdEnd = castEvents.reduce(
      (currentMax, event) => Math.max(currentMax, this.getGlobalCooldownEnd(event)),
      cast.start,
    );
    return Math.max(end - lastGcdEnd, 0);
  }

  private getAverageGlobalCooldown(castEvents: CastEvent[]) {
    const gcdDurations = castEvents
      .map((event) => getGlobalCooldown(event))
      .filter((event): event is GlobalCooldownEvent => event !== undefined)
      .map((event) => event.duration);

    if (gcdDurations.length === 0) {
      return 1500;
    }

    return gcdDurations.reduce((total, duration) => total + duration, 0) / gcdDurations.length;
  }

  private getNetMaelstromGenerated(events: ResourceChangeEvent[]) {
    return events.reduce(
      (total, event) => total + Math.max(event.resourceChange - event.waste, 0),
      0,
    );
  }

  private getMaxSpenders(cast: AscendanceCooldownCast, castEvents: CastEvent[]) {
    const lastEvent = castEvents.at(-1);
    const averageGlobalCooldown = this.getAverageGlobalCooldown(castEvents);
    const trailingAvailableTime = this.getTrailingAvailableTime(cast, castEvents);

    let spendableGeneration = this.getNetMaelstromGenerated(cast.resourceChanges);

    if (lastEvent && trailingAvailableTime < averageGlobalCooldown) {
      spendableGeneration -= this.getNetMaelstromGenerated(
        cast.resourceChanges.filter((event) => event.timestamp >= lastEvent.timestamp),
      );
    }

    const totalSpendableMaelstrom = cast.startingMaelstrom + Math.max(spendableGeneration, 0);

    return Math.max(Math.floor(totalSpendableMaelstrom / this.spenderCost), cast.spendersCast);
  }

  private getSpenderPerformance(
    cast: AscendanceCooldownCast,
    castEvents: CastEvent[],
  ): PerCastStat {
    const maxSpenders = this.getMaxSpenders(cast, castEvents);
    const missedSpenders = Math.max(maxSpenders - cast.spendersCast, 0);

    return {
      value: `${cast.spendersCast}/${maxSpenders}`,
      label: 'Spenders',
      tooltip: (
        <>
          You cast <strong>{cast.spendersCast}</strong> out of a maximum of{' '}
          <strong>{maxSpenders}</strong> <SpellLink spell={this.spender.spell} /> casts this window,
          based on starting <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} />, net{' '}
          <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> gained during Ascendance, and any gain
          that happened too late to convert into another spender.
        </>
      ),
      performance: evaluateQualitativePerformanceByThreshold({
        actual: missedSpenders,
        isLessThanOrEqual: {
          perfect: 0,
          good: 1,
          ok: 2,
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

  private isVoltaicBlazeCast(event: CastEvent) {
    return this.hasPurgingFlames && event.ability.guid === SPELLS.VOLTAIC_BLAZE_CAST.id;
  }

  private getVoltaicBlazeTargetsHit(event: CastEvent) {
    return GetRelatedEvents<DamageEvent>(
      event,
      EVENT_LINKS.VoltaicBlazeDamage,
      (e) => e.type === EventType.Damage,
    ).length;
  }

  private isMultiTargetVoltaicBlaze(event: CastEvent) {
    return (
      this.isVoltaicBlazeCast(event) &&
      this.getVoltaicBlazeTargetsHit(event) >= PURGING_FLAMES_TARGET_THRESHOLD
    );
  }

  private getNonOverloadCapableCastEvents(castEvents: CastEvent[]) {
    return castEvents.filter(
      (event) =>
        getGlobalCooldown(event) !== undefined &&
        !overloadCapableSpellIds.has(event.ability.guid) &&
        !this.isMultiTargetVoltaicBlaze(event),
    );
  }

  private getNonOverloadCapableSpellBreakdown(castEvents: CastEvent[]) {
    const spellCounts = new Map<number, { name: string; count: number }>();

    this.getNonOverloadCapableCastEvents(castEvents).forEach((event) => {
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

  private getNonOverloadPerformance(castEvents: CastEvent[]): PerCastStat {
    const nonOverloadSpellCount = this.getNonOverloadCapableCastEvents(castEvents).length;
    const nonOverloadSpellBreakdown = this.getNonOverloadCapableSpellBreakdown(castEvents);

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

  private buildSpellSequence(
    cast: AscendanceCooldownCast,
    castEvents: CastEvent[],
  ): CastInSequence[] {
    const completedEntries: CastInSequence[] = castEvents.map((event) => {
      const isVoltaicBlaze = this.isVoltaicBlazeCast(event);
      const targetsHit = isVoltaicBlaze ? this.getVoltaicBlazeTargetsHit(event) : 0;
      const wasteful = isVoltaicBlaze && targetsHit < PURGING_FLAMES_TARGET_THRESHOLD;

      return {
        timestamp: event.timestamp,
        spellId: event.ability.guid,
        spellName: event.ability.name,
        icon: event.ability.abilityIcon.replace('.jpg', ''),
        performance: wasteful ? QualitativePerformance.Fail : undefined,
        tooltip: (
          <>
            <strong>Cast</strong> <SpellLink spell={event.ability.guid} />
            <div>@ {this.owner.formatTimestamp(event.timestamp)}</div>
            {wasteful ? (
              <div>
                <SpellLink spell={TALENTS.VOLTAIC_BLAZE_TALENT} /> only hit{' '}
                {plural(targetsHit, { one: 'target', other: 'targets' })} and should only be cast in
                multi-target situations.
              </div>
            ) : null}
          </>
        ),
      };
    });

    const cancelledEntries: CastInSequence[] = this.getCancelledBeginEvents(cast).map((event) => ({
      timestamp: event.timestamp,
      spellId: event.ability.guid,
      spellName: event.ability.name,
      icon: event.ability.abilityIcon.replace('.jpg', ''),
      performance: QualitativePerformance.Fail,
      tooltip: (
        <>
          <strong>Started</strong> <SpellLink spell={event.ability.guid} />
          <div>@ {this.owner.formatTimestamp(event.timestamp)}</div>
          <div>Cast never finished.</div>
        </>
      ),
    }));

    return [...completedEntries, ...cancelledEntries].sort(
      (left, right) => left.timestamp - right.timestamp,
    );
  }

  get spenderCost() {
    return this.deps.spenderInfo.spenderCost;
  }

  get spender(): Spender {
    return this.deps.spenderInfo.spender;
  }

  private buildPerCastData(): PerCastData[] {
    return this.cooldownWindows.map((cast) => {
      const castEvents = this.getActionableCastEvents(cast);
      const sequence = this.buildSpellSequence(cast, castEvents);
      const spendersStat = this.getSpenderPerformance(cast, castEvents);
      const downtimeStat = this.getDowntimePerformance(cast);
      const nonOverloadStat = this.getNonOverloadPerformance(castEvents);
      const scoredStats = [spendersStat, downtimeStat, nonOverloadStat];

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
            performance: spendersStat.performance,
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
