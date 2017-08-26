import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class SoulFragments extends Module {

  statistic() {

    if(this.owner.modules.abilityTracker.abilities[SPELLS.SOUL_FRAGMENT.id]) {

      this.soulFragmentsCasts = this.owner.modules.abilityTracker.abilities[SPELLS.SOUL_FRAGMENT.id].casts;
    }

    return (
      <StatisticBox
        icon={<Icon icon="spell_shadow_soulgem" alt="Soul Fragments Generated" />}
        value={`${formatNumber((this.soulFragmentsCasts / this.owner.fightDuration * 1000) * 60)}`}
        label='Soul Fragments per minute'
        tooltip={`The total Soul Fragments generated was ${formatNumber(this.soulFragmentsCasts)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default SoulFragments;
