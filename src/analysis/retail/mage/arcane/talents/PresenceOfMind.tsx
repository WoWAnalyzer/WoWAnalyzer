import TALENTS from 'common/TALENTS/mage';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  GetRelatedEvents,
  GetRelatedEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import ArcaneChargeTracker from '../core/ArcaneChargeTracker';

export default class PresenceOfMind extends Analyzer {
  static dependencies = {
    chargeTracker: ArcaneChargeTracker,
  };
  protected chargeTracker!: ArcaneChargeTracker;

  pomCasts: PresenceOfMindCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRESENCE_OF_MIND_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRESENCE_OF_MIND_TALENT),
      this.onPresenceMind,
    );
  }

  onPresenceMind(event: CastEvent) {
    const blasts: CastEvent[] | undefined = GetRelatedEvents(event, 'SpellCast');
    const barrage: CastEvent | undefined = GetRelatedEvent(event, 'BarrageCast');
    const barrageHits: DamageEvent[] | undefined =
      barrage && GetRelatedEvents(barrage, 'SpellDamage');
    const buffedCasts = blasts.filter((b) =>
      this.selectedCombatant.hasBuff(TALENTS.PRESENCE_OF_MIND_TALENT.id, b.timestamp),
    );
    const buffRemove: RemoveBuffEvent | undefined = GetRelatedEvent(event, 'BuffRemove');
    const touchRemove: RemoveDebuffEvent | undefined = GetRelatedEvent(event, 'DebuffRemove');
    const touchCancelDelay =
      touchRemove && buffRemove && buffRemove.timestamp > touchRemove.timestamp
        ? buffRemove.timestamp - touchRemove.timestamp
        : undefined;

    this.pomCasts.push({
      ordinal: this.pomCasts.length + 1,
      cast: event,
      targets: barrageHits?.length,
      charges: this.chargeTracker.current,
      stacksUsed: buffedCasts.length || 0,
      usedTouchEnd: touchCancelDelay !== undefined,
      touchCancelDelay,
    });
  }
}

export interface PresenceOfMindCast {
  ordinal: number;
  cast: CastEvent;
  targets?: number;
  charges: number;
  stacksUsed: number;
  usedTouchEnd?: boolean;
  touchCancelDelay?: number;
}
