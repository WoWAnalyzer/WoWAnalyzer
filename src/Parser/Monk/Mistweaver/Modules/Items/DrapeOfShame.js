import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Wrapper from 'common/Wrapper';
import CoreDrapeOfShame from 'Parser/Core/Modules/Items/Legion/DrapeOfShame';
import ItemHealingDone from 'Main/ItemHealingDone';

import StatValues from '../Features/StatValues';

class DrapeOfShame extends CoreDrapeOfShame {
  static dependencies = {
    ...CoreDrapeOfShame.dependencies,
    statValues: StatValues,
  };

  get estimatedItemLevel() {
    if (!this.owner.finished) {
      return null;
    }

    // My DoS
    const itemLevel = this.equippedItem.itemLevel;
    const statsHps = this.statValues.calculateItemStatsHps(this.baseStats, itemLevel);
    const effectHps = this.healing / this.owner.fightDuration * 1000;
    const totalHps = statsHps + effectHps;

    // An estimated DoS
    let estimatedItemLevel = itemLevel;
    let estimatedHps = 0;
    while (estimatedHps < totalHps) {
      estimatedItemLevel += 5;
      estimatedHps = this.statValues.calculateItemStatsHps(this.baseStats, estimatedItemLevel);
    }
    // We need the `estimatedItemLevel` to *beat* the DoS, so the DoS is worth about 0-5 item levels less
    return estimatedItemLevel - 5;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (this.owner.constructor.abilitiesAffectedByHealingIncreases.indexOf(spellId) === -1 || spellId === SPELLS.BEACON_OF_LIGHT_CAST_AND_HEAL.id) {
      return;
    }
    super.on_byPlayer_heal(event);
  }

  item() {
    const estimatedItemLevel = this.estimatedItemLevel;
    return {
      item: ITEMS.DRAPE_OF_SHAME,
      result: (
        <Wrapper>
          <ItemHealingDone amount={this.healing} /><br />
          <img
            src="/img/ilvl.png"
            alt="Item level"
            className="icon"
          />{' '}{estimatedItemLevel !== null ? `≈${estimatedItemLevel} cloak with similar stats` : 'Calculating...'}
        </Wrapper>
      ),
    };
  }
}

export default DrapeOfShame;
