import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import DreamerAttributor from '../Core/HotTracking/DreamerAttributor';

const T21_4SET_YSERAS_BOOST = 5;

class T21_4Set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    dreamerAttributor: DreamerAttributor,
  };

  yserasDuringAwakenedHealing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RESTO_DRUID_T21_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const amount = event.amount + (event.absorbed || 0);

    if (this.combatants.selected.hasBuff(SPELLS.AWAKENED.id) &&
      (spellId === SPELLS.YSERAS_GIFT_OTHERS.id || spellId === SPELLS.YSERAS_GIFT_SELF.id)) {
      this.yserasDuringAwakenedHealing += amount;
    }
  }

  get yserasHealing() {
    return this.yserasDuringAwakenedHealing * (1 - (1 / T21_4SET_YSERAS_BOOST));
  }

  // these track the HoTs attributable to the extra Ysera's ticks
  get directHealing() {
    return this.dreamerAttributor.t214p.healing;
  }
  get masteryHealing() {
    return this.dreamerAttributor.t214p.masteryHealing;
  }
  get totalHealing() {
    return this.yserasHealing + this.directHealing + this.masteryHealing;
  }

  item() {
    return {
      id: `spell-${SPELLS.RESTO_DRUID_T21_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTO_DRUID_T21_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTO_DRUID_T21_4SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`This is the amount of healing done by the <i>extra</i> Ysera's Gift ticks AND by the <i>extra</i> Dreamer HoTs procced by those ticks. Dreamer gives a mastery stack, so the extra healing enabled by that stack is also counted.
        <ul>
          <li>Ysera's Gift: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.yserasHealing))}%</b></li>
          <li>Dreamer Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.directHealing))}%</b></li>
          <li>Dreamer Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.masteryHealing))}%</b></li>
        </ul>
        `}>
          <ItemHealingDone amount={this.totalHealing} />
        </dfn>
      ),
    };
  }
}

export default T21_4Set;
