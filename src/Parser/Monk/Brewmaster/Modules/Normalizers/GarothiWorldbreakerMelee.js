import EventsNormalizer from 'Parser/Core/EventsNormalizer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import SPELLS from 'common/SPELLS';
import GarothiWorldbreaker from 'Raids/AntorusTheBurningThrone/GarothiWorldbreaker';

/**
 * The issue with Garothi Worldbreaker is that he has two melee
 * abilities -- the normal one, and then the actual one. This is due to
 * his fixed location to keep him from randomly 1-shotting melee dps due
 * to range.
 *
 * This wouldn't be a problem, *except* every dodge gets double-counted.
 * We simply remove every "normal" melee from the event list to account
 * for this (each should be a dodge).
 */
class GarothiWorldbreakerMelee extends EventsNormalizer {
  normalize(events) {
    if(this.owner.fight.boss !== GarothiWorldbreaker.id) {
      return events;
    }
    return events.filter(event => {
      if(event.type !== "damage" || event.sourceIsFriendly) {
        return true;
      }
      if(event.ability) {
        if(event.ability.guid === SPELLS.MELEE.id && event.hitType !== HIT_TYPES.DODGE) {
          throw new Error("Garothi hit with a normal melee, wut?");
        }
        return event.ability.guid !== SPELLS.MELEE.id;
      }
      return true;
    });
  }
}

export default GarothiWorldbreakerMelee;
