import React from 'react';

import Module from 'Parser/Core/Module';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class SoulFragments extends Module {
  static dependencies = {
    abilityTracker: AbilityTracker,
  }

  statistic() {

    const soulFragmentsCasts = this.abilityTracker.getAbility(SPELLS.SOUL_FRAGMENT.id).casts;

    const soulFragmentsCastsPerMinutes = (soulFragmentsCasts / this.owner.fightDuration) * 1000 * 60;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_FRAGMENT.id} />}
        value={`${formatNumber(soulFragmentsCastsPerMinutes)}`}
        label='Soul Fragments per minute'
        tooltip={`The total Soul Fragments generated was ${formatNumber(soulFragmentsCasts)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default SoulFragments;
