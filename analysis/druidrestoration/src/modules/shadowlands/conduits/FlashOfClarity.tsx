import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

import { RANK_ONE_FLASH_OF_CLARITY } from '../../../constants';

class FlashOfClarity extends Analyzer {


  healingBoost = 0;
  healing = 0;

  targetsWithClearCastingRegrowth: number[] = [];

  /**
   * Flash of Clarity makes it so any regrowth casted with clearcasting is boosted by x% on hot healing and direct heal
   */
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.FLASH_OF_CLARITY.id);

    if (!this.active) {
      return;
    }

    this.healingBoost = this.conduitScaling(RANK_ONE_FLASH_OF_CLARITY, this.selectedCombatant.conduitRankBySpellID(SPELLS.FLASH_OF_CLARITY.id));


    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.checkIfClearCasting);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH), this.normalizeBoost);
  }

  //this works for this one. I'm not certain it works for all resto druid conduits yet so for now its here
  conduitScaling(rankOne: number, requiredRank: number) {
    const scalingFactor = rankOne * .1;
    const rankZero = rankOne - scalingFactor;
    const rankRequested = rankZero + scalingFactor * requiredRank;
    return rankRequested;
  }

  checkIfClearCasting(event: CastEvent){
    const targetID = event.targetID;
    if(!targetID){
      return;
    }

    // Currently this is bugged so when you are innervated each
    // !this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)
    if(this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id)) {
      this.targetsWithClearCastingRegrowth[targetID] = targetID;
    }else if(this.targetsWithClearCastingRegrowth[targetID]){
      delete this.targetsWithClearCastingRegrowth[targetID];
    }
  }

  normalizeBoost(event: HealEvent){
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
