import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringValueText from 'interface/statistics/components/BoringValueText';
import Enemies from 'parser/shared/modules/Enemies';

/**
 * Find Weakness
 * Your Shadowstrike and Cheap Shot abilities reveal a flaw in your target's defenses, causing all your attacks to bypass 30%  of that enemy's armor for 18 sec.
 */
class FindWeakness extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  statistic() {
    const uptime = this.enemies.getBuffUptime(SPELLS.FIND_WEAKNESS.id) / this.owner.fightDuration;
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringValueText label={<><SpellIcon id={SPELLS.FIND_WEAKNESS.id} /> Find Weakness Uptime</>}>
          {formatPercentage(uptime)} %
        </BoringValueText>
      </Statistic>
    );
  }
}

export default FindWeakness;
