import React from 'react';
import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';

const BASE_COOLDOWN = 60000;

class HolyWordBase extends Analyzer {
  serendipityProccers = {
    [SPELLS.GREATER_HEAL.id]: 1.0,
    [SPELLS.FLASH_HEAL.id]: 1.0,
    [SPELLS.BINDING_HEAL_TALENT.id]: 0.5,
  };

  healing = 0;
  overhealing = 0;
  totalCasts = 0;
  baseCooldown = 60000;
  reductionBySpell = {};
  apotheosisReductionBySpell = {};
  wastedCooldown = 0;

  get totalCooldownReduction() {
    let totalCDR = 0;
    Object.keys(this.reductionBySpell).map(function (key, index) {
      totalCDR += this.reductionBySpell[key];
    });
    return totalCDR;
  }

  get apotheosisCooldownReduction() {
    let apothCDR = 0;
    Object.keys(this.apotheosisReductionBySpell).map(function (key, index) {
      apothCDR += this.apotheosisReductionBySpell[key];
    });
    return apothCDR;
  }

  constructor(...args) {
    super(...args);

    // Set up proper serendipity reduction values
    if (this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id)) {
      this.serendipityReduction += 2000;
    }
  }
}

export default HolyWordBase;
