import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

import EnergyTracker from '../../../Common/Resources/EnergyTracker';

class ShadowSatyrsWalk extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    energyTracker: EnergyTracker,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFeet(ITEMS.SHADOW_SATYRS_WALK.id);
  }

  item() {
    const builders = this.energyTracker.buildersObj;
    if (builders[SPELLS.SHADOW_SATYRS_WALK_ENERGY_BASE.id] === undefined) {
      return null;
    }

    const base = builders[SPELLS.SHADOW_SATYRS_WALK_ENERGY_BASE.id];
    const extra = builders[SPELLS.SHADOW_SATYRS_WALK_ENERGY_EXTRA.id];

    const total = base.generated + extra.generated;
    const avgExtra = extra.generated / base.casts;

    const totalPerMinute = (total / this.owner.fightDuration) * 1000 * 60;

    return {
      item: ITEMS.SHADOW_SATYRS_WALK,
      result: <React.Fragment>
        <dfn data-tip="Positioning at maximum range from your target could increase energy generation.">
          {totalPerMinute.toFixed(2)} energy generated per minute.
          <br />
          {avgExtra.toFixed(2)} average bonus energy per cast.
        </dfn>
      </React.Fragment>,
    };
  }
}

export default ShadowSatyrsWalk;
