import React from 'react';

import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';

class FlashOfClarity extends Analyzer {

  healingBoost = 0;
  healing = 0;

  targetsWithClearCastingRegrowth = [];

  /**
   * Flash of Clarity makes it so any regrowth casted with clearcasting is boosted by x% on hot healing and direct heal
   */
  constructor(...args) {
    super(...args);
    this.active = false;

    this.healingBoost = .20;//TODO Get from combat data when they EXPORT IT >:c

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.checkIfClearCasting);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.normalizeBoost);
  }

  checkIfClearCasting(event){
    const targetID = event.targetID;
    // Currently this is bugged so when you are innervated each 
    // !this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)
    if(this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id)) {
      this.targetsWithClearCastingRegrowth[targetID] = targetID;
    }else if(this.targetsWithClearCastingRegrowth[targetID]){
      delete this.targetsWithClearCastingRegrowth[targetID];
    }
  }

  normalizeBoost(event){
    if(this.targetsWithClearCastingRegrowth[event.targetID]){
      this.healing += calculateEffectiveHealing(event, this.healingBoost);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.FLASH_OF_CLARITY}>
          <ItemHealingDone amount={this.healing} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FlashOfClarity;