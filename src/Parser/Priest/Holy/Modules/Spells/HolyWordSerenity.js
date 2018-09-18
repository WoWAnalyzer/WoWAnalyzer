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

  }

  get apotheosisCooldownReduction() {

  }
}

export default HolyWordSerenity;
