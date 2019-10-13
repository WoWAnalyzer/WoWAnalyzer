import React from 'react';

import { formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { TooltipElement } from 'common/Tooltip';

import CriticalStrikeIcon from 'interface/icons/CriticalStrike';

//Example log: https://www.warcraftlogs.com/reports/vmAT8ZYtBMJRyWpf/#fight=23&source=14&type=damage-done

class AshvanesRazorCoral extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    buffs: Buffs,
    statTracker: StatTracker,
  };

  static cooldown = 20; //seconds

  damage = 0;
  stacks = 0;
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.RAZOR_CORAL.id);
    if(!this.active) {
      return;
    }

    const item = this.selectedCombatant.getItem(ITEMS.RAZOR_CORAL.id);
    this.critRating = calculateSecondaryStatDefault(415, 105, item.itemLevel);
    this.statTracker.add(SPELLS.RAZOR_CORAL_BUFF.id, {
      crit: this.critRating,
    });

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAZOR_CORAL_DAMAGE), this._damage);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RAZOR_CORAL_DEBUFF), this._debuff);
    this.addEventListener(Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.RAZOR_CORAL_DEBUFF), this._debuff);

    this.abilities.add({
      spell: SPELLS.RAZOR_CORAL_CAST,
      name: ITEMS.RAZOR_CORAL.name,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      cooldown: this.constructor.cooldown,
      castEfficiency: {
        suggestion: false,
      },
    });

    this.buffs.add({
      spellId: SPELLS.UMBRAL_SHELL.id,
      triggeredBySpellId: SPELLS.UMBRAL_SHELL.id,
    });
  }

  _damage(event){
    this.damage += event.amount + event.absorbed || 0;
  }

  _debuff(event){
    this.stacks += 1;
  }

  get averageBuffStacks() {
    return (this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.RAZOR_CORAL_BUFF.id) / this.owner.fightDuration);
  }

  get averageStat() {
    return this.critRating * this.averageBuffStacks;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.RAZOR_CORAL}>
          <TooltipElement content={`Damage done: ${formatNumber(this.damage)}`}>
            <ItemDamageDone amount={this.damage} />
          </TooltipElement>
          <br />
          {this.stacks} <small>total debuff stacks applied</small>
          <br />
          <TooltipElement content={`Average crit stacks: ${formatNumber(this.averageBuffStacks)}`}>
            <CriticalStrikeIcon /> {formatNumber(this.averageStat)} <small>average Critical Strike</small><br />
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default AshvanesRazorCoral;
