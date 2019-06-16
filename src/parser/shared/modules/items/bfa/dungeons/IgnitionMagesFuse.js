import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';

import Abilities from 'parser/core/modules/Abilities';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import Events from 'parser/core/Events';
import HasteIcon from 'interface/icons/Haste';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatTracker from 'parser/shared/modules/StatTracker';

const ACTIVATION_COOLDOWN = 120; // seconds

/**
  Ignition Mage's Fuse
  Item Level 340
  Binds when picked up
  Unique-Equipped
  Trinket
  +205 Intellect
  Use: Ignite the fuse, gaining 168 Haste every 4 sec. Haste is removed after 20 sec. (2 Min Cooldown)
 */

class IgnitionMagesFuse extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
  };

  statBuff = 0;
  uses = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.IGNITION_MAGES_FUSE.id);
    if(!this.active) {
      return;
    }

    this.statBuff = calculateSecondaryStatDefault(340, 164, this.selectedCombatant.getItem(ITEMS.IGNITION_MAGES_FUSE.id).itemLevel);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IGNITION_MAGES_FUSE_BUFF), this.onUse);

    this.abilities.add({
      spell: SPELLS.IGNITION_MAGES_FUSE_BUFF,
      name: ITEMS.IGNITION_MAGES_FUSE.name,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: ACTIVATION_COOLDOWN,
      castEfficiency: {
        suggestion: true,
      },
    });
  }

  onUse(event) {
    this.uses += 1;
  }

  get utilization(){
    return this.uses / this.possibleUseCount;
  }

  get getAverageHaste(){
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.IGNITION_MAGES_FUSE_BUFF.id) / this.owner.fightDuration;
    return averageStacks * this.statBuff;
  }

  get possibleUseCount() {
    return Math.ceil(this.owner.fightDuration / (ACTIVATION_COOLDOWN * 1000));
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.IGNITION_MAGES_FUSE_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            You activated your Ingntion Mage's Fuse <b>{this.uses}</b> of <b>{this.possibleUseCount}</b> possible time{this.uses === 1 ? '' : 's'}.<br />
            Buff uptime was {formatPercentage(this.uptime, 0)}%, utilization was {formatPercentage(this.utilization, 0)}%.
          </>
        )}
      >
        <BoringItemValueText item={ITEMS.IGNITION_MAGES_FUSE}>
          <HasteIcon /> {formatNumber(this.getAverageHaste)} <small>Average Haste gained</small> <br />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}


export default IgnitionMagesFuse;
