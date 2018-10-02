import SPELLS from 'common/SPELLS';
import { formatMilliseconds } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

const debug = false;

class ArcaneChargeTracker extends Analyzer {

	charges = 0;

	on_energize(event) {
		const resourceType = event.resourceChangeType;
		if (resourceType !== 16) {
			return;
		}
			if (this.charges < 4) {
				this.charges += event.resourceChange;
				debug && console.log("Gained " + event.resourceChange + " charges from " + event.ability.name + ": " + this.charges + " total charges @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
				if (this.charges > 4) {
					debug && console.log("ERROR: Event caused overcapped charges. Adjusted charge count from " + this.charges + " to 4 @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
					this.charges = 4;
				}
			} else if (this.charges < 4 && event.waste === 1) {
				this.charges = 4;
				debug && console.log("ERROR: Auto Corrected to 4 Charges @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
			}
	}

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_BARRAGE.id) {
			return;
		}
		debug && console.log("Arcane Barrage cast with " + this.charges + " charges. Reset Charges to 0 @" + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
		this.charges = 0;
	}

	on_toPlayer_death(event) {
		this.charges = 0;
		debug && console.log("Player Died. Reset Charges to 0. @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
	}
}

export default ArcaneChargeTracker;
