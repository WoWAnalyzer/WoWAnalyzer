import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import ItemDamageDone from 'Main/ItemDamageDone';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';

/**
 * Howling Blast damage increased by 15% and Obliterate damage increased by 15% and Frostscythe damage increased by 15%
 */

const DAMAGE_BONUS = 0.15;

class Tier21_2p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  obliterateDamage = 0;
  howlingblastDamage = 0;
  frostscytheDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.FROST_DEATH_KNIGHT_T21_2SET_BONUS.id);
  }

  on_byPlayer_damage(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.OBLITERATE_MAIN_HAND_DAMAGE.id || spellId === SPELLS.OBLITERATE_OFF_HAND_DAMAGE){
      this.obliterateDamage += getDamageBonus(event, DAMAGE_BONUS);
      return;
    }
    if(spellId === SPELLS.HOWLING_BLAST.id){
      this.howlingblastDamage += getDamageBonus(event, DAMAGE_BONUS);
      return;
    }
    if(spellId === SPELLS.FROSTSCYTHE_TALENT.id){
      this.frostscytheDamage += getDamageBonus(event, DAMAGE_BONUS);
      return;
    }
  }

  item() {
    const damage = this.obliterateDamage + this.howlingblastDamage + this.frostscytheDamage;
    return {
      id: `spell-${SPELLS.FROST_DEATH_KNIGHT_T21_2SET_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.FROST_DEATH_KNIGHT_T21_2SET_BONUS.id} />,
      title: <SpellLink id={SPELLS.FROST_DEATH_KNIGHT_T21_2SET_BONUS.id} icon={false} />,
      result: <dfn data-tip={`<ul>
        <li> Obliterate bonus damage: ${formatNumber(this.obliterateDamage)} </li>
        <li> Howling Blast bonus damage: ${formatNumber(this.howlingblastDamage)} </li>
        <li> Frostscythe bonus damage: ${formatNumber(this.frostscytheDamage)} </li>
      </ul>`}><ItemDamageDone amount={damage} /></dfn>,
    };
  }
}

export default Tier21_2p;
