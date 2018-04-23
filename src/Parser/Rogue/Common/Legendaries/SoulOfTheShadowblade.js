import React from 'react';

import ITEMS from 'common/ITEMS';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

class SoulOfTheShadowblade extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

	on_initialized(){
		this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_SHADOWBLADE.id);
  }
  
	item() {
		return {
			item: ITEMS.SOUL_OF_THE_SHADOWBLADE,
			result: <React.Fragment>Equipped.</React.Fragment>,
		};
	}

}

export default SoulOfTheShadowblade;
