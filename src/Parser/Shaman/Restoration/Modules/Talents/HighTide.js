import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const HEAL_WINDOW_MS = 100;
const bounceReduction = 0.7;
const bounceReductionHighTide = 0.85;

class HighTide extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healing = 0;
  chainHealBounce = 0;
  chainHealTimestamp = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HIGH_TIDE_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CHAIN_HEAL.id) {
      return;
    }

    // resets the bounces to 0 if its a new chain heal, can't use the cast event for this as its often somewhere in the middle of the healing events
    if(!this.chainHealTimestamp || event.timestamp - this.chainHealTimestamp > HEAL_WINDOW_MS) {
      this.chainHealTimestamp = event.timestamp;
      this.chainHealBounce = 0;
    }

    const FACTOR_CONTRIBUTED_BY_HT_HIT = (1-(Math.pow(bounceReduction,this.chainHealBounce) / Math.pow(bounceReductionHighTide,this.chainHealBounce)));

    if(this.chainHealBounce === 4) {
      this.healing += event.amount;
    } else {
      this.healing += event.amount * FACTOR_CONTRIBUTED_BY_HT_HIT;
    }

    this.chainHealBounce++;
  }

  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HIGH_TIDE_TALENT.id} />}
        value={`${(formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing)))} %`}
        label={(
          <dfn data-tip="The percentage of your healing that is caused by High Tide.">

            High Tide healing
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(70);

}

export default HighTide;

