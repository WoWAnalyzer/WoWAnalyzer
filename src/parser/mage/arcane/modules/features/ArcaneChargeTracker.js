import SPELLS from 'common/SPELLS';
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
				debug && this.log("Gained " + event.resourceChange + " charges from " + event.ability.name + ": " + this.charges + " total charges");
				if (this.charges > 4) {
					debug && this.log("ERROR: Event caused overcapped charges. Adjusted charge count from " + this.charges + " to 4");
					this.charges = 4;
				}
			} else if (this.charges < 4 && event.waste === 1) {
				this.charges = 4;
				debug && this.log("ERROR: Auto Corrected to 4 Charges");
			}
	}

	on_byPlayer_cast(event) {
		const spellId = event.ability.guid;
		if (spellId !== SPELLS.ARCANE_BARRAGE.id) {
			return;
		}
		debug && this.log("Arcane Barrage cast with " + this.charges + " charges. Reset Charges to 0");
		this.charges = 0;
	}

	on_toPlayer_death(event) {
		this.charges = 0;
		debug && this.log("Player Died. Reset Charges to 0.");
	}
}

export default ArcaneChargeTracker;
