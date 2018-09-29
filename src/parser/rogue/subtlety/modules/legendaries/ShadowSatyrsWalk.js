import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';

import EnergyTracker from '../../../shared/resources/EnergyTracker';

class ShadowSatyrsWalk extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFeet(ITEMS.SHADOW_SATYRS_WALK.id);
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
