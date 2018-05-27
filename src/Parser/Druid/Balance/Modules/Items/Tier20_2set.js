import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const DAMAGE_BONUS = 0.15;

/**
 * Balance Druid Tier20 2set
 * Starsurge Critial Strike Damage increased by 30% (additive).
 */
class Tier20_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
	this.active = this.combatants.selected.hasBuff(SPELLS.BALANCE_DRUID_T20_2SET_BONUS_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (event.hitType !== HIT_TYPES.CRIT || event.ability.guid !== SPELLS.STARSURGE_MOONKIN.id) {
      return;
    }
    this.damage += getDamageBonus(event, DAMAGE_BONUS);
  }

  item() {
    return {
      id: SPELLS.BALANCE_DRUID_T20_2SET_BONUS_BUFF.id,
      icon: <SpellIcon id={SPELLS.BALANCE_DRUID_T20_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.BALANCE_DRUID_T20_2SET_BONUS_BUFF.id} icon={false} />,
      result: (
        <dfn data-tip="This does not take into account any potential damage gained from having 30 more maximum Astral Power.">
          <ItemDamageDone amount={this.damage} />,
        </dfn>
      ),
    };
  }
}

export default Tier20_2set;
