import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'Parser/Core/EventsNormalizer';

class EyeBeam extends EventsNormalizer {
	/**
	* The applybuff from demonic is logged before the cast of Eye Beam. 
	* This normalizes events so that the Eye Beam applybuff always comes before the Meta Havoc buff
	* @param {Array} events
  * @returns {Array}
	**/

	normalize(events) {
		const fixedEvents = [];
		events.forEach((event, eventIndex) => {
			fixedEvents.push(event);

			if(event.type === 'applybuff' && event.ability.guid === SPELLS.EYE_BEAM.id) {
				const castTimestamp = event.timestamp;

				for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) { // the max delay between the applybff events never looks to be more than this.
            break;
          }
          if (previousEvent.type === 'applybuff' && previousEvent.ability.guid === SPELLS.METAMORPHOSIS_HAVOC_BUFF.id && previousEvent.sourceID === event.sourceID) {
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

export default EyeBeam;