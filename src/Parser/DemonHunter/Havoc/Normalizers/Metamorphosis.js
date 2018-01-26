import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'Parser/Core/EventsNormalizer';

class Metamorphosis extends EventsNormalizer {
	/**
	* Metamorphosis' cast is logged after the applybuff. This makes it appear as though it is off the GCD when it is not.
	* @param {Array} events
	* @returns {Array}
	**/

	normalize(events) {
		const fixedEvents = [];
		events.forEach((event, eventIndex) =>{
			fixedEvents.push(event);

			if(event.type === 'applybuff' && event.ability.guid === SPELLS.METAMORPHOSIS_HAVOC_BUFF.id){
				const castTimestamp = event.timestamp;

				for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
					const previousEvent = fixedEvents[previousEventIndex];
					if ((castTimestamp - previousEvent) < 1500) { //Looks to be the max delay between the applybuff and the cast
						break;
					}
					if (previousEvent.type === 'cast' && previousEvent.ability.guid === SPELLS.METAMORPHOSIS_HAVOC.id && event.sourceID) {
						console.log('blah blah')
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

export default Metamorphosis;