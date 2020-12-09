import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import BoringValueText from 'interface/statistics/components/BoringValueText';

class ShadowBladesUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  statistic() {
    const shadowBladesUptime = this.selectedCombatant.getBuffUptime(SPELLS.SHADOW_BLADES.id) / this.owner.fightDuration;
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringValueText label={<><SpellIcon id={SPELLS.SHADOW_BLADES.id} /> Shadow Blades Uptime</>}>
          {formatPercentage(shadowBladesUptime)} %
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ShadowBladesUptime;
