import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import Mastery from '../Core/Mastery';

class T21_2Set extends Analyzer {
  static dependencies = {
    mastery: Mastery,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RESTO_DRUID_T21_2SET_BONUS_BUFF.id);
  }

  item() {
    const directHealing = this.mastery.getDirectHealing(SPELLS.DREAMER.id);
    const directPercent = this.owner.getPercentageOfTotalHealingDone(directHealing);

    const masteryHealing = this.mastery.getMasteryHealing(SPELLS.DREAMER.id);
    const masteryPercent = this.owner.getPercentageOfTotalHealingDone(masteryHealing);

    return {
      id: `spell-${SPELLS.RESTO_DRUID_T21_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTO_DRUID_T21_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTO_DRUID_T21_2SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`This set bonus causes your Ysera's Gift passive to apply the Dreamer HoT, which gives a mastery stack in addition to healing directly. The displayed healing amount is the sum of the direct healing from Dreamer and the healing enabled by Dreamer's extra mastery stack.
            <ul>
            <li>Direct: <b>${formatPercentage(directPercent)}%</b></li>
            <li>Mastery: <b>${formatPercentage(masteryPercent)}%</b></li>
            </ul>`}
        >
          <ItemHealingDone amount={directHealing + masteryHealing} />
        </dfn>
      ),
    };
  }
}

export default T21_2Set;
