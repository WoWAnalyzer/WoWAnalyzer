import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

class EnvenomUptime extends Analyzer {
  get percentUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ENVENOM.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.GENERAL}>
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.ENVENOM.id} /> Envenom Uptime
            </>
          }
        >
          {formatPercentage(this.percentUptime)}%
        </BoringValueText>
      </Statistic>
    );
  }
}

export default EnvenomUptime;
