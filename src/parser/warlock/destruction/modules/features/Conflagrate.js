import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import CastEfficiency from 'parser/core/modules/CastEfficiency';

import SPELLS from 'common/SPELLS';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

class Conflagrate extends Analyzer {
  static dependencies = {
    castEfficiency: CastEfficiency,
  };

  statistic() {
    const { casts, maxCasts } = this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.CONFLAGRATE.id);
    const missed = maxCasts - casts;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CONFLAGRATE.id} />}
        label="Missed Conflagrate casts"
        value={missed}
        tooltip={`${casts} out of ${maxCasts} possible casts.`}
      />
    );
  }
}

export default Conflagrate;
