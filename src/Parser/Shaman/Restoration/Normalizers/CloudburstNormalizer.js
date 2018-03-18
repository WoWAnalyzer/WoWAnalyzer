import EventsNormalizer from 'Parser/Core/EventsNormalizer';

import SPELLS from 'common/SPELLS';

const MAX_DELAY = 20000;
const CBT_DELAY = 15000;

/*
* Cloudburst Totem had some weird behaviour (even if it rarely happens), 
* because of that you can have a cast event without heal events.
* This happens if everyone in range is at 100% HP, it will just not heal at all.
*
* That throws off the CooldownThroughputTracker, gathering all events
* until the CBT after that explodes and giving results that are completely wrong.
*
* This Normalizer creates a 100% overhealed healing event where the heal would have been,
* if no healing events happened within 20 seconds after casting the totem.
 */

class CloudburstNormalizer extends EventsNormalizer {

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id);
  }

  fabricatedTimestamp = null;
  fabricatedEvent = null;

  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {

      if(this.fabricatedTimestamp) {
        if(event.timestamp >= this.fabricatedTimestamp) {
          fixedEvents.push(this.fabricatedEvent);
          this.fabricatedTimestamp = null;
          this.fabricatedEvent = null;
        }
      }

      fixedEvents.push(event);


      if (event.type === 'cast' && event.ability.guid === SPELLS.CLOUDBURST_TOTEM_TALENT.id) {
        const castTimestamp = event.timestamp;

        // Look ahead through the events to see if there is an CLOUDBURST_TOTEM_HEAL within a 20 second period
        for (let nextEventIndex = eventIndex; nextEventIndex < events.length-1; nextEventIndex += 1) {
          const nextEvent = events[nextEventIndex];
          
          if ((nextEvent.timestamp - castTimestamp) > MAX_DELAY) {
            // No CLOUDBURST_TOTEM_HEAL found within the period, meaning this cast wasn't able to find targets and did not have any healing events -> create a 100% overheal event
            const newTimestamp = event.timestamp+CBT_DELAY;

            this.fabricatedEvent = {
              timestamp: newTimestamp, 
              type: "heal", 
              sourceID: event.sourceID, 
              sourceIsFriendly: true, 
              targetID: event.sourceID,
              ability: {
                abilityIcon: SPELLS.CLOUDBURST_TOTEM_HEAL.icon,
                guid: SPELLS.CLOUDBURST_TOTEM_HEAL.id,
                name: SPELLS.CLOUDBURST_TOTEM_HEAL.name,
                type: 8,
              },
              amount: 0,
              hitType: 1,
              itemLevel: event.itemLevel,
              overheal: 1,
              resourceActor: 2,
              targetIsFriendly: true,
              truetimestamp: newTimestamp,
              modified: true,
            };
            this.fabricatedTimestamp = newTimestamp;
            break;
          } else if (nextEvent.type === 'heal' && nextEvent.ability.guid === SPELLS.CLOUDBURST_TOTEM_HEAL.id) {
            // CLOUDBURST_TOTEM_HEAL found, this was fine
            break;
          }
        }
      }
    });

    return fixedEvents;
  }

}
export default CloudburstNormalizer;
