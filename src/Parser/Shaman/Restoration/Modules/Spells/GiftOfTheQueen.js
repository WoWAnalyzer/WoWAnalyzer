import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

class GiftOfTheQueen extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  giftOfTheQueenTargetEfficiency() {
    const giftOfTheQueen = this.abilityTracker.getAbility(SPELLS.GIFT_OF_THE_QUEEN.id);
    const giftOfTheQueenDuplicate = this.abilityTracker.getAbility(SPELLS.GIFT_OF_THE_QUEEN_DUPLICATE.id);

    const hasDeepWaters = this.combatants.selected.traitsBySpellId[SPELLS.DEEP_WATERS.id] > 0;

    const giftOfTheQueenCasts = giftOfTheQueen.casts || 0;
    const giftOfTheQueenHits = giftOfTheQueen.healingHits || 0;
    const giftOfTheQueenDuplicateHits = giftOfTheQueenDuplicate.healingHits || 0;
    const giftOfTheQueenAvgHits = (giftOfTheQueenHits + giftOfTheQueenDuplicateHits) / giftOfTheQueenCasts / (hasDeepWaters ? 2 : 1);
    return giftOfTheQueenAvgHits / 6;

  }

  giftOfTheQueenCBTFeedingPercent() {
    const giftOfTheQueen = this.abilityTracker.getAbility(SPELLS.GIFT_OF_THE_QUEEN.id);
    const giftOfTheQueenDuplicate = this.abilityTracker.getAbility(SPELLS.GIFT_OF_THE_QUEEN_DUPLICATE.id);

    const giftOfTheQueenRawHealing = giftOfTheQueen.healingEffective + giftOfTheQueen.healingOverheal;
    const giftOfTheQueenDuplicateRawHealing = giftOfTheQueenDuplicate.healingEffective + giftOfTheQueenDuplicate.healingOverheal;

    let giftOfTheQueenCBTFeeding = 0;
    if (this.cooldownThroughputTracker.cbtFeed[SPELLS.GIFT_OF_THE_QUEEN.id]) {
      giftOfTheQueenCBTFeeding += this.cooldownThroughputTracker.cbtFeed[SPELLS.GIFT_OF_THE_QUEEN.id].healing;
    }
    if (this.cooldownThroughputTracker.cbtFeed[SPELLS.GIFT_OF_THE_QUEEN_DUPLICATE.id]) {
      giftOfTheQueenCBTFeeding += this.cooldownThroughputTracker.cbtFeed[SPELLS.GIFT_OF_THE_QUEEN_DUPLICATE.id].healing;
    }
    
    return giftOfTheQueenCBTFeeding / (giftOfTheQueenRawHealing + giftOfTheQueenDuplicateRawHealing);
    
  }

  suggestions(when) {
    const hasCBT = this.combatants.selected.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id);
   
    when(this.giftOfTheQueenTargetEfficiency()).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to always cast <SpellLink id={SPELLS.GIFT_OF_THE_QUEEN.id} /> at a position where both the initial hit and the echo from <SpellLink id={SPELLS.DEEP_WATERS.id} /> will hit all 6 potential targets.</span>)
          .icon(SPELLS.GIFT_OF_THE_QUEEN.icon)
          .actual(`${formatPercentage(this.giftOfTheQueenTargetEfficiency())} % of targets hit`)
          .recommended(`> ${formatPercentage(recommended)} % of targets hit`)
          .regular(recommended - .05).major(recommended - .15);
      });
    
    const feedingPercent = this.giftOfTheQueenCBTFeedingPercent();
    if (hasCBT) {
      when(feedingPercent).isLessThan(0.85)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Try to cast <SpellLink id={SPELLS.GIFT_OF_THE_QUEEN.id} /> while <SpellLink id={SPELLS.CLOUDBURST_TOTEM_TALENT.id} /> is up as much as possible.</span>)
            .icon(SPELLS.GIFT_OF_THE_QUEEN.icon)
            .actual(`${formatPercentage(feedingPercent)} % of GotQ healing fed into CBT`)
            .recommended(`> ${formatPercentage(recommended)} % of GotQ healing fed into CBT`)
            .regular(recommended - .2).major(recommended - .4);
        }); 
      }   
  }

  getGiftOfQueenTargetEfficiencySuggestionThreshold(){
    return {
      actual: this.giftOfTheQueenTargetEfficiency(),
      isLessThan: {
        minor: 0.99,//Missed 1 target
        average: .7,//Missed 2-3 targets
        major: 0.5,//Missed more than 3 targets
      },
      style: 'percentage',
    };
  }

  getCBTTotemFeedingSuggestionThreshold(){
    
    return {
      actual: this.giftOfTheQueenCBTFeedingPercent(),
      isLessThan: {
        minor: 0.85,
        average: 0.6,
        major: 0.4,
      },
      style: 'percentage',
    };
  }

  statistic() {
    const giftOfTheQueen = this.abilityTracker.getAbility(SPELLS.GIFT_OF_THE_QUEEN.id);
    const giftOfTheQueenDuplicate = this.abilityTracker.getAbility(SPELLS.GIFT_OF_THE_QUEEN_DUPLICATE.id);

    const giftOfTheQueenCasts = giftOfTheQueen.casts || 0;

    const hasDeepWaters = this.combatants.selected.traitsBySpellId[SPELLS.DEEP_WATERS.id] > 0;
    const giftOfTheQueenHits = giftOfTheQueen.healingHits || 0;
    const giftOfTheQueenDuplicateHits = giftOfTheQueenDuplicate.healingHits || 0;
    const giftOfTheQueenAvgHits = (giftOfTheQueenHits + giftOfTheQueenDuplicateHits) / giftOfTheQueenCasts / (hasDeepWaters ? 2 : 1);
    const giftOfTheQueenTargetEfficiency = giftOfTheQueenAvgHits / 6;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GIFT_OF_THE_QUEEN.id} />}
        value={`${formatPercentage(giftOfTheQueenTargetEfficiency)} %`}
        label={(
          <dfn data-tip={`The average percentage of targets healed by Gift of the Queen out of the maximum amount of targets. You cast a total of ${giftOfTheQueenCasts} Gift of the Queens, which healed an average of ${giftOfTheQueenAvgHits.toFixed(2)} out of 6 targets.`}>
            GotQ target efficiency
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(70);
}

export default GiftOfTheQueen;

