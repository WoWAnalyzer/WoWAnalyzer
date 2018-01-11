import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';
import RejuvenationAttributor from '../Core/HotTracking/RejuvenationAttributor';
import RegrowthAttributor from '../Core/HotTracking/RegrowthAttributor';

class PowerOfTheArchdruid extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    rejuvenationAttributor: RejuvenationAttributor,
    regrowthAttributor: RegrowthAttributor,
  };

  get directRejuvenationHealing() {
    return this.rejuvenationAttributor.powerOfTheArchdruid.healing;
  }
  get masteryRejuvenationHealing() {
    return this.rejuvenationAttributor.powerOfTheArchdruid.masteryHealing;
  }
  get totalRejuvenationHealing() {
    return this.directRejuvenationHealing + this.masteryRejuvenationHealing;
  }
  get rejuvenationProcs() {
    return this.rejuvenationAttributor.powerOfTheArchdruid.procs;
  }

  get directRegrowthHealing() {
    return this.regrowthAttributor.powerOfTheArchdruid.healing;
  }
  get masteryRegrowthHealing() {
    return this.regrowthAttributor.powerOfTheArchdruid.masteryHealing;
  }
  get totalRegrowthHealing() {
    return this.directRegrowthHealing + this.masteryRegrowthHealing;
  }
  get regrowthProcs() {
    return this.regrowthAttributor.powerOfTheArchdruid.procs;
  }

  get totalHealing() {
    return this.totalRejuvenationHealing + this.totalRegrowthHealing;
  }

  statistic() {
    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.POWER_OF_THE_ARCHDRUID.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalHealing))} %`}
        label="Power of the Archdruid"
        tooltip={`
          You procced <b>${this.rejuvenationProcs}</b> Rejuvenations, which did <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalRejuvenationHealing))}%</b> healing.
            <ul>
            <li>Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.directRejuvenationHealing))}%</b></li>
            <li>Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.masteryRejuvenationHealing))}%</b></li>
            </ul>
          You procced <b>${this.regrowthProcs}</b> Regrowths, which did <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalRegrowthHealing))}%</b> healing.
            <ul>
            <li>Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.directRegrowthHealing))}%</b></li>
            <li>Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.masteryRegrowthHealing))}%</b></li>
            </ul>
            `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);


}

export default PowerOfTheArchdruid;
