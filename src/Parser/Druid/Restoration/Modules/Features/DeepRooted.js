import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import HotTracker from '../Core/HotTracking/HotTracker';

const REFRESH_THRESHOLD = 0.35;

/*
 * When your Rejuvenation, Regrowth, or Wild Growth heals a target below 35% health, its duration is refreshed.
 */
class DeepRooted extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTracker,
  };

  rejuvAttribution = {
    name: "Deep Rooted Rejuvenation",
    healing: 0,
    masteryHealing: 0,
    dreamwalkerHealing: 0,
    procs: 0,
    amount: 0,
  };

  wgAttribution = {
    name: "Deep Rooted Wild Growth",
    healing: 0,
    masteryHealing: 0,
    procs: 0,
    amount: 0,
  };

  regrowthAttribution = {
    name: "Deep Rooted Regrowth",
    healing: 0,
    masteryHealing: 0,
    procs: 0,
    amount: 0,
  };

  idToAttribution = {
    [SPELLS.REJUVENATION.id]: this.rejuvAttribution,
    [SPELLS.REJUVENATION_GERMINATION.id]: this.rejuvAttribution,
    [SPELLS.WILD_GROWTH.id]: this.wgAttribution,
    [SPELLS.REGROWTH.id]: this.regrowthAttribution,
  }

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.DEEP_ROOTED_TRAIT.id] > 0;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const attribution = this.idToAttribution[spellId];
    if (!attribution) {
      return;
    }

    const targetId = event.targetID;
    if (!targetId) {
      return;
    }

    // check health
    const beforeHealHp = event.hitPoints - event.amount;
    const maxHp = event.maxHitPoints;
    if (beforeHealHp / maxHp < REFRESH_THRESHOLD) {
      const refreshDuration = this.hotTracker.hotInfo[spellId].duration;
      this.hotTracker.addExtension(attribution, refreshDuration, targetId, spellId, true, true);
    }
  }

  get totalRejuvHealing() {
    return this.rejuvAttribution.healing + this.rejuvAttribution.masteryHealing + this.rejuvAttribution.dreamwalkerHealing;
  }

  get totalWgHealing() {
    return this.wgAttribution.healing + this.wgAttribution.masteryHealing;
  }

  get totalRegrowthHealing() {
    return this.regrowthAttribution.healing + this.regrowthAttribution.masteryHealing;
  }

  get totalHealing() {
    return this.totalRejuvHealing + this.totalWgHealing + this.totalRegrowthHealing;
  }

  get totalProcs() {
    return this.rejuvAttribution.procs + this.wgAttribution.procs + this.regrowthAttribution.procs;
  }

  statistic() {
    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEEP_ROOTED_TRAIT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalHealing))} %`}
        label="Deep Rooted"
        tooltip={`Rejuvenation - <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalRejuvHealing))}%</b> healing
            <ul>
            <li>Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.rejuvAttribution.healing))}%</b></li>
            <li>Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.rejuvAttribution.masteryHealing))}%</b></li>
            <li>Dreamwalker: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.rejuvAttribution.dreamwalkerHealing))}%</b></li>
            </ul>
          Wild Growth - <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalWgHealing))}%</b> healing
            <ul>
            <li>Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.wgAttribution.healing))}%</b></li>
            <li>Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.wgAttribution.masteryHealing))}%</b></li>
            </ul>
          Regrowth - <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalRegrowthHealing))}%</b> healing
            <ul>
            <li>Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.regrowthAttribution.healing))}%</b></li>
            <li>Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.regrowthAttribution.masteryHealing))}%</b></li>
            </ul>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(22);

}

export default DeepRooted;
