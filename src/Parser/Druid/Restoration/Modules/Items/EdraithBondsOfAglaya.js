import React from 'react';

import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import ItemHealingDone from 'Main/ItemHealingDone';

import HotTracker from '../Core/HotTracking/HotTracker';

const EXTENSION_AMOUNT = 10000;

/*
 * Edraith, Bonds of Aglaya
 * Equip: Swiftmend extends the duration of your heal over time effects on the target by 10 sec.
 */
 // TODO specifically check / suggest for CW extension
class EdraithBondsOfAglaya extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTracker,
  };

  attribution = {
    name: "Edraith, Bonds of Aglaya",
    healing: 0,
    masteryHealing: 0,
    dreamwalkerHealing: 0,
    procs: 0,
    amount: 0,
  };

  smCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.EDRAITH_BONDS_OF_AGLAYA.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SWIFTMEND.id) {
      return;
    }

    this.smCasts += 1;

    const targetId = event.targetID;
    if (!targetId || !this.hotTracker.hots[targetId]) {
      return;
    }

    Object.keys(this.hotTracker.hots[targetId]).forEach(spellIdString => {
      const spellId = Number(spellIdString);
      this.hotTracker.addExtension(this.attribution, EXTENSION_AMOUNT, targetId, spellId);
    });
  }

  get totalHealing() {
    return this.attribution.healing + this.attribution.masteryHealing + this.attribution.dreamwalkerHealing;
  }

  get extensionsPerCast() {
    return this.smCasts === 0 ? 0 : (this.attribution.procs / this.smCasts);
  }

  item() {
    return {
      item: ITEMS.EDRAITH_BONDS_OF_AGLAYA,
      result: (
        <dfn data-tip={`You extended <b>${this.attribution.procs}</b> HoTs over ${this.smCasts} swiftmend casts. The healing that extra HoT time did can be broken down as follows:
          <ul>
          <li>Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.attribution.healing))}%</b></li>
          <li>Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.attribution.masteryHealing))}%</b></li>
          <li>Dreamwalker: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.attribution.dreamwalkerHealing))}%</b></li>
          </ul>
        `}>
          <ItemHealingDone amount={this.totalHealing} />
        </dfn>
      ),
    };
  }

}

export default EdraithBondsOfAglaya;
