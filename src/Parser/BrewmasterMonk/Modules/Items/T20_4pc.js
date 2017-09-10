import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import { GIFT_OF_THE_OX_SPELLS } from '../../Constants';

const BASE_STAGGER_TICKS = 20;
const JEWEL_OF_THE_LOST_ABBEY_TICKS = 6;
const T20_4PC_REDUCTION = 0.95;
const debug = false;

class T20_4pc extends Module {
  static dependencies = {
    combatants: Combatants,
  }

  lastStaggerTick = 0;
  staggerLength = BASE_STAGGER_TICKS;
  staggerSaved = 0;
  orbsEaten = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM.id);
    this.active && debug && console.log('You have the 4pc');
    if (this.combatants.selected.getFinger(ITEMS.JEWEL_OF_THE_LOST_ABBEY.id)) {
      debug && console.log('AND the stagger ring...');
      this.staggerLength += JEWEL_OF_THE_LOST_ABBEY_TICKS;
    }
  }

  on_toPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.STAGGER_TAKEN.id) {
      this.lastStaggerTick = event.amount + (event.absorbed || 0);
    }
  }

  on_toPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (GIFT_OF_THE_OX_SPELLS.indexOf(spellId) !== -1) {
      const currentStagger = this.lastStaggerTick * this.staggerLength;
      this.staggerSaved += currentStagger - (currentStagger * T20_4PC_REDUCTION);
      this.lastStaggerTick *= T20_4PC_REDUCTION;
      this.orbsEaten += 1;
    }
  }

  on_finished() {
    debug && console.log('Saved ' + this.staggerSaved);
    debug && console.log('Orbs ' + this.orbsEaten);
  }

  item() {
    const damageSavedPerSecond = this.staggerSaved / (this.owner.fightDuration / 1000);
    return {
      id: `spell-${SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM.id}`,
      icon: <SpellIcon id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM.id} />,
      title: <SpellLink id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM.id} />,
      result: (
        <dfn data-tip={`Total stagger damage lowered through T20 4Pc: ${formatThousands(this.staggerSaved)}`}>
          Stagger lowered by {formatNumber(damageSavedPerSecond)} DPS
        </dfn>
      ),
    };
  }
}

export default T20_4pc;
