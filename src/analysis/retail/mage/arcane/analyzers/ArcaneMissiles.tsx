import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer from 'parser/core/Analyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, EventType } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import {
  ARCANE_MISSILES_AMPLIFICATION_TICKS,
  ARCANE_MISSILES_BASE_TICKS,
  CLEARCASTING_BASE_STACKS,
} from '../../shared';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
import { attributeMissileTicks } from '../core/missileTicks';
import { evaluateQualitativePerformanceByThreshold } from 'parser/ui/QualitativePerformance';

export default class ArcaneMissiles extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    arcaneChargeTracker: ArcaneChargeTracker,
  };

  protected eventHistory!: EventHistory;
  protected arcaneChargeTracker!: ArcaneChargeTracker;

  isSunfury: boolean = this.selectedCombatant.hasTalent(TALENTS.MEMORY_OF_ALAR_TALENT);
  hasAmplification: boolean = this.selectedCombatant.hasTalent(TALENTS.AMPLIFICATION_TALENT);
  hasImprovedClearcasting: boolean = this.selectedCombatant.hasTalent(
    TALENTS.IMPROVED_CLEARCASTING_TALENT,
  );
  hasAetherAttunement: boolean = this.selectedCombatant.hasTalent(TALENTS.ARCANE_MISSILES_TALENT);

  missileData: ArcaneMissilesData[] = [];
  private hits: DamageEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_MISSILES_TALENT),
      this.onMissiles,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_MISSILES_DAMAGE),
      this.onMissilesDamage,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  get maxTicks() {
    return this.hasAmplification ? ARCANE_MISSILES_AMPLIFICATION_TICKS : ARCANE_MISSILES_BASE_TICKS;
  }

  onMissilesDamage(event: DamageEvent) {
    this.hits.push(event);
  }

  onMissiles(event: CastEvent) {
    const maxCCStacks = this.hasImprovedClearcasting
      ? CLEARCASTING_BASE_STACKS + 2
      : CLEARCASTING_BASE_STACKS;
    const salvoStacks =
      this.selectedCombatant.getBuff(SPELLS.ARCANE_SALVO_BUFF, event.timestamp)?.stacks || 0;

    this.missileData.push({
      cast: event,
      ticks: 0,
      clipped: false,
      opMissiles: this.selectedCombatant.hasBuff(SPELLS.OVERPOWERED_MISSILES_BUFF, event.timestamp),
      clearcastingCapped:
        (this.selectedCombatant.getBuff(SPELLS.CLEARCASTING_ARCANE.id)?.stacks ?? 0) >= maxCCStacks,
      clearcastingProcs: this.selectedCombatant.getBuff(SPELLS.CLEARCASTING_ARCANE.id)?.stacks ?? 0,
      salvoStacks,
    });
  }

  /**
   * Arcane Missiles has no per-tick event, so ticks (and from them clips and the channel end) are
   * estimated from the damage events. See attributeMissileTicks.
   */
  private assignTicks() {
    const results = attributeMissileTicks(
      this.missileData.map((m) => m.cast),
      this.hits,
      this.maxTicks,
    );
    this.missileData.forEach((m, index) => {
      const { ticks, tickTimes, travelTime, tickInterval } = results[index];
      m.ticks = ticks;
      m.clipped = ticks < this.maxTicks;
      m.completedChannelEnd =
        !m.clipped && tickInterval !== undefined
          ? tickTimes[tickTimes.length - 1] - travelTime + tickInterval
          : undefined;
    });
  }

  onFightEnd() {
    this.assignTicks();
    this.missileData.forEach((m) => {
      const cast = m.cast;

      const gcd = cast.globalCooldown || cast.channel?.beginChannel.globalCooldown;
      m.gcdEnd = gcd ? cast.timestamp + gcd.duration : undefined;

      // The Channeling normalizer ends the channel at the next cast, which is only right if the
      // channel was cut short. A channel with every tick finished ended before that.
      m.channelEnd = m.completedChannelEnd ?? cast.channel?.timestamp;

      if (!m.channelEnd) {
        return;
      }

      const nextCast = this.eventHistory
        .getEvents(EventType.Cast, {
          searchBackwards: false,
          spell: [
            TALENTS.ARCANE_MISSILES_TALENT,
            SPELLS.ARCANE_BLAST,
            SPELLS.ARCANE_BARRAGE,
            SPELLS.ARCANE_EXPLOSION,
            TALENTS.ARCANE_SURGE_TALENT,
            SPELLS.PRISMATIC_BOLT,
          ],
          startTimestamp: cast.timestamp,
          count: 2,
        })
        .find((e) => e !== cast);

      if (nextCast) {
        const nextCastStart = nextCast.channel?.beginChannel.timestamp ?? nextCast.timestamp;
        m.channelEndDelay = Math.max(0, nextCastStart - m.channelEnd);
        m.nextCast = nextCast;
      }
    });
  }

  get averageChannelDelay() {
    const castsWithNextCast = this.missileData.filter((m) => m.channelEndDelay !== undefined);

    let totalDelay = 0;
    castsWithNextCast.forEach((m) => (totalDelay += m.channelEndDelay || 0));
    return totalDelay / castsWithNextCast.length;
  }

  get castsWithoutNextCast() {
    return this.missileData.filter((m) => !m.channelEndDelay).length;
  }

  channelDelayUtil(delay: number) {
    return evaluateQualitativePerformanceByThreshold({
      actual: delay,
      isLessThan: {
        perfect: 100,
        good: 300,
        ok: 500,
      },
    });
  }
}

export interface ArcaneMissilesData {
  cast: CastEvent;
  ticks: number;
  clearcastingCapped: boolean;
  clearcastingProcs: number;
  salvoStacks: number;
  clipped: boolean;
  opMissiles: boolean;
  channelEnd?: number;
  /** Estimated end of a channel that ran all its ticks, derived from the tick timing. */
  completedChannelEnd?: number;
  gcdEnd?: number;
  channelEndDelay?: number;
  nextCast?: CastEvent;
}
