import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';

class DreadlordsDeceit extends Analyzer {

	constructor(...args) {
		super(...args);
		this.active = this.selectedCombatant.hasBack(ITEMS.THE_DREADLORDS_DECEIT.id);
  }
  
	item() {
		return {
			item: ITEMS.THE_DREADLORDS_DECEIT,
			result: 'Equipped.',
		};
	}
}

export default DreadlordsDeceit;
