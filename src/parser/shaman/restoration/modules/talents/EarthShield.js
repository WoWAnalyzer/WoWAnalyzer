import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import EarthShieldCore from '../../../shared/talents/EarthShield';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

class EarthShield extends EarthShieldCore {
  static dependencies = {
    ...EarthShieldCore.dependencies,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EARTH_SHIELD_TALENT.id} />}
        value={`${formatPercentage(this.uptimePercent)} %`}
        label="Earth Shield Uptime"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(30)}
      />
    );
  }

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.EARTH_SHIELD_HEAL.id);
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.EARTH_SHIELD_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + this.buffHealing + feeding))} %`}
        valueTooltip={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))}% from the HoT and ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.buffHealing))}% from the healing buff.`}
      />
    );
  }

}

export default EarthShield;
