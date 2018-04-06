import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const REDUCTION_TIME_PER_HIT = 3000; // ms

/**
 * Avengers Shield reduces the cooldown of Guardian of ancient Kings by 3s per target hit
*/
class BreatplateOfTheGoldenValkyr extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.BREASTPLATE_OF_THE_GOLDEN_VALKYR.id);
  }

  ancientKingsReduced = 0;
  ancientKingsWasted = 0;

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.AVENGERS_SHIELD.id) {
      return;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id)) {
      const reduction = this.spellUsable.reduceCooldown(SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id, REDUCTION_TIME_PER_HIT);
      this.ancientKingsReduced += reduction;
      this.ancientKingsWasted += REDUCTION_TIME_PER_HIT - reduction;
    } else {
      this.ancientKingsWasted += REDUCTION_TIME_PER_HIT;
    }
  }

  item() {
		return {
			item: ITEMS.BREASTPLATE_OF_THE_GOLDEN_VALKYR,
			result: (
				<dfn data-tip={`Wasted ${ this.ancientKingsWasted / 1000 } possible seconds worth of cooldown reduction.`}>
					<SpellLink id={SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id} /> reduced by { this.ancientKingsReduced / 1000 }s
				</dfn>
			),
		};
	}
}

export default BreatplateOfTheGoldenValkyr;
