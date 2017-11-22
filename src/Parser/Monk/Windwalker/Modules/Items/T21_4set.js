import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class T21_4set extends Analyzer {
 static dependencies = {
        combatants: Combatants,
 };

 comboBreaker = false;
 damage = 0;

 on_initialized() {
     this.active = this.combatants.selected.hasBuff(SPELLS.WW_TIER21_4PC.id);
 }

 // Combo Breaker buff fades after Blackout Kick is cast but before it deals damage
 on_byPlayer_cast(event) {
  const spellId = event.ability.guid;

  if (spellId === SPELLS.BLACKOUT_KICK.id && this.combatants.selected.hasBuff(SPELLS.COMBO_BREAKER_BUFF.id)) {
    this.comboBreaker = true;
  }
 }

 on_byPlayer_damage(event) {
     const spellId = event.ability.guid;

     if (spellId === SPELLS.BLACKOUT_KICK.id && this.comboBreaker === true) {
         this.damage += (event.amount + (event.absorbed || 0))*(175/275);
     }
 }

 on_byPlayerPet_damage(event) {
     const spellId = event.ability.guid;

     if (spellId === SPELLS.BLACKOUT_KICK.id && this.comboBreaker === true) {
         this.damage += event.amount + (event.amount + (event.absorbed || 0)) * (175 / 275);
     }
 }

 item() {
     return {
         id: `spell-${SPELLS.WW_TIER21_4PC.id}`,
         icon: <SpellIcon id={SPELLS.WW_TIER21_4PC.id} />,
         title: <SpellLink id={SPELLS.WW_TIER21_4PC.id} />,
         result: (
             <span>
                 {this.owner.formatItemDamageDone(this.damage)}
             </span>
         ),
     };
 }

}

export default T21_4set;
