import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatPercentage } from 'common/format';
import { formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import UptimeIcon from 'interface/icons/Uptime';
import HasteIcon from 'interface/icons/Haste';
import Events from 'parser/core/Events';

/**
* Sea Giant's Tidestone
* Item Level 280
* Binds when picked up
* Unique-Equipped
* Trinket
* +117 Intellect
* Use: Increase your Haste by 372 for 12 sec. (1 Min, 30 Sec Cooldown)
 *
 * Testing Log: /report/ABH7D8W1Qaqv96mt/2-Mythic+Taloc+-+Kill+(4:12)/Bluemyself
 */

class SeaGiantsTidestone extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
  };

  casts = 0;
  haste = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(
      ITEMS.SEA_GIANTS_TIDESTONE.id,
    );
    if (this.active) {
      this.haste = calculateSecondaryStatDefault(370, 985, this.selectedCombatant.getItem(ITEMS.SEA_GIANTS_TIDESTONE.id).itemLevel);

      this.abilities.add({
        spell: SPELLS.FEROCITY_OF_THE_SKROG,
        name: ITEMS.SEA_GIANTS_TIDESTONE.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      });

      this.statTracker.add(SPELLS.FEROCITY_OF_THE_SKROG.id, {
        haste: this.haste,
      });
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FEROCITY_OF_THE_SKROG), this.onCast);
  }

  onCast(event) {
    this.casts += 1;
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FEROCITY_OF_THE_SKROG.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={<>Used {this.casts} times</>}
      >
        <BoringItemValueText item={ITEMS.SEA_GIANTS_TIDESTONE}>
          <UptimeIcon /> {formatPercentage(this.totalBuffUptime)}% <small>uptime</small> <br />
          <HasteIcon /> {formatNumber(this.haste * this.totalBuffUptime)} <small>average Haste gained</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default SeaGiantsTidestone;
