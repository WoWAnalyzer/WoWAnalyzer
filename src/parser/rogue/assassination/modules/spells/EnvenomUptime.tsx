import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText';

class EnvenomUptime extends Analyzer {
  get percentUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ENVENOM.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringValueText label={<><SpellIcon id={SPELLS.ENVENOM.id} /> Envenom Uptime</>}>
          {formatPercentage(this.percentUptime)} %
        </BoringValueText>
      </Statistic>
    );
  }

}

export default EnvenomUptime;
