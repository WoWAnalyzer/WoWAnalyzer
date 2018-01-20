import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import DreamerAttributor from '../Core/HotTracking/DreamerAttributor';

class T21_2Set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    dreamerAttributor: DreamerAttributor,
  };

  has4pc = false;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RESTO_DRUID_T21_2SET_BONUS_BUFF.id);
    this.has4pc = this.combatants.selected.hasBuff(SPELLS.RESTO_DRUID_T21_4SET_BONUS_BUFF.id);
  }

  get directHealing() {
    return this.dreamerAttributor.t212p.healing;
  }
  get masteryHealing() {
    return this.dreamerAttributor.t212p.masteryHealing;
  }
  get totalHealing() {
    return this.directHealing + this.masteryHealing;
  }

  item() {
    return {
      id: `spell-${SPELLS.RESTO_DRUID_T21_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTO_DRUID_T21_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTO_DRUID_T21_2SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`This set bonus causes your Ysera's Gift passive to apply the Dreamer HoT, which gives a mastery stack in addition to healing directly. The displayed healing amount is the sum of the direct healing from Dreamer and the healing enabled by Dreamer's extra mastery stack. ${this.has4pc ? `<i>These numbers count only HoTs procced from 'natural' Ysera's Gift ticks. HoTs procced from extra Ysera's Gifts caused by the 4pc are attributed to the 4pc</i>` : ''}
            <ul>
            <li>Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.directHealing))}%</b></li>
            <li>Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.masteryHealing))}%</b></li>
            </ul>`}
        >
          <ItemHealingDone amount={this.totalHealing} />
        </dfn>
      ),
    };
  }
}

export default T21_2Set;
