import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import ItemHealingDone from 'Main/ItemHealingDone';

import RejuvenationAttributor from '../Core/HotTracking/RejuvenationAttributor';

class T19_4Set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    rejuvenationAttributor: RejuvenationAttributor,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RESTO_DRUID_T19_4SET_BONUS_BUFF.id);
  }

  get directHealing() {
    return this.rejuvenationAttributor.t194p.healing;
  }
  get masteryHealing() {
    return this.rejuvenationAttributor.t194p.masteryHealing;
  }
  get totalHealing() {
    return this.directHealing + this.masteryHealing;
  }
  get procs() {
    return this.rejuvenationAttributor.t194p.procs;
  }

  item() {
    return {
      id: `spell-${SPELLS.RESTO_DRUID_T19_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTO_DRUID_T19_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTO_DRUID_T19_4SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`You procced <b>${this.procs}</b> Rejuvenations. This is the sum of the direct healing from those Rejuvernations and the healing enabled by their extra mastery stacks.
            <ul>
            <li>Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.directHealing))}%</b></li>
            <li>Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.masteryHealing))}%</b></li>
            </ul>`}>
          <ItemHealingDone amount={this.totalHealing} />
        </dfn>
      ),
    };
  }
}

export default T19_4Set;
