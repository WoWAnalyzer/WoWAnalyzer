import React from 'react';

import { formatNumber } from 'common/format';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { TooltipElement } from 'common/Tooltip';

//Example log: https://www.warcraftlogs.com/reports/vmAT8ZYtBMJRyWpf/#fight=23&source=14&type=damage-done

class DribblingInkpod extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    buffs: Buffs,
  };

  damage = 0;
  stacks = 0;
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DRIBBLING_INKPOD.id);
    if(!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CONDUCTIVE_INK_DAMAGE), this._damage);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.CONDUCTIVE_INK_DEBUFF), this._debuff);
    this.addEventListener(Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.CONDUCTIVE_INK_DEBUFF), this._debuff);
  }

  _damage(event){
    this.damage += event.amount + event.absorbed || 0;
  }

  _debuff(event){
    this.stacks += 1;
  }


  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.DRIBBLING_INKPOD}>
          <TooltipElement content={`Damage done: ${formatNumber(this.damage)}`}>
            <ItemDamageDone amount={this.damage} />
          </TooltipElement>
          <br />
          <TooltipElement content={`Average damage per stack: ${formatNumber(this.damage / this.stacks)}`}>
            {this.stacks} <small>total stacks gained</small>
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default DribblingInkpod;
