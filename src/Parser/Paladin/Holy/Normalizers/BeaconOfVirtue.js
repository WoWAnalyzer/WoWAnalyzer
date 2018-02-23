import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'Parser/Core/EventsNormalizer';

// the max delay between the cast and buff events never looks to be more than this, nor should it be possible to cast twice within this time. Actually it seems to always be the same frame, but accounting for a delay nonetheless.
const MAX_DELAY = 100;

/**
 * It is considered best practice to cast Flash of Light and immediately following it up with a Beacon of Virtue. This usually causes the precast FoL heal to still be replicated by BoV. But the combat log records it like this:
 * 0000 FoL begincast
 * 1500 FoL cast
 * 1500 BoV cast
 * 1500 FoL heal
 * 1500 BoV applybuff x4
 * I figured the heal still replicating may be caused by either:
 * 1. If the game instead of calculating beacon healing right as the heal lands, it might delay it for the next tick. This would make sense from an optimization PoV where Blizz assume the original heal could take a while to process, and if the next tick has the buffs applied then it would indeed replicate that healing.
 * 2. The combatlog is wrongly ordered and the `applybuff` actually happens at the exact same time as the `cast` on the server. I figured this would be less likely, as it would be weird for this to be the behavior for `applybuff` while `heal` obviously doesn't act this way (if it did we could never precast a FoL into a BoV).
 *
 * However after analyzing Disc Priest's Atonement interactions with PW:R and Evangelism (PW:R is cast, then Evangelism, then Atonement lands in the combatlog but in-game its duration was properly extended), it seems most likely to be that 2 is the case.
 *
 * Because of the wrong ordering of the combatlog where the `heal` is prior to the `applybuff` events, our beacon healing tracking modules are off. Because it seems most likely that the game treats `applybuff`s as if they happened on the `cast` event, I think it best we try to recreate that. That's what this normalizer does.
 */
class BeaconOfVirtue extends EventsNormalizer {
  findPreviousCast(previousEvents, event) {
    const timestamp = event.timestamp;
    // Loop through the event history in reverse to detect if there was a `cast` event by the same source
    let lastBeaconOfVirtueCastIndex = null;
    for (let previousEventIndex = previousEvents.length - 1; previousEventIndex >= 0; previousEventIndex -= 1) {
      const previousEvent = previousEvents[previousEventIndex];
      if ((timestamp - previousEvent.timestamp) > MAX_DELAY) {
        break;
      }
      // The reason we check for both cast and applybuff is that we don't want to re-order applybuffs, so if the order is "cast, applybuff1, applybuff2", we want it to stay the way. If we moved everything to just the cast, the applybuff order would be reversed resulting it "cast, applybuff2, applybuff1".
      if (previousEvent.type !== 'cast' && previousEvent.type !== 'applybuff') {
        continue;
      }
      if (previousEvent.ability.guid !== SPELLS.BEACON_OF_VIRTUE_TALENT.id) {
        continue;
      }
      if (previousEvent.sourceID !== event.sourceID) {
        // Play nice when there are two Holy Paladins casting BoV at the same time
        continue;
      }
      lastBeaconOfVirtueCastIndex = previousEventIndex;
      break;
    }
    return lastBeaconOfVirtueCastIndex;
  }
  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      if (event.type === 'applybuff' && event.ability.guid === SPELLS.BEACON_OF_VIRTUE_TALENT.id) {
        const lastBeaconOfVirtueCastIndex = this.findPreviousCast(fixedEvents, event);

        if (lastBeaconOfVirtueCastIndex !== null) {
          event.__modified = true;
          fixedEvents.splice(lastBeaconOfVirtueCastIndex + 1, 0, event);
          return;
        }
      }

      fixedEvents.push(event);
    });

    return fixedEvents;
  }
}

export default BeaconOfVirtue;
