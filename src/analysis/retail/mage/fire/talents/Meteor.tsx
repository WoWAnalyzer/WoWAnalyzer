import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class Meteor extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };
  protected abilityTracker!: AbilityTracker;
  protected spellUsable!: SpellUsable;

  hasBurnout: boolean = this.selectedCombatant.hasTalent(TALENTS.BURNOUT_TALENT);
  meteors: MeteorCasts[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.METEOR_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.METEOR_TALENT),
      this.onMeteorCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.METEOR_DAMAGE),
      this.onMeteorDamage,
    );
  }

  onMeteorCast(event: CastEvent) {
    const damageEvents: DamageEvent[] = GetRelatedEvents(event, EventType.Damage) || [];
    this.meteors.push({
      cast: event,
      damageEvents,
      targetsHit: damageEvents.length,
      timeTillCombust: this.spellUsable.cooldownRemaining(
        TALENTS.COMBUSTION_TALENT.id,
        event.timestamp,
      ),
    });
  }

  onMeteorDamage(event: DamageEvent) {
    const cast = GetRelatedEvent(event, EventType.Cast);
    const index = this.meteors.findIndex((m) => m.cast.timestamp === cast?.timestamp);
    if (!cast) {
      return;
    }
    this.log('METEOR!!!!!!!!');

    const combustBuff = this.selectedCombatant.getBuff(TALENTS.COMBUSTION_TALENT, event.timestamp);
    const combustEnd = combustBuff && GetRelatedEvent(combustBuff, EventType.RemoveBuff);
    if (this.meteors[index].landedDuringCombust === undefined) {
      this.meteors[index].landedDuringCombust = combustBuff ? true : false;
    }

    if (combustBuff && combustEnd && this.meteors[index].timeTillCombustEnd == undefined) {
      this.meteors[index].timeTillCombustEnd = combustEnd.timestamp - event.timestamp;
    }
  }
}

export interface MeteorCasts {
  cast: CastEvent;
  damageEvents: DamageEvent[];
  targetsHit: number;
  timeTillCombust: number;
  landedDuringCombust?: boolean;
  timeTillCombustEnd?: number;
}
