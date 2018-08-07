import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

const COOLDOWN_REDUCTION_MS = 500;

//WCL https://www.warcraftlogs.com/reports/ZVJr2MPNx3RCvX6B/#fight=6&source=184
class FeedTheDemon extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  casts = 0;

  totalCooldownReductionWasted = 0;
  totalCooldownReduction = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id);
  }

  on_byPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SOUL_FRAGMENT_STACK.id) {
      return;
    }
    if (!this.selectedCombatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id)){
      return;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.DEMON_SPIKES.id)){
      this.totalCooldownReductionWasted += COOLDOWN_REDUCTION_MS;
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(SPELLS.DEMON_SPIKES.id, COOLDOWN_REDUCTION_MS);
      this.totalCooldownReduction += effectiveReduction;
      this.totalCooldownReductionWasted += COOLDOWN_REDUCTION_MS - effectiveReduction;
    }
  }

  get FTDReduction(){
    return this.totalCooldownReduction;
  }

  get FTDReductionWasted(){
    return this.totalCooldownReductionWasted;
  }

  get reduction(){
    return this.FTDReduction / 1000;
  }

  get wastedReduction(){
    return this.FTDReductionWasted / 1000;
  }

  get averageReduction(){
    const casts = this.abilityTracker.getAbility(SPELLS.DEMON_SPIKES.id).casts;
    return (this.reduction / casts) || 0;
  }

  get wastedPercent(){
    return this.wastedReduction / (this.wastedReduction + this.reduction);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FEED_THE_DEMON_TALENT.id} />}
        value={`${formatNumber(this.averageReduction)} sec`}
        label="Feed the Demon average reduction"
        tooltip={`${formatNumber(this.reduction)} sec total effective reduction.</br>
                  ${formatNumber(this.wastedReduction)} sec (${formatPercentage(this.wastedPercent)}%) wasted reduction.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default FeedTheDemon;
