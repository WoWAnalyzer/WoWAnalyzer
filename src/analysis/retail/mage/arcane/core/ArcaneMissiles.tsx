import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents, DamageEvent, EventType } from 'parser/core/Events';
import { ARCANE_MISSILES_MAX_TICKS, CLEARCASTING_MAX_STACKS } from '../../shared';
import { ThresholdStyle } from 'parser/core/ParseResults';
import EventHistory from 'parser/shared/modules/EventHistory';

export default class ArcaneMissiles extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };

  protected eventHistory!: EventHistory;

  hasNetherPrecision: boolean = this.selectedCombatant.hasTalent(TALENTS.NETHER_PRECISION_TALENT);
  hasAetherAttunement: boolean = this.selectedCombatant.hasTalent(TALENTS.AETHER_ATTUNEMENT_TALENT);
  missileCasts: ArcaneMissilesCast[] = [];

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
      'SpellDamage',
    );
    const clearcasting = this.selectedCombatant.getBuff(SPELLS.CLEARCASTING_ARCANE.id);

    this.missileCasts.push({
      ordinal: this.missileCasts.length + 1,
      cast: event,
      ticks: damageTicks.length,
      aetherAttunement: this.selectedCombatant.hasBuff(SPELLS.AETHER_ATTUNEMENT_PROC_BUFF.id),
      netherPrecision: this.selectedCombatant.hasBuff(SPELLS.NETHER_PRECISION_BUFF.id),
      arcaneSoul: this.selectedCombatant.hasBuff(SPELLS.ARCANE_SOUL_BUFF.id),
      clearcastingCapped:
        clearcasting && clearcasting?.stacks === CLEARCASTING_MAX_STACKS ? true : false,
      clearcastingProcs: clearcasting?.stacks || 0,
      clipped: damageTicks && damageTicks.length < ARCANE_MISSILES_MAX_TICKS,
    });
  }

  onFightEnd() {
    this.missileCasts.forEach((m) => {
      const cast = m.cast;
      m.gcdEnd =
        (cast.globalCooldown && cast.timestamp + cast.globalCooldown?.duration) ||
        (cast.channel?.beginChannel.globalCooldown &&
          cast.timestamp + cast.channel?.beginChannel.globalCooldown.duration);
      m.channelEnd = cast.channel?.timestamp;

      const nextCast = this.eventHistory.getEvents(EventType.Cast, {
        searchBackwards: false,
        spell: [
          TALENTS.ARCANE_MISSILES_TALENT,
          SPELLS.ARCANE_BLAST,
          SPELLS.ARCANE_BARRAGE,
          SPELLS.ARCANE_EXPLOSION,
        ],
        startTimestamp: cast.channel?.timestamp,
        count: 1,
      })[0];
      if (m.channelEnd && nextCast && nextCast.channel?.beginChannel.timestamp) {
        m.channelEndDelay = nextCast.channel.beginChannel.timestamp - m.channelEnd;
      } else if (m.channelEnd && nextCast) {
        m.channelEndDelay = nextCast.timestamp - m.channelEnd;
      }
    });
  }

  get averageChannelDelay() {
    const castsWithNextCast = this.missileCasts.filter((m) => m.channelEndDelay !== undefined);

    let totalDelay = 0;
    castsWithNextCast.forEach((m) => (totalDelay += m.channelEndDelay || 0));
    return totalDelay / castsWithNextCast.length;
  }

  get castsWithoutNextCast() {
    return this.missileCasts.filter((m) => !m.channelEndDelay).length;
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

export interface ArcaneMissilesCast {
  ordinal: number;
  cast: CastEvent;
  ticks: number;
  aetherAttunement: boolean;
  netherPrecision: boolean;
  arcaneSoul: boolean;
  clearcastingCapped: boolean;
  clearcastingProcs: number;
  clipped: boolean;
  channelEnd?: number;
  gcdEnd?: number;
  channelEndDelay?: number;
}
