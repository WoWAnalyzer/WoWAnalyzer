import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer from 'parser/core/Analyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents, DamageEvent, EventType } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import { ARCANE_MISSILES_MAX_TICKS, CLEARCASTING_MAX_STACKS } from '../../shared';
import { ThresholdStyle } from 'parser/core/ParseResults';

export default class ArcaneMissiles extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };

  protected eventHistory!: EventHistory;

  hasAetherAttunement: boolean = this.selectedCombatant.hasTalent(TALENTS.AETHER_ATTUNEMENT_TALENT);
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
    const damageTicks: DamageEvent | DamageEvent[] | undefined = GetRelatedEvents(
      event,
      EventType.Damage,
    );

    this.missileData.push({
      cast: event,
      ticks: damageTicks.length,
      aetherAttunement: this.selectedCombatant.hasBuff(SPELLS.AETHER_ATTUNEMENT_PROC_BUFF.id),
      arcaneSoul: this.selectedCombatant.hasBuff(SPELLS.ARCANE_SOUL_BUFF.id),
      clipped: damageTicks && damageTicks.length < ARCANE_MISSILES_MAX_TICKS,
      clearcastingCapped:
        (this.selectedCombatant.getBuff(SPELLS.CLEARCASTING_ARCANE.id)?.stacks ?? 0) >=
        CLEARCASTING_MAX_STACKS,
      clearcastingProcs: this.selectedCombatant.getBuff(SPELLS.CLEARCASTING_ARCANE.id)?.stacks ?? 0,
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

  get channelDelayThresholds() {
    return {
      actual: this.averageChannelDelay,
      isGreaterThan: {
        minor: 100,
        average: 300,
        major: 500,
      },
      style: ThresholdStyle.NUMBER,
    };
  }
}

export interface ArcaneMissilesData {
  cast: CastEvent;
  ticks: number;
  aetherAttunement: boolean;
  arcaneSoul: boolean;
  clearcastingCapped: boolean;
  clearcastingProcs: number;
  clipped: boolean;
  channelEnd?: number;
  gcdEnd?: number;
  channelEndDelay?: number;
  nextCast?: CastEvent;
}
