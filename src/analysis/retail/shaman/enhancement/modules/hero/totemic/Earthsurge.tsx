import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import Events, {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import { EnhancementEventLinks } from '../../../constants';

/**
 * While Hot Hand is active Lava Lash shatters the earth, causing a Sundering at 50% effectiveness.
 * Sunderings from this effect do not Incapacitate.
 */
class Earthsurge extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EARTHSURGE_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.LAVA_LASH_TALENT),
      this.onLavaLashCast,
    );
  }

  onLavaLashCast(event: CastEvent) {
    if (this.isInefficientLavaLashCast(event)) {
      addInefficientCastReason(
        event,
        <>
          <SpellLink spell={TALENTS.EARTHSURGE_TALENT} /> triggered a{' '}
          <SpellLink spell={TALENTS.SUNDERING_TALENT} /> that didn't hit any targets.
        </>,
      );
    }
  }

  public isInefficientLavaLashCast(event: CastEvent) {
    // Only check Lava Lash casts during Hot Hand
    if (!this.selectedCombatant.hasBuff(SPELLS.HOT_HAND_BUFF.id, event.timestamp)) {
      return false;
    }

    // Find the related Sundering cast triggered by Reactivity
    const reactivityCast = GetRelatedEvent<CastEvent>(
      event,
      EnhancementEventLinks.REACTIVITY_LINK,
      (e) => e.type === EventType.Cast,
    );
    if (
      !reactivityCast ||
      GetRelatedEvents<DamageEvent>(reactivityCast, EnhancementEventLinks.SUNDERING_LINK).length ===
        0
    ) {
      return true;
    }

    return false;
  }
}

export default Earthsurge;
