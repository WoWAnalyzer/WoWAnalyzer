import React from 'react';

import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const DARK_TITAN_FINAL_HEALING_INCREASE = 2;

class DarkTitanAdvice extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healingFromBoost = 0;
  healingFromProcs = 0;
  lastRealBloomTimestamp = null;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.THE_DARK_TITANS_ADVICE.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const amount = event.amount + (event.absorbed || 0);

    if (spellId === SPELLS.LIFEBLOOM_BLOOM_HEAL.id) {
      // Add 100% of the bloom if it came from the random 3% procc
      // Let's give it 32 ms tolerence for kicks.
      if (this.lastRealBloomTimestamp !== null && (event.timestamp - this.lastRealBloomTimestamp) < 32) {
        this.healingFromBoost += calculateEffectiveHealing(event, DARK_TITAN_FINAL_HEALING_INCREASE);
      } else {
        this.healingFromProcs += amount;
      }
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.LIFEBLOOM_HOT_HEAL.id) {
      this.lastRealBloomTimestamp = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.LIFEBLOOM_HOT_HEAL.id) {
      this.lastRealBloomTimestamp = event.timestamp;
    }
  }

  item() {
    const total = this.healingFromProcs + this.healingFromBoost;
    const boostPercent = this.owner.getPercentageOfTotalHealingDone(this.healingFromBoost);
    const procsPercent = this.owner.getPercentageOfTotalHealingDone(this.healingFromProcs);

    return {
      item: ITEMS.THE_DARK_TITANS_ADVICE,
      result: (
        <dfn data-tip={`This is the sum of the boosted portion of natrual blooms and the entirety of the proc'd blooms.
          <ul>
          <li>Boost: <b>${formatPercentage(boostPercent)}%</b></li>
          <li>Procs: <b>${formatPercentage(procsPercent)}%</b></li>
          </ul>
        `}>
          {this.owner.formatItemHealingDone(total)}
        </dfn>
      ),
    };
  }

}

export default DarkTitanAdvice;
