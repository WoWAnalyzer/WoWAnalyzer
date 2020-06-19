import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, EnergizeEvent, DeathEvent } from 'parser/core/Events';

const debug = false;

class ArcaneChargeTracker extends Analyzer {

	charges = 0;

	constructor(options: any) {
    super(options);
			this.addEventListener(Events.energize.to(SELECTED_PLAYER), this.onEnergize);
			this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE), this.onBarrage);
			this.addEventListener(Events.death.to(SELECTED_PLAYER), this.onDeath);
  }

	onEnergize(event: EnergizeEvent) {
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

	onBarrage(event: CastEvent) {
		debug && this.log("Arcane Barrage cast with " + this.charges + " charges. Reset Charges to 0");
		this.charges = 0;
	}

	onDeath(event: DeathEvent) {
		this.charges = 0;
		debug && this.log("Player Died. Reset Charges to 0.");
	}
}

export default ArcaneChargeTracker;
