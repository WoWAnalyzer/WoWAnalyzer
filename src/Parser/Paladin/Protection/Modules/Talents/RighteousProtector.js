import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const REDUCTION_TIME = 3000; // ms

/**
 * Shield of the Righteous reduces the remaining cooldown on Light of the Protector and Avenging Wrath by 3 sec.
 */
class RighteousProtector extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.RIGHTEOUS_PROTECTOR_TALENT.id);
  }

  lightOfTheProtectorReduced = 0;
  lightOfTheProtectorReductionWasted = 0;
  avengingWrathReduced = 0;
  avengingWrathReductionWasted = 0;
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHIELD_OF_THE_RIGHTEOUS.id) {
      return;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.LIGHT_OF_THE_PROTECTOR.id)) {
      const reduction = this.spellUsable.reduceCooldown(SPELLS.LIGHT_OF_THE_PROTECTOR.id, REDUCTION_TIME);
      this.lightOfTheProtectorReduced += reduction;
      this.lightOfTheProtectorReductionWasted += REDUCTION_TIME - reduction;
    } else {
      this.lightOfTheProtectorReductionWasted += REDUCTION_TIME;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.AVENGING_WRATH.id)) {
      const reduction = this.spellUsable.reduceCooldown(SPELLS.AVENGING_WRATH.id, REDUCTION_TIME);
      this.avengingWrathReduced += reduction;
      this.avengingWrathReductionWasted += REDUCTION_TIME - reduction;
    } else {
      this.avengingWrathReductionWasted += REDUCTION_TIME;
    }
  }
}

export default RighteousProtector;
