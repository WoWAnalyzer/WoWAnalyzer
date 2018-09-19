import React from 'react';
import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';

class HolyWordBase extends Analyzer {
  spellId = 0;
  baseCooldown = 60000;
  serendipityReduction = 6000;
  remainingCooldown = 0;
  serendipityProccers = {};

  holyWordHealing = 0;
  holyWordOverhealing = 0;
  holyWordCasts = 0;
  holyWordReductionBySpell = {};
  holyWordWastedCooldown = 0;

  lightOfTheNaruActive = false;
  lightOfTheNaruMultiplier = 1.33;
  lightOfTheNaruReductionBySpell = {};

  apotheosisCasts = 0;
  apotheosisActive = false;
  apotheosisMultiplier = 3;
  apotheosisReductionBySpell = {};

  get baseCooldownReduction() {
    let totalCDR = 0;
    Object.keys(this.holyWordReductionBySpell).map((key) => {
      totalCDR += this.holyWordReductionBySpell[key];
    });
    return totalCDR;
  }

  get lightOfTheNaaruCooldownReduction() {
    let lotnCDR = 0;
    Object.keys(this.lightOfTheNaruReductionBySpell).map((key) => {
      lotnCDR += this.lightOfTheNaruReductionBySpell[key];
    });
    return lotnCDR;
  }

  get apotheosisCooldownReduction() {
    let apothCDR = 0;
    Object.keys(this.apotheosisReductionBySpell).map((key) => {
      apothCDR += this.apotheosisReductionBySpell[key];
    });
    return apothCDR;
  }

  get totalCooldownReduction() {
    return this.baseCooldownReduction + this.lightOfTheNaaruCooldownReduction + this.apotheosisCooldownReduction;
  }

  constructor(...args) {
    super(...args);

    // Set up proper serendipity reduction values
    if (this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id)) {
      this.lightOfTheNaruActive = true;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === this.spellId) {
      this.totalCasts++;
      this.remainingCooldown = 60000;
    } else if (this.serendipityProccers[spellId] != null) {
      const reductionAmount = this.parseSerendipityCast(spellId);
      this.remainingCooldown -= reductionAmount;
      if (this.remainingCooldown < 0) {
        this.holyWordWastedCooldown += this.remainingCooldown * -1;
        this.remainingCooldown = 0;
      }
    }
  }

  parseSerendipityCast(spellId) {
    // We are casting a spell that will reduce a Holy Word Cooldown.
    // Get the base amount of the reduction
    const baseReductionAmount = this.serendipityProccers[spellId].baseReduction();
    this.holyWordReductionBySpell += baseReductionAmount;

    // Get the modified reduction by spell
    if (this.lightOfTheNaruActive) {
      const lightOfTheNaaruReduction = this.serendipityProccers[spellId].lightOfTheNaaruReduction();
      this.lightOfTheNaruReductionBySpell[spellId] = lightOfTheNaaruReduction - baseReductionAmount;
      return lightOfTheNaaruReduction;
    }
    else if (this.apotheosisActive) {
      const apotheosisReduction = this.serendipityProccers[spellId].apotheosisReduction();
      this.apotheosisReductionBySpell[spellId] += apotheosisReduction - baseReductionAmount;
      return apotheosisReduction;
    } else {
      return baseReductionAmount;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === this.spellId) {
      this.holyWordHealing += event.amount || 0;
      this.holyWordOverhealing += event.overheal || 0;
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
