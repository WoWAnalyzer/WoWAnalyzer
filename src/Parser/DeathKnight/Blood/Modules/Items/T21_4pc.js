import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import RuneTracker from '../../../Shared/RuneTracker';

class T21_4pc extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    runeTracker: RuneTracker,
  };

  casts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T21_4SET_BONUS_BUFF.id);
  }

  get runesGained() {
    if(this.runeTracker.buildersObj[SPELLS.RUNE_MASTER.id]){
      return this.runeTracker.buildersObj[SPELLS.RUNE_MASTER.id].generated;
    } else{
      return 0;
    }
  }

  get averageRunesGained() {
    return this.runesGained / this.casts;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.DANCING_RUNE_WEAPON.id) {
      this.casts += 1;
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.BLOOD_DEATH_KNIGHT_T21_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.BLOOD_DEATH_KNIGHT_T21_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T21_4SET_BONUS_BUFF.id} icon={false} />,
      result: (
          <Wrapper>Gave an average of {this.averageRunesGained.toFixed(1)} Runes per <SpellLink id={SPELLS.DANCING_RUNE_WEAPON.id} /> cast.</Wrapper>
      ),
    };
  }
}

export default T21_4pc;
