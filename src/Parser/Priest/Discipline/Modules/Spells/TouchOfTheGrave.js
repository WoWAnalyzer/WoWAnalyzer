import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage, formatNumber } from 'common/format';

import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';
import isAtonement from '../Core/isAtonement';
import AtonementSource from '../Features/AtonementSource';

class TouchOfTheGrave extends Analyzer {
  static dependencies = {
    atonementSource: AtonementSource,
    combatants: Combatants,
  };

  healing = 0;
  damage = 0;

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.TOUCH_OF_THE_GRAVE.id) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }
  on_byPlayer_heal(event) {
    if (!isAtonement(event)) {
      return;
    }
    if (this.atonementSource.atonementDamageSource) {
      if (this.atonementSource.atonementDamageSource.ability.guid !== SPELLS.TOUCH_OF_THE_GRAVE.id) {
        return;
      }
      this.healing += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    const healing = this.healing || 0;
    const damage = this.damage || 0;
    
    // since we can't directly get undead racial status, if we found 0 damage, 
    // assume they aren't undead and do not load the module
    if(damage === 0) { return; }

    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TOUCH_OF_THE_GRAVE.id} />}
        value={`${formatNumber(healing / this.owner.fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`The effective healing contributed by the Undead racial Touch of the Grave (${formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))}% of total healing done). Touch of the Grave also contributed ${formatNumber(damage / this.owner.fightDuration * 1000)} DPS (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))}% of total damage done).`}>
            Touch of the Grave healing
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default TouchOfTheGrave;
