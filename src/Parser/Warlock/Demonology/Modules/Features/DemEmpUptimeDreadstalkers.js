import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import {formatNumber} from 'common/format';

class DemEmpUptimeDreadstalkers extends Analyzer{
  demonicEmpowermentCount = 0;
  on_initialized(){
  }

  on_toPlayerPet_applybuff(event){
  }

  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.DEMONIC_EMPOWERMENT.id) {
      this.demonicEmpowermentCount += 1;
    }
  }


  suggestions(when){
    when(this.demonicEmpowermentCount).isLessThan(5000)
      .addSuggestion((suggest, actual, recommended) => {
        let ret = suggest(<span>You cast <SpellLink id={SPELLS.DEMONIC_EMPOWERMENT.id}/> a total of {this.demonicEmpowermentCount} times! HOLY FUCKING SHIT!</span>);
        ret = ret.icon(SPELLS.DEMONIC_EMPOWERMENT.icon);
        ret.actual(`${this.demonicEmpowermentCount} out of ${5000} (${formatNumber(actual)} casts.)`);
        ret = ret.recommended('5000 is recommended.');
        ret = ret.regular(recommended - 1).major(recommended - 2);
        return ret;
      });
  }

}

export default DemEmpUptimeDreadstalkers;
