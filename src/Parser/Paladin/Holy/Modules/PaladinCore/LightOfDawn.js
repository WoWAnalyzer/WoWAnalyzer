import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import SecondSunrise from '../Traits/SecondSunrise';

class LightOfDawn extends Analyzer {
  static dependencies = {
    secondSunrise: SecondSunrise,
  };

  casts = 0;
  heals = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_CAST.id) {
      return;
    }

    this.casts += 1;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }

    this.heals += 1;
  }
  statistic() {
    const totalCastsIncludingDp = this.casts + this.secondSunrise.procs;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LIGHT_OF_DAWN_CAST.id} />}
        value={`${((this.heals / totalCastsIncludingDp) || 0).toFixed(2)} players`}
        label="Average hits per cast"
        tooltip="This considers Second Sunrise procs as additional casts so that the resulting number does not fluctuate based on your luck. You should consider the delay of Second Sunrise whenever you cast Light of Dawn and keep your aim on point."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(60);
}

export default LightOfDawn;
