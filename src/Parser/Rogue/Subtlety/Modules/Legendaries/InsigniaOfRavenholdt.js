import React from 'react';

import ITEMS from 'common/ITEMS';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';
import Wrapper from 'common/Wrapper';

class InsigniaOfRavenholdt extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

	on_initialized(){
		this.active = this.combatants.selected.hasFinger(ITEMS.INSIGNIA_OF_RAVENHOLDT.id);
  }
  
	item() {
		return {
			item: ITEMS.INSIGNIA_OF_RAVENHOLDT,
			result: <Wrapper>Equipped.</Wrapper>,
		};
	}

}

export default InsigniaOfRavenholdt;