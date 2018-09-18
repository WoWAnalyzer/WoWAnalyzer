import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

class HolyWordSerenity extends Analyzer {
  healing = 0;
  overhealing = 0;
  totalCasts = 0;


  reductionBySpell = {};
  apotheosisReductionBySpell = {};
  wastedCooldown = 0;

  get totalCooldownReduction() {
    let totalCDR = 0;
    Object.keys(this.reductionBySpell).map(function(key, index) {
      totalCDR += this.reductionBySpell[key];
    });
    return totalCDR;
  }

  get apotheosisCooldownReduction() {
    let apothCDR = 0;
    Object.keys(this.apotheosisReductionBySpell).map(function(key, index) {
      apothCDR += this.apotheosisReductionBySpell[key];
    });
    return apothCDR;
  }
}

export default HolyWordSerenity;
