import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer from 'parser/core/Analyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents, DamageEvent, EventType } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import { ARCANE_MISSILES_BASE_TICKS, CLEARCASTING_BASE_STACKS } from '../../shared';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';
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

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_MISSILES_TALENT),
      this.onMissiles,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onMissiles(event: CastEvent) {
    const maxTicks = this.hasAmplification
      ? ARCANE_MISSILES_BASE_TICKS + 2
      : ARCANE_MISSILES_BASE_TICKS;
    const maxCCStacks = this.hasImprovedClearcasting
      ? CLEARCASTING_BASE_STACKS + 2
      : CLEARCASTING_BASE_STACKS;
    const damageTicks: DamageEvent | DamageEvent[] | undefined = GetRelatedEvents(
      event,
      EventType.Damage,
    );
    const salvoStacks =
      this.selectedCombatant.getBuff(SPELLS.ARCANE_SALVO_BUFF, event.timestamp - 10)?.stacks || 0;

    this.missileData.push({
      cast: event,
      ticks: damageTicks.length,
      arcaneCharges: this.arcaneChargeTracker.current,
      clipped: damageTicks && damageTicks.length < maxTicks,
      opMissiles: this.selectedCombatant.hasBuff(
        SPELLS.OVERPOWERED_MISSILES_BUFF,
        event.timestamp - 10,
      ),
      clearcastingCapped:
        (this.selectedCombatant.getBuff(SPELLS.CLEARCASTING_ARCANE.id)?.stacks ?? 0) >= maxCCStacks,
      clearcastingProcs: this.selectedCombatant.getBuff(SPELLS.CLEARCASTING_ARCANE.id)?.stacks ?? 0,
      salvoStacks,
      arcaneSoul: this.selectedCombatant.hasBuff(SPELLS.ARCANE_SOUL_BUFF.id, event.timestamp - 10),
    });
  }

  onFightEnd() {
    this.missileData.forEach((m) => {
      const cast = m.cast;

      const gcd = cast.globalCooldown || cast.channel?.beginChannel.globalCooldown;
      m.gcdEnd = gcd ? cast.timestamp + gcd.duration : undefined;

      m.channelEnd = cast.channel?.timestamp;

      if (!m.channelEnd) {
        return;
      }

      const nextCast = this.eventHistory.getEvents(EventType.Cast, {
        searchBackwards: false,
        spell: [
          TALENTS.ARCANE_MISSILES_TALENT,
          SPELLS.ARCANE_BLAST,
          SPELLS.ARCANE_BARRAGE,
          SPELLS.ARCANE_EXPLOSION,
          TALENTS.ARCANE_SURGE_TALENT,
        ],
        startTimestamp: m.channelEnd,
        count: 1,
      })[0];

      if (nextCast) {
        const nextCastStart = nextCast.channel?.beginChannel.timestamp ?? nextCast.timestamp;
        m.channelEndDelay = nextCastStart - m.channelEnd;
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
  arcaneCharges: number;
  clearcastingCapped: boolean;
  clearcastingProcs: number;
  salvoStacks: number;
  clipped: boolean;
  opMissiles: boolean;
  channelEnd?: number;
  gcdEnd?: number;
  channelEndDelay?: number;
  nextCast?: CastEvent;
  arcaneSoul: boolean;
}
