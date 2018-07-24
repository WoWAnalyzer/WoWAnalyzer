import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import Enemies from 'Parser/Core/Modules/Enemies';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import StatTracker from 'Parser/Core/Modules/StatTracker';

/**
 * Fire a shot that poisons your target, causing them to take (15% of Attack power) Nature damage instantly and an additional (60% of Attack power) Nature damage over 12/(1+haste) sec.
 */

const PANDEMIC = 0.3;
const BASELINE_DURATION = 12000;

class SerpentSting extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    statTracker: StatTracker,
  };

  badRefresh = 0;
  timesRefreshed = 0;
  casts = 0;
  bonusDamage = 0;
  serpentStingTargets = [];
  accumulatedTimeBetweenRefresh = 0;
  accumulatedPercentRemainingOnRefresh = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    this.casts++;
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    let targetInstance = event.targetInstance;
    if (spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const hastedSerpentStingDuration = BASELINE_DURATION / (1 + this.statTracker.currentHastePercentage);
    const serpentStingTarget = { targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp, serpentStingDuration: hastedSerpentStingDuration };
    this.serpentStingTargets.push(serpentStingTarget);
  }

  on_byPlayer_removedebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    for (let i = 0; i < this.serpentStingTargets.length; i++) {
      if (event.timestamp - this.serpentStingTargets[i].timestamp > this.serpentStingTargets[i].serpentStingDuration) {
        this.serpentStingTargets.splice(i, 1);
      }
    }
  }

  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    let targetInstance = event.targetInstance;
    if (spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    for (let i = 0; i < this.serpentStingTargets.length; i++) {
      if (event.timestamp - this.serpentStingTargets[i].timestamp > this.serpentStingTargets[i].serpentStingDuration) {
        this.serpentStingTargets.splice(i, 1);
      }
    }
    if (this.serpentStingTargets.length === 0) {
      return;
    }
    this.timesRefreshed++;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const hastedSerpentStingDuration = BASELINE_DURATION / (1 + this.statTracker.currentHastePercentage);
    const serpentStingTarget = { targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp };
    for (let i = 0; i <= this.serpentStingTargets.length - 1; i++) {
      if (this.serpentStingTargets[i].targetID === serpentStingTarget.targetID && this.serpentStingTargets[i].targetInstance === serpentStingTarget.targetInstance) {
        const timeRemaining = this.serpentStingTargets[i].serpentStingDuration - (event.timestamp - this.serpentStingTargets[i].timestamp);
        if (timeRemaining < (this.serpentStingTargets[i].serpentStingDuration * PANDEMIC) && !this.selectedCombatant.hasBuff(SPELLS.VIPERS_VENOM_BUFF.id)) {
          this.badRefresh++;
        }
        const pandemicSerpentStingDuration = Math.min(hastedSerpentStingDuration * PANDEMIC, timeRemaining) + hastedSerpentStingDuration;

        this.accumulatedTimeBetweenRefresh += this.serpentStingTargets[i].serpentStingDuration - timeRemaining;
        this.accumulatedPercentRemainingOnRefresh += timeRemaining / this.serpentStingTargets[i].serpentStingDuration;
        this.serpentStingTargets[i].timestamp = event.timestamp;
        this.serpentStingTargets[i].serpentStingDuration = pandemicSerpentStingDuration;
      }
    }
  }

  get averageTimeBetweenRefresh() {
    return (this.accumulatedTimeBetweenRefresh / this.timesRefreshed / 1000).toFixed(2);
  }
  get averagePercentRemainingOnRefresh() {
    return (this.accumulatedPercentRemainingOnRefresh / this.timesRefreshed).toFixed(4);
  }
  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.SERPENT_STING_SV.id) / this.owner.fightDuration;
  }

  get refreshingThreshold() {
    return {
      actual: this.badRefresh,
      isGreaterThan: {
        minor: 1,
        average: 3,
        major: 5,
      },
      style: 'number',
    };
  }

  get uptimeThreshold() {
    return {
      actual: this.uptimePercentage,
      isLessThan: {
        minor: 0.950,
        average: 0.90,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Remember to maintain the <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> on enemies, but don't refresh the debuff unless you have a <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> buff, or the debuff has less {formatPercentage(PANDEMIC)}% duration remaining.</React.Fragment>)
        .icon(SPELLS.SERPENT_STING_SV.icon)
        .actual(`${formatPercentage(actual)}% Serpent Sting uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
    when(this.refreshingThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>It is not recommended to refresh <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> earlier than when there is less than {formatPercentage(PANDEMIC)}% of the debuffs duration remaining unless you get a <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> proc.</React.Fragment>)
        .icon(SPELLS.SERPENT_STING_SV.icon)
        .actual(`${actual} Serpent Sting cast(s) were cast too early`)
        .recommended(`>${recommended} is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SERPENT_STING_SV.id} />}
        value={`${formatPercentage(this.uptimePercentage)}%`}
        label="Serpent Sting uptime"
        tooltip={`<ul><li>You cast Serpent Sting a total of ${this.casts} times. </li> <li>You refreshed the debuff ${this.timesRefreshed} times. </li> <ul><li> When you did refresh, it happened on average with ${formatPercentage(this.averagePercentRemainingOnRefresh)}% or ${this.averageTimeBetweenRefresh} seconds remaining on the debuff.</li><li>You had ${this.badRefresh} bad refreshes. This means refreshes with more than ${formatPercentage(PANDEMIC)}% of the current debuff remaining and no Viper's Venom buff active.</li></ul><li>Serpent Sting dealt a total of ${formatNumber(this.bonusDamage / this.owner.fightDuration * 1000)} DPS or ${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDamage))}% of your total damage.</li></ul>`}
      />
    );
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SERPENT_STING_SV.id} />
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.bonusDamage} />
        </div>
      </div>
    );
  }

}

export default SerpentSting;
