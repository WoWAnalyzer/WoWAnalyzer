import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatThousands } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

import { GIFT_OF_THE_OX_SPELLS } from '../../constants';

const debug = false;

class T20_4pc extends Analyzer {
  staggerSaved = 0;
  orbsEaten = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM.id);
    this.active && debug && console.log('You have the 4pc');
  }

  on_removestagger(event) {
    if (!event.trigger.ability || !GIFT_OF_THE_OX_SPELLS.includes(event.trigger.ability.guid)) {
      return;
    }
    this.orbsEaten += 1;
    this.staggerSaved += event.amount;
  }

  on_finished() {
    debug && console.log(`Saved ${this.staggerSaved}`);
    debug && console.log(`Orbs ${this.orbsEaten}`);
  }

  item() {
    const damageSavedPerSecond = this.staggerSaved / (this.owner.fightDuration / 1000);
    return {
      id: `spell-${SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM.id}`,
      icon: <SpellIcon id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM.id} />,
      title: <SpellLink id={SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM.id} icon={false} />,
      result: (
        <dfn data-tip={`Total stagger damage lowered through T20 4pc: ${formatThousands(this.staggerSaved)}`}>
          Stagger lowered by {formatNumber(damageSavedPerSecond)} DPS
        </dfn>
      ),
    };
  }
}

export default T20_4pc;
