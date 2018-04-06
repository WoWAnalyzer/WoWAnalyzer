import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from "common/SpellLink";
import ItemDamageDone from 'Main/ItemDamageDone';
import Enemies from 'Parser/Core/Modules/Enemies';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

/*
 * Harpoon applies On the Trail, a unique damage over time effect that deals [ 360% of Attack Power ] damage over until cancelled.
 * Your melee autoattacks extend its duration by 6 sec.
 */

//TODO: Dig through logs and find average uptimes and make suggestions for this
class EaglesBite extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.EAGLES_BITE_TRAIT.id];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ON_THE_TRAIL_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.ON_THE_TRAIL_DAMAGE.id) / this.owner.fightDuration;
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.EAGLES_BITE_TRAIT.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EAGLES_BITE_TRAIT.id} />}
        value={`${formatPercentage(this.uptimePercentage)}%`}
        label="On The Trail uptime"
      />
    );
  }

}

export default EaglesBite;
