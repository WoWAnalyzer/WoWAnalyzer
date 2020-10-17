import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Combatants from 'parser/shared/modules/Combatants';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

import StatWeights from '../../features/StatWeights';
import { getPrimaryStatForItemLevel, findItemLevelByPrimaryStat } from './common';
import Rejuvenation from '../../core/Rejuvenation';
import Events from 'parser/core/Events';

/**
 Rejuvenation's duration is increased by 1 sec, and it heals for an additional 82 when it is your only heal over time on the target.
 */
class AutumnLeaves extends Analyzer {
  static dependencies = {
    statWeights: StatWeights,
    combatants: Combatants,
    rejuvenation: Rejuvenation,
    healingDone: HealingDone,
  };

  healing = 0;
  avgItemLevel = 0;
  traitLevel = 0;

  // TODO: Additions for: mastery, cultivation and AL.
  // TODO: Subtractions for overheals on last tick and subtractions for early refreshes.
  // Tracks if the last tick of rejuv/germ on each player was overhealing.
  // Used to determine if a player still needed to be healed when rejuv fell.
  totalOneSecondValue = 0;
  lastTickTracker = { [SPELLS.REJUVENATION.id]: {}, [SPELLS.REJUVENATION_GERMINATION.id]: {} };
  lastTickCount = 0;
  lastTickOverhealCount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.AUTUMN_LEAVES_TRAIT.id);
    if (this.active) {
      this.avgItemLevel = this.selectedCombatant.traitsBySpellId[SPELLS.AUTUMN_LEAVES_TRAIT.id]
        .reduce((a, b) => a + b) / this.selectedCombatant.traitsBySpellId[SPELLS.AUTUMN_LEAVES_TRAIT.id].length;
      this.traitLevel = this.selectedCombatant.traitsBySpellId[SPELLS.AUTUMN_LEAVES_TRAIT.id].length;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this.onRemoveBuff);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION]), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell([SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION]), this.onRefreshBuff);
  }
  onHeal(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    if (this.lastTickTracker[spellId]) {
      this.lastTickTracker[spellId][targetId] = (event.overheal > 0);
    }

    if (spellId === SPELLS.AUTUMN_LEAVES.id) {
      this.healing += event.amount + (event.absorbed || 0);
    }
  }

  onRemoveBuff(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (this.lastTickTracker[spellId]) {
      this.lastTickCount += 1;
      if (this.lastTickTracker[spellId][targetId]) {
        this.lastTickOverhealCount += 1;
      }
    }
  }

  onApplyBuff(event) {
    this.totalOneSecondValue += 1;
  }

  onRefreshBuff(event) {
    this.totalOneSecondValue += 1;
  }

  getSpellUptime(spellId) {
    return Object.keys(this.combatants.players)
      .map(key => this.combatants.players[key])
      .reduce((uptime, player) =>
        uptime + player.getBuffUptime(spellId), 0);
  }

  statistic() {
    // Calculating the "one second" part..
    const rejuvUptimeInSeconds = (this.getSpellUptime(SPELLS.REJUVENATION.id) + this.getSpellUptime(SPELLS.REJUVENATION_GERMINATION.id)) / 1000;
    const totalRejuvenationHealing = this.rejuvenation.totalRejuvHealing;
    const rejuvHealingVal = this.healingDone.byAbility(SPELLS.REJUVENATION.id);
    const germHealingVal = this.healingDone.byAbility(SPELLS.REJUVENATION_GERMINATION.id);
    const rejuvGermHealingVal = rejuvHealingVal.add(germHealingVal.regular, germHealingVal.absorbed, germHealingVal.overheal);
    const rejuvGermEffetivePercent = rejuvGermHealingVal.effective / rejuvGermHealingVal.raw;
    const lastTickEffectivePercent = (this.lastTickCount - this.lastTickOverhealCount) / this.lastTickCount;
    const totalRejuvHealingOverhealAdjusted = totalRejuvenationHealing / rejuvGermEffetivePercent * lastTickEffectivePercent;
    const oneSecondRejuvenationHealing = totalRejuvHealingOverhealAdjusted / rejuvUptimeInSeconds;
    const totalOneSecondValue = this.owner.getPercentageOfTotalHealingDone(this.totalOneSecondValue * oneSecondRejuvenationHealing);

    const throughputPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const onePercentThroughputInInt = this.statWeights._ratingPerOnePercent(this.statWeights.totalOneInt);
    const intGain = onePercentThroughputInInt * (throughputPercent+totalOneSecondValue) * 100;
    const ilvlGain = findItemLevelByPrimaryStat(getPrimaryStatForItemLevel(this.avgItemLevel) + intGain) - this.avgItemLevel;

    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.AUTUMN_LEAVES_TRAIT.id}
        value={(
          <>
            {formatPercentage(throughputPercent + totalOneSecondValue)} %
          </>
        )}
        tooltip={(
          <>
            <b>Disclaimer</b> - as of right now this is an estimate. We take the average healing of one second of rejuvenation and multiply
            that by amounts of rejuv applications. Finally, we adjust this number based on the average overhealing at the end of a rejuvenation against the avg overhealing of rejuvenation as a whole.
            These factors are not yet considered in the module and may decrease the overall accuracy of the results:
            <ul>
              <li>+ Cultivation</li>
              <li>+ Autumn Leaves</li>
              <li>- Early refreshes of rejuvenation.</li>
            </ul>
            Estimated accuracy of the result is 80%<br />
            Autumn Leaves healing: <b>{formatPercentage(throughputPercent)}%</b><br />
            Extra second of Rejuvenation equivalent to <b>{formatPercentage(totalOneSecondValue)}%</b><br />
            Autumn Leaves gave you equivalent to <b>{formatNumber(intGain)}</b> ({formatNumber(intGain / this.traitLevel)}
            per level) int. This is worth roughly <b>{formatNumber(ilvlGain)}</b> ({formatNumber(ilvlGain / this.traitLevel)}
            per level) item levels.
          </>
        )}
      />
    );
  }
}

export default AutumnLeaves;
