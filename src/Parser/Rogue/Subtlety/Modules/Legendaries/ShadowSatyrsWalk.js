import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';
import Wrapper from 'common/Wrapper';


import EnergyTracker from '../RogueCore/EnergyTracker';

class ShadowSatyrsWalk extends Analyzer {
  static dependencies = {
    combatants: Combatants,
		energyTracker: EnergyTracker,
	};

	on_initialized(){
		this.active = this.combatants.selected.hasFeet(ITEMS.SHADOW_SATYRS_WALK.id);
	}	

	item() {
		const builders = this.energyTracker.buildersObj;
		if(!(SPELLS.SHADOW_SATYRS_WALK_ENERGY_BASE.id in builders)) return;

		const base = builders[SPELLS.SHADOW_SATYRS_WALK_ENERGY_BASE.id];
		const extra = builders[SPELLS.SHADOW_SATYRS_WALK_ENERGY_EXTRA.id];

		const total = base.generated + extra.generated;
		const avgExtra = extra.generated / base.casts;

		return {
			item: ITEMS.SHADOW_SATYRS_WALK,
			result: <Wrapper>
        <dfn data-tip={`Positioning yourself at maximum range from the boss could increase your energy generation.`}>
         {total} energy generated.
				 <br/>
				 {avgExtra.toFixed(2)} average bonus energy per cast.
        </dfn>
      </Wrapper>,
		};
	}

}

export default ShadowSatyrsWalk;