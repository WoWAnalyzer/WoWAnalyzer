import React from 'react';

import StatisticBox from 'Main/StatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const PHOTOSYNTHESIS_REJUV_INCREASE = 0.3;

class Photosynthesis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rejuvenationIncrease = 0;
  lifebloomIncrease = 0;

  lastRealBloomTimestamp = null;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PHOTOSYNTHESIS_TALENT.id);
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.LIFEBLOOM_HOT_HEAL.id) {
      this.lastRealBloomTimestamp = event.timestamp;
    }
  }

  on_byPlayer_removebuff(event){
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.LIFEBLOOM_HOT_HEAL.id) {
      return;
    }
    this.lastRealBloomTimestamp = event.timestamp;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const amount = event.amount + (event.absorbed || 0);

    if(spellId === SPELLS.REJUVENATION.id && this.combatants.selected.hasBuff(SPELLS.LIFEBLOOM_HOT_HEAL.id)) {

      // We make sure it's the druid's lifebloom
      if(!this.combatants.selected.getBuff(SPELLS.LIFEBLOOM_HOT_HEAL.id).sourceID === this.combatants.selected.sourceID) {
        return;
      }

      this.rejuvenationIncrease += calculateEffectiveHealing(event, PHOTOSYNTHESIS_REJUV_INCREASE);
    }

    if(spellId === SPELLS.LIFEBLOOM_BLOOM_HEAL.id && (this.lastRealBloomTimestamp === null || (event.timestamp - this.lastRealBloomTimestamp) > 32)){
      this.lifebloomIncrease += amount;
    }
  }

  statistic() {
    const totalPercent = this.owner.getPercentageOfTotalHealingDone(this.rejuvenationIncrease + this.lifebloomIncrease);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PHOTOSYNTHESIS_TALENT.id} />}
        value={`${formatPercentage(totalPercent)} %`}
        label={'Photosynthesis'}
        tooltip={`
            <ul>
              <li>Rejuvenation Bonus: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.rejuvenationIncrease))} %</b></li>
              <li>Lifebloom Bonus: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.lifebloomIncrease))} %</b></li>
            </ul>`}
      />
    );
  }
}

export default Photosynthesis;
