import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';

const HOLY_PRIEST_TIER21_2SET_BUFF_EXPIRATION_BUFFER = 150; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.

const HEALING_BONUS = 0.6;

class Tier21_2set extends Analyzer {

  healing = 0;
  procFH = 0;
  procGH = 0;
  procBH = 0;

  on_initialized() {
      this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.HOLY_PRIEST_T21_2SET_BONUS_BUFF.id);
  }

  on_byPlayer_heal(event) {
      const spellId = event.ability.guid;
      const hasBuff = this.owner.modules.combatants.selected.hasBuff(SPELLS.HOLY_PRIEST_T21_2SET_BUFF.id, event.timestamp, HOLY_PRIEST_TIER21_2SET_BUFF_EXPIRATION_BUFFER);
      const isBuffedSpell = ((spellId === SPELLS.GREATER_HEAL.id) || (spellId === SPELLS.FLASH_HEAL.id) || (spellId === SPELLS.BINDING_HEAL_TALENT.id));
      if (isBuffedSpell && hasBuff) {
          this.healing += ((event.amount || 0) + (event.absorbed || 0)) / (1 + HEALING_BONUS) * HEALING_BONUS;  
      }
  }

  on_byPlayer_cast(event) {
      const spellId = event.ability.guid;
      const hasBuff = this.owner.modules.combatants.selected.hasBuff(SPELLS.HOLY_PRIEST_T21_2SET_BUFF.id, event.timestamp, HOLY_PRIEST_TIER21_2SET_BUFF_EXPIRATION_BUFFER);
      if (hasBuff) {
          if (spellId === SPELLS.FLASH_HEAL.id) {
              this.procFH += 1;
          }
          else if (spellId === SPELLS.GREATER_HEAL.id) {
              this.procGH += 1;
          }
          else if (spellId === SPELLS.BINDING_HEAL_TALENT.id) {
              this.procBH += 1;
          } 
      }
  }

  item() {
      const totalProc = this.procFH + this.procGH + this.procBH;
      return {
     id: `spell-${SPELLS.HOLY_PRIEST_T21_2SET_BONUS_BUFF.id}`,
     icon: <SpellIcon id={SPELLS.HOLY_PRIEST_T21_2SET_BONUS_BUFF.id} />,
     title: <SpellLink id={SPELLS.HOLY_PRIEST_T21_2SET_BONUS_BUFF.id} />,
     result: (
        <dfn data-tip={`A total ${totalProc} procs were used: <br>
        - ${this.procFH} procs used on Flash Heal<br>
        - ${this.procGH} procs used on Heal<br>
        - ${this.procBH} procs used on Binding Heal`}>
        {this.owner.formatItemHealingDone(this.healing)}
        </dfn>
      ),
    };
  }
}

export default Tier21_2set;
