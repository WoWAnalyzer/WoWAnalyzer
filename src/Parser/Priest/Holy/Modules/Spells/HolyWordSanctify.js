import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

class HolyWordSanctify extends Analyzer {
  healing = 0;
  overhealing = 0;
  totalCasts = 0;
  totalHits = 0;

  reductionBySpell = {};
  apotheosisReductionBySpell = {};
  wastedCooldown = 0;

  get hitsPerCast() {
    return this.totalHits / this.totalCasts;
  }

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

export default HolyWordSanctify;
