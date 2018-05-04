import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import CoreDrapeOfShame, { DRAPE_OF_SHAME_CRIT_EFFECT } from 'Parser/Core/Modules/Items/Legion/DrapeOfShame';
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
    if (this.owner.constructor.abilitiesAffectedByHealingIncreases.indexOf(spellId) === -1 || spellId === SPELLS.BEACON_OF_LIGHT_HEAL.id) {
      return;
    }
    super.on_byPlayer_heal(event);
  }
  on_beacon_heal(event) {
    const spellId = event.originalHeal.ability.guid;
    if (this.owner.constructor.abilitiesAffectedByHealingIncreases.indexOf(spellId) === -1 || spellId === SPELLS.BEACON_OF_LIGHT_HEAL.id) {
      return;
    }
    if (event.originalHeal.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.critEffectBonus.getBonus(event.originalHeal);
    const rawDrapeHealing = rawNormalPart * DRAPE_OF_SHAME_CRIT_EFFECT;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }

  item() {
    const estimatedItemLevel = this.estimatedItemLevel;
    return {
      item: ITEMS.DRAPE_OF_SHAME,
      result: (
        <React.Fragment>
          <ItemHealingDone amount={this.healing} /><br />
          <img
            src="/img/ilvl.png"
            alt="Item level"
            className="icon"
          />{' '}{estimatedItemLevel !== null ? `≈${estimatedItemLevel} cloak with similar stats` : 'Calculating...'}
        </React.Fragment>
      ),
    };
  }
}

export default DrapeOfShame;
