import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'Parser/Core/EventsNormalizer';

class ChaosBlades extends EventsNormalizer {
	/**
	* The applybuff from Chaos Blades is logged before the cast
	* This normalizes events so that the Chaos Blades applybuff always comes after the cast
	* @param {Array} events
  * @returns {Array}
	**/

	normalize(events) {
		const fixedEvents = [];
		events.forEach((event, eventIndex) => {
			fixedEvents.push(event);

			if(event.type === 'cast' && event.ability.guid === SPELLS.CHAOS_BLADES_TALENT.id) {
				const castTimestamp = event.timestamp;

				for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) { // the max delay between the applybff events never looks to be more than this.
            break;
          }
          if (previousEvent.type === 'applybuff' && previousEvent.ability.guid === SPELLS.CHAOS_BLADES_TALENT.id && previousEvent.sourceID === event.sourceID) {
            fixedEvents.splice(previousEventIndex, 1);
            fixedEvents.push(previousEvent);
            previousEvent.__modified = true;
            break;
          }
        }
			}
		});

		return fixedEvents;
	}
}

export default ChaosBlades;