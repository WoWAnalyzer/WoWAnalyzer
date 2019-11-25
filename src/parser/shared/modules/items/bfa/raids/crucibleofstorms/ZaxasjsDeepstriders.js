import React from 'react';

import { formatNumber } from 'common/format';

import ITEMS from 'common/ITEMS/index';
import SPELLS from 'common/SPELLS/index';

import Analyzer from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import StatTracker from 'parser/shared/modules/StatTracker';
import SpeedIcon from 'interface/icons/Speed';

// Example log: https://www.warcraftlogs.com/reports/6xHLtAFW4yC73mRD/#fight=28&source=2

class ZaxasjsDeepstriders extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  static speedRating = 200; //doesnt scale with ilvl

  damageAbsorbed = 0;
  shieldCount = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasFeet(ITEMS.ZAXASJS_DEEPSTRIDERS.id);
    if(!this.active){
      return;
    }
    this.statTracker.add(SPELLS.DEEPSTRIDER.id, {
      speed: this.constructor.speedRating,
    });
  }

  get averageSpeed(){
    return (this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.DEEPSTRIDER.id) / this.owner.fightDuration) * this.constructor.speedRating;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.ZAXASJS_DEEPSTRIDERS}>
          <SpeedIcon /> {formatNumber(this.averageSpeed)} <small>average Speed gained</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

}

export default ZaxasjsDeepstriders;
