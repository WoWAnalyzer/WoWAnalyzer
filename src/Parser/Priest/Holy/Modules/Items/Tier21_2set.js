import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

const HOLY_PRIEST_TIER21_2SET_BUFF_EXPIRATION_BUFFER = 150; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.

const HEALING_BONUS = 0.6;

class Tier21_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;
  procs = {
    [SPELLS.FLASH_HEAL.id]: 0,
    [SPELLS.GREATER_HEAL.id]: 0,
    [SPELLS.BINDING_HEAL_TALENT.id]: 0,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HOLY_PRIEST_T21_2SET_BONUS_BUFF.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const hasBuff = this.combatants.selected.hasBuff(SPELLS.HOLY_PRIEST_ANSWERED_PRAYERS.id, event.timestamp, HOLY_PRIEST_TIER21_2SET_BUFF_EXPIRATION_BUFFER);
    const isBuffedSpell = ((spellId === SPELLS.GREATER_HEAL.id) || (spellId === SPELLS.FLASH_HEAL.id) || (spellId === SPELLS.BINDING_HEAL_TALENT.id));
    if (isBuffedSpell && hasBuff) {
      this.healing += calculateEffectiveHealing(event, HEALING_BONUS);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const hasBuff = this.combatants.selected.hasBuff(SPELLS.HOLY_PRIEST_ANSWERED_PRAYERS.id, event.timestamp, HOLY_PRIEST_TIER21_2SET_BUFF_EXPIRATION_BUFFER);
    if (hasBuff && this.procs[spellId] !== undefined) {
      this.procs[spellId] += 1;
    }
  }

  item() {
    const totalProc = this.procs[SPELLS.FLASH_HEAL.id] + this.procs[SPELLS.GREATER_HEAL.id] + this.procs[SPELLS.BINDING_HEAL_TALENT.id];
    return {
      id: `spell-${SPELLS.HOLY_PRIEST_T21_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HOLY_PRIEST_T21_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HOLY_PRIEST_T21_2SET_BONUS_BUFF.id} icon={false} />,
      result: (
        <dfn data-tip={`A total ${totalProc} procs were used:
        <ul>
        <li>${this.procs[SPELLS.FLASH_HEAL.id]} procs used on Flash Heal</li>
        <li>${this.procs[SPELLS.GREATER_HEAL.id]} procs used on Heal</li>
        <li>${this.procs[SPELLS.BINDING_HEAL_TALENT.id]} procs used on Binding Heal</li>
        </ul>`}>
          <ItemHealingDone amount={this.healing} />
        </dfn>
      ),
    };
  }
}

export default Tier21_2set;
