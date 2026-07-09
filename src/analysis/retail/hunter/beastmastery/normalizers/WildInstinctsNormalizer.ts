import TALENTS from 'common/TALENTS/hunter';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { MS_BUFFER_100 } from '../../shared/constants';

/**
 * With both Thundering Hooves and Wild Instincts talented, casting Bestial Wrath triggers a
 * Stomp, and each target Stomp hits triggers a free application of Barbed Shot. Blizzard's
 * combat log fires an actual player `cast` event for that free application, identical in shape
 * to a real Barbed Shot cast at (or immediately after) the same timestamp as the Bestial Wrath
 * cast. Left alone, this phantom cast fights the Bestial Wrath cast for the same Timeline slot
 * and incorrectly consumes/restores a real Barbed Shot charge in SpellUsable's cooldown
 * tracking. Since it isn't a real player action - it's baked into the Bestial Wrath GCD - this
 * strips the phantom cast marker out entirely (the actual damage/debuff/Frenzy events tied to
 * it are untouched).
 */
class WildInstinctsNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    if (
      !this.selectedCombatant.hasTalent(TALENTS.THUNDERING_HOOVES_TALENT) ||
      !this.selectedCombatant.hasTalent(TALENTS.WILD_INSTINCTS_TALENT)
    ) {
      return events;
    }

    let lastBestialWrathCast = -Infinity;

    return events.filter((event) => {
      if (event.type !== EventType.Cast) {
        return true;
      }
      if (event.ability.guid === TALENTS.BESTIAL_WRATH_TALENT.id) {
        lastBestialWrathCast = event.timestamp;
        return true;
      }
      if (
        event.ability.guid === TALENTS.BARBED_SHOT_TALENT.id &&
        event.timestamp - lastBestialWrathCast <= MS_BUFFER_100
      ) {
        return false;
      }
      return true;
    });
  }
}

export default WildInstinctsNormalizer;
