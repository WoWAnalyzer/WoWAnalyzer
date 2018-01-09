import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const DAMAGE_BONUS = 0.1;

/**
 * Balance Druid Tier21 2set
 * Increases the damage of Starfall, Starsurge and Echoing Stars by 10%.
 */
class Tier21_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  starsurgeDamage = 0;
  starfallDamage = 0;

  on_initialized() {
	this.active = this.combatants.selected.hasBuff(SPELLS.BALANCE_DRUID_T21_2SET_BONUS_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.STARSURGE_MOONKIN.id) {
      this.starsurgeDamage += getDamageBonus(event, DAMAGE_BONUS);
    }
    if (event.ability.guid === SPELLS.STARFALL.id || event.ability.guid === SPELLS.ECHOING_STARS.id){
      this.starfallDamage += getDamageBonus(event, DAMAGE_BONUS);
    }
  }

  item() {
    return {
      id: SPELLS.BALANCE_DRUID_T21_2SET_BONUS_BUFF.id,
      icon: <SpellIcon id={SPELLS.BALANCE_DRUID_T21_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.BALANCE_DRUID_T21_2SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`Damage Breakdown:
          <ul>
            <li>Starsurge: <b>${this.owner.formatItemDamageDone(this.starsurgeDamage)}</b></li>
            <li>Starfall: <b>${this.owner.formatItemDamageDone(this.starfallDamage)}</b></li>
          </ul>
        `}>
          <ItemDamageDone amount={this.starsurgeDamage + this.starfallDamage} />
        </dfn>
      ),
    };
  }
}

export default Tier21_2set;
