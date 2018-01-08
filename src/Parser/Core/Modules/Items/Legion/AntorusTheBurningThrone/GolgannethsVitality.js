import React from 'react';

import ITEMS from 'common/ITEMS/OTHERS';
import SPELLS from 'common/SPELLS/OTHERS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';
import { formatNumber, formatPercentage } from 'common/format';

/*
 * Golganneth's Vitality
 * Equip: Your damaging abilities have a chance to create a Ravaging Storm at your target's location, inflicting (87377 * 6) Nature damage split among all enemies within 6 yds over 6 sec.
 *
 * Golganneth's Thunderous Wrath
 * When empowered by the Pantheon, your autoattacks cause an explosion of lightning dealing [1 * (Mainhand weapon base speed) * 47857] Nature damage to all enemies within 8 yds of the target. Lasts 15 sec.
 *
 */
class GolgannethsVitality extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;
  normalDamage = 0;
  empoweredDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.GOLGANNETHS_VITALITY.id);
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.GOLGANNETHS_VITALITY_RAVAGING_STORM.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.normalDamage += event.amount + (event.absorbed || 0);
    }
    if (spellID === SPELLS.GOLGANNETHS_VITALITY_THUNDEROUS_WRATH.id) {
      this.damage += event.amount + (event.absorbed || 0);
      this.empoweredDamage += event.amount + (event.absorbed || 0);
    }
  }

  get empoweredProcUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.GOLGANNETHS_VITALITY_THUNDEROUS_WRATH_BUFF.id) / this.owner.fightDuration;
  }

  get normalProcUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.GOLGANNETHS_VITALITY_MARK_OF_GOLGANNETH.id) / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.GOLGANNETHS_VITALITY,
      result: (
        <dfn data-tip={`This shows a breakdown of the damage contribution of this trinket: <ul>
    <li>Normal:
      <ul>
      <li> ${formatPercentage(this.normalProcUptime)}% uptime</li>
      <li> ${formatNumber(this.normalDamage)} damage</li>
      </ul>
    </li>
    <li>Empowered:
      <ul>
      <li> ${formatPercentage(this.empoweredProcUptime)}%</li>
      <li> ${formatNumber(this.empoweredDamage)} damage</li>
      </ul>
    </li>
  </ul>`}>
          <ItemDamageDone amount={this.damage} />
        </dfn>
      ),
    };
  }
}

export default GolgannethsVitality;
