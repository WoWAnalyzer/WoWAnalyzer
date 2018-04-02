import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatDuration } from 'common/format';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';

const REGULAR_RADIANCE_COOLDOWN_MS = 18000;
const T212SET_RADIANCE_COOLDOWN_MS = 15000;

class Tier21_2set extends Analyzer {

  grossTimeSaved = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id);
  }

  on_byPlayer_cast(event){

    const spellId = event.ability.guid;
    if (spellId !== SPELLS.POWER_WORD_RADIANCE.id) {
      return;
    }

    //  If the power word radiance cast is made in the last 15 seconds of the fight
    //  we ignore it since it did not benefit from the bonus
    if(this.owner.fight.end_time - event.timestamp < T212SET_RADIANCE_COOLDOWN_MS){
      return;
    }

    this.grossTimeSaved += (REGULAR_RADIANCE_COOLDOWN_MS - T212SET_RADIANCE_COOLDOWN_MS);
  }

  item() {
    return {
      id: `spell-${SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id}`,
      icon: <SpellIcon id={SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id} />,
      title: <SpellLink id={SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id} />,
      result: (
        <Wrapper>
          {formatDuration(this.grossTimeSaved / 1000)} total Cooldown Reduction.
        </Wrapper>
      ),
    };
  }
}

export default Tier21_2set;
