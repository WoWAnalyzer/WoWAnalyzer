import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';

/**
* Unleashed Demons: 
* Reduces the cooldown of Metamorphosis by 20 sec. (has dimishing returns)
**/

class UnleashedDemons extends Analyzer {

	constructor(...args) {
    super(...args);
		this.active = this.selectedCombatant.traitsBySpellId[SPELLS.UNLEASHED_DEMONS.id] > 0;
	}

	metamorphosisCDReduction = 0;

	get traitCooldownReduction() {
		const rank = this.selectedCombatant.traitsBySpellId[SPELLS.UNLEASHED_DEMONS.id];

		if (rank < 4) {
			this.metamorphosisCDReduction = rank * 20;
		}
		else {
			switch (rank) {
				case 4:
					this.metamorphosisCDReduction = 75;
					break;
				case 5:
					this.metamorphosisCDReduction = 90;
					break;
				case 6:
					this.metamorphosisCDReduction = 100;
					break;
				case 7:
					this.metamorphosisCDReduction = 110;
					break;
				default:
					break;
			}
		}
		const cdReduciton = this.metamorphosisCDReduction;
		return cdReduciton;
	}
}

export default UnleashedDemons;
