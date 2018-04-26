import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';
import isAtonement from '../Core/isAtonement';
import AtonementDamageSource from '../Features/AtonementDamageSource';

class TouchOfTheGrave extends Analyzer {
  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
    combatants: Combatants,
  };

  atonementHealing = 0;
  directHealing = 0;
  damage = 0;

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.TOUCH_OF_THE_GRAVE.id) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.TOUCH_OF_THE_GRAVE.id) {
      this.directHealing += event.amount + (event.absorbed || 0);
      return;
    }
    if (!isAtonement(event)) {
      return;
    }
    if (!this.atonementDamageSource.event || this.atonementDamageSource.event.ability.guid !== SPELLS.TOUCH_OF_THE_GRAVE.id) {
      return;
    }
    this.atonementHealing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const atonementHealing = this.atonementHealing || 0;
    const directHealing = this.directHealing || 0;
    const damage = this.damage || 0;

    const atonementPct = this.owner.getPercentageOfTotalHealingDone(atonementHealing);
    const directPct = this.owner.getPercentageOfTotalHealingDone(directHealing);
    const totalPct = atonementPct + directPct;

    // since we can't directly get undead racial status, if we found 0 damage,
    // assume they aren't undead and do not load the module
    if (damage === 0) {
      return null;
    }

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TOUCH_OF_THE_GRAVE.id} />}
        value={this.owner.formatItemHealingDone(atonementHealing + directHealing)}
        label={(
          <dfn data-tip={`
            The Undead racial Touch of the Grave contributed ${formatPercentage(totalPct)}% of the total effective healing done
            (${formatPercentage(atonementPct)}% from Atonement and ${formatPercentage(directPct)}% from direct healing).
            Touch of the Grave also contributed ${formatNumber(damage / this.owner.fightDuration * 1000)} DPS (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))}% of total damage done).`}>
            Touch of the Grave Healing
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default TouchOfTheGrave;
