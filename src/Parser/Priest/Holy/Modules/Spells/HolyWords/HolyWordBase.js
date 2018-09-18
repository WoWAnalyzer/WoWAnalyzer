import React from 'react';
import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';

class HolyWordBase extends Analyzer {
  baseCooldown = 60000;
  remainingCooldown = 0;
  serendipityProccers = {};

  healing = 0;
  overhealing = 0;
  totalCasts = 0;
  reductionBySpell = {};
  apotheosisReductionBySpell = {};
  wastedCooldown = 0;
  spellId = 0;

  apotheosisCasts = 0;
  apotheosisActive = false;
  apotheosisMultiplier = 3;

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

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === this.spellId) {
      this.totalCasts++;
      this.remainingCooldown = 60000;
    } else if (this.serendipityProccers[spellId] != null) {
      if (this.apotheosisActive) {

      } else {

      }
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === this.spellId) {
      this.healing += event.amount || 0;
      this.overhealing += event.overheal || 0;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.APOTHEOSIS_TALENT.id) {
      this.apotheosisCasts++;
      this.apotheosisActive = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.APOTHEOSIS_TALENT.id) {
      this.apotheosisActive = false;
    }
  }
}

export default HolyWordBase;
