import React from 'react';

import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import ShadowDance from './../Features/ShadowDance';
import DarkShadow from './DarkShadow';


class DarkShadowContribution extends DarkShadow {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
    shadowDance: ShadowDance,
  };

  statistic() {    
    const danceDamage = this.shadowDance.totalDamageDoneInShadowDance * 0.3 / 1.3;
    return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.DARK_SHADOW_TALENT.id} />}
          value={`${formatNumber(danceDamage / this.owner.fightDuration * 1000)} DPS`}
          label="Increased from Dark Shadow talent"
          tooltip={`Total damage increase is ${formatNumber(danceDamage)} in ${this.shadowDance.totalShadowDanceCast} Shadow Dance casts.`}
          />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default DarkShadowContribution;
