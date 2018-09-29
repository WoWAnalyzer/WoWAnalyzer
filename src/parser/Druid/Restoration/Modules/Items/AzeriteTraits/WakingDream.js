import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import {formatPercentage, formatNumber} from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatWeights from '../../features/StatWeights';
import {getPrimaryStatForItemLevel, findItemLevelByPrimaryStat} from '../AzeriteTraits/common';

const WAKING_DREAM_EXTRA_TICK_RATE=0.2;
const YSERAS_GIFT_HEALING_BASE=0.03;
/**
 Ysera's Gift now heals every 4 sec, and heals for an additional 161 for each of your active Rejuvenations.
 */
class WakingDream extends Analyzer{
  static dependencies = {
    statWeights: StatWeights,
  };

  healing = 0;
  avgItemLevel = 0;
  traitLevel = 0;
  wakingDreamHealing = 0;
  wakingDreamExtraTickHealing = 0;
  totalHealing = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.WAKING_DREAM_TRAIT.id);
    if(this.active) {
      this.avgItemLevel = this.selectedCombatant.traitsBySpellId[SPELLS.WAKING_DREAM_TRAIT.id]
        .reduce((a, b) => a + b) / this.selectedCombatant.traitsBySpellId[SPELLS.WAKING_DREAM_TRAIT.id].length;
      this.traitLevel = this.selectedCombatant.traitsBySpellId[SPELLS.WAKING_DREAM_TRAIT.id].length;
    }
  }
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId !== SPELLS.YSERAS_GIFT_OTHERS.id && spellId !== SPELLS.YSERAS_GIFT_SELF.id) {
      return;
    }

    // 20% of all ysera's gift healing from maxOriginalHeal is contributed to waking dream.
    // Any healing over the maxOriginalHeal is contributed by the azerite trait
    const maxOriginalHeal = event.maxHitPoints * YSERAS_GIFT_HEALING_BASE;
    const wakingDreamHealing = event.amount + (event.absorbed || 0) - maxOriginalHeal;

    const extraFromRejuvs = wakingDreamHealing <= 0 ? 0 : wakingDreamHealing;
    const extraFromTicks = wakingDreamHealing <= 0 ? event.amount * WAKING_DREAM_EXTRA_TICK_RATE : maxOriginalHeal * WAKING_DREAM_EXTRA_TICK_RATE;

    this.wakingDreamHealing += extraFromRejuvs;
    this.wakingDreamExtraTickHealing += extraFromTicks;
    this.healing += extraFromRejuvs + extraFromTicks;
    this.totalHealing += event.amount + (event.absorbed || 0);
  }

  statistic(){
    const throughputPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const onePercentThroughputInInt = this.statWeights._ratingPerOnePercent(this.statWeights.totalOneInt);
    const intGain = onePercentThroughputInInt * throughputPercent * 100;
    const ilvlGain = findItemLevelByPrimaryStat(getPrimaryStatForItemLevel(this.avgItemLevel) + intGain) - this.avgItemLevel;

    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.WAKING_DREAM_TRAIT.id}
        value={(
          <React.Fragment>
            {formatPercentage(throughputPercent)} %<br />
          </React.Fragment>
        )}
        tooltip={`Healing from rejuv part: ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.wakingDreamHealing))} % / ${formatNumber(this.wakingDreamHealing)} healing.<br />
                  Healing from increased tick rate: ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.wakingDreamExtraTickHealing))} % / ${formatNumber(this.wakingDreamExtraTickHealing)} healing.<br />
                  Total Ysera's gift healing: ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalHealing))} % / ${formatNumber(this.totalHealing)} healing.<br />
            Waking Dream gave you equivalent to <b>${formatNumber(intGain)}</b> (${formatNumber(intGain/this.traitLevel)}
            per level) int. This is worth roughly <b>${formatNumber(ilvlGain)}</b> (${formatNumber(ilvlGain/this.traitLevel)}
            per level) item levels.`}
      />
    );
  }
}

export default WakingDream;
