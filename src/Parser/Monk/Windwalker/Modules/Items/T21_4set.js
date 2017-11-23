import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

class T21_4set extends Analyzer {
 static dependencies = {
   combatants: Combatants,
 };

 damage = 0;

 on_initialized() {
     this.active = this.combatants.selected.hasBuff(SPELLS.WW_TIER21_4PC.id);
 }

 on_byPlayer_damage(event) {
   const spellId = event.ability.guid;

   if (spellId === SPELLS.BLACKOUT_KICK.id && this.combatants.selected.hasBuff(SPELLS.COMBO_BREAKER_BUFF.id, event.timestamp, 32, 0)) {
       this.damage += calculateEffectiveDamage(event, 1.75);
    }
 }

// The damage bonus is reportedly not currently working with SEF clones, this is expected to be a bug and this might be relevant if fixed
// on_byPlayerPet_damage(event) {
//    const spellId = event.ability.guid;
//     
//    if (spellId === SPELLS.BLACKOUT_KICK.id && this.combatants.selected.hasBuff(SPELLS.COMBO_BREAKER_BUFF.id, event.timestamp, 2000, 0)) {
//       this.damage += calculateEffectiveDamage(event, 1.75);
//    }
//  }

 item() {
     return {
         id: `spell-${SPELLS.WW_TIER21_4PC.id}`,
         icon: <SpellIcon id={SPELLS.WW_TIER21_4PC.id} />,
         title: <SpellLink id={SPELLS.WW_TIER21_4PC.id} />,
         result: this.owner.formatItemDamageDone(this.damage),
     };
 }
}

export default T21_4set;
