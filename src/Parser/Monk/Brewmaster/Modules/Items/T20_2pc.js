import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { BREWS, GIFT_OF_THE_OX_SPELLS } from '../../Constants';

const debug = false;
const SUMMON_LATENCY = 5;

class T20_2pc extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  lastTrigger = 0;
  lastOrb = 0;
  brewCount = 0;
  hastCastNewBrew = false;
  orbTriggeredBy2Pc = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF_BRM.id);
    this.active && debug && console.log('You have the 2pc');
  }

  // Unfortunately the spell is no different is summoned by 2pc than any other proc - Dup @ Peak of Serenity
  // So have to look at time cast and if its very close to using a brew (above) its a proc, this is not perfect but very close.
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (BREWS.includes(spellId)) {
      this.lastTrigger = event.timestamp;
      this.brewCount += 1;
      this.hastCastNewBrew = true;
    }
    if (GIFT_OF_THE_OX_SPELLS.includes(spellId)) {
      this.lastOrb = event.timestamp;
    }
    if (this.hastCastNewBrew && Math.abs(this.lastTrigger - this.lastOrb) <= SUMMON_LATENCY) {
      this.orbTriggeredBy2Pc += 1;
      this.hastCastNewBrew = false;
    }
  }

  on_finished() {
    if (debug) {
      console.log('T20 2pc potential triggers: ', this.brewCount);
      console.log('T20 2pc triggers: ', this.orbTriggeredBy2Pc);
      console.log('T20 2pc triggers: ', formatPercentage(this.orbTriggeredBy2Pc / this.brewCount));
    }
  }

  item() {
    const procRate = formatPercentage(this.orbTriggeredBy2Pc / this.brewCount);
    return {
      id: `spell-${SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF_BRM.id}`,
      icon: <SpellIcon id={SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF_BRM.id} />,
      title: <SpellLink id={SPELLS.XUENS_BATTLEGEAR_2_PIECE_BUFF_BRM.id} icon={false} />,
      result: (
        <dfn data-tip={`The 2pc set bonus caused <b>${this.orbTriggeredBy2Pc}</b> additional Gift of the Ox orbs to spawn.</br>
        This was from a total of <b>${this.brewCount}</b> brew casts, a rate of <b>${Math.round(procRate)}%</b>.`}
        >
          {this.orbTriggeredBy2Pc} extra Gift of the Ox Orbs
        </dfn>
      ),
    };
  }
}

export default T20_2pc;
