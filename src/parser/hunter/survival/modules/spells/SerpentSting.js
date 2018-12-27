import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import Enemies from 'parser/shared/modules/Enemies';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatTracker from 'parser/shared/modules/StatTracker';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import { SERPENT_STING_SV_BASE_DURATION, SERPENT_STING_SV_PANDEMIC } from 'parser/hunter/survival/constants';

/**
 * Fire a shot that poisons your target, causing them to take (15% of Attack power) Nature damage instantly and an additional (60% of Attack power) Nature damage over 12/(1+haste) sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/pNJbYdLrMW2ynKGa#fight=3&type=damage-done&source=16&translate=true
 */

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
  hasVV = false;
  hasBoP = false;
  uptimeRequired = 0.95;

  constructor(...args) {
    super(...args);
    this.hasBoP = this.selectedCombatant.hasTalent(SPELLS.BIRDS_OF_PREY_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    this.casts++;
    if (this.selectedCombatant.hasBuff(SPELLS.VIPERS_VENOM_BUFF.id)) {
      this.hasVV = true;
    }
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
    const hastedSerpentStingDuration = SERPENT_STING_SV_BASE_DURATION / (1 + this.statTracker.currentHastePercentage);
    const serpentStingTarget = { targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp, serpentStingDuration: hastedSerpentStingDuration };
    this.serpentStingTargets.push(serpentStingTarget);

    this.hasVV = false;
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
    const hastedSerpentStingDuration = SERPENT_STING_SV_BASE_DURATION / (1 + this.statTracker.currentHastePercentage);
    const serpentStingTarget = { targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp };
    for (let i = 0; i <= this.serpentStingTargets.length - 1; i++) {
      if (this.serpentStingTargets[i].targetID === serpentStingTarget.targetID && this.serpentStingTargets[i].targetInstance === serpentStingTarget.targetInstance) {
        const timeRemaining = this.serpentStingTargets[i].serpentStingDuration - (event.timestamp - this.serpentStingTargets[i].timestamp);
        if (timeRemaining > (hastedSerpentStingDuration * SERPENT_STING_SV_PANDEMIC) && !this.hasVV) {
          this.badRefresh++;
        }
        const pandemicSerpentStingDuration = Math.min(hastedSerpentStingDuration * SERPENT_STING_SV_PANDEMIC, timeRemaining) + hastedSerpentStingDuration;
        if (!this.hasVV) {
          this.accumulatedTimeBetweenRefresh += this.serpentStingTargets[i].serpentStingDuration - timeRemaining;
          this.accumulatedPercentRemainingOnRefresh += timeRemaining / this.serpentStingTargets[i].serpentStingDuration;
        }
        this.serpentStingTargets[i].timestamp = event.timestamp;
        this.serpentStingTargets[i].serpentStingDuration = pandemicSerpentStingDuration;
        this.hasVV = false;
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
    if (this.hasBoP && !this.hasVV) {
      return {
        actual: this.uptimePercentage,
        isGreaterThan: {
          minor: 0.35,
          average: 0.425,
          major: 0.50,
        },
        style: 'percentage',
      };
    }
    if (this.hasBoP && this.hasVV) {
      this.uptimeRequired -= 0.3;
    }
    return {
      actual: this.uptimePercentage,
      isLessThan: {
        minor: this.uptimeRequired,
        average: this.uptimeRequired - 0.05,
        major: this.uptimeRequired - 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    if (this.hasBoP && !this.hasVV) {
      when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => {
        return suggest(<>With <SpellLink id={SPELLS.BIRDS_OF_PREY_TALENT.id} /> talented and without <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> talented, you don't want to cast <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> during <SpellLink id={SPELLS.COORDINATED_ASSAULT.id} /> at all, which is a majority of the fight, as thus a low uptime of <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> is better than a high uptime. </>)
          .icon(SPELLS.SERPENT_STING_SV.icon)
          .actual(`${formatPercentage(actual)}% Serpent Sting uptime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
    } else {
      when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Remember to maintain the <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> on enemies, but don't refresh the debuff unless it has less than {formatPercentage(SERPENT_STING_SV_PANDEMIC)}% duration remaining {this.hasVV ? <>, or you have a <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> buff</> : ''}. During <SpellLink id={SPELLS.COORDINATED_ASSAULT.id} />, you shouldn't be refreshing <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> at all{this.hasVV ? <> unless there's less than 50% remaining of the debuff and you have <SpellLink id={SPELLS.VIPERS_VENOM_BUFF.id} /> active</> : ''}.</>)
          .icon(SPELLS.SERPENT_STING_SV.icon)
          .actual(`${formatPercentage(actual)}% Serpent Sting uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
    }
    when(this.refreshingThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>It is not recommended to refresh <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> earlier than when there is less than {formatPercentage(SERPENT_STING_SV_PANDEMIC)}% of the debuffs duration remaining unless you get a <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> proc.</>)
        .icon(SPELLS.SERPENT_STING_SV.icon)
        .actual(`${actual} Serpent Sting cast(s) were cast too early`)
        .recommended(`<${recommended} is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(19)}
        icon={<SpellIcon id={SPELLS.SERPENT_STING_SV.id} />}
        value={`${formatPercentage(this.uptimePercentage)}%`}
        label="Serpent Sting uptime"
        tooltip={`<ul><li>You cast Serpent Sting a total of ${this.casts} times. </li> <li>You refreshed the debuff ${this.timesRefreshed} times. </li> <ul><li> When you did refresh (without Viper's Venom up), it happened on average with ${formatPercentage(this.averagePercentRemainingOnRefresh)}% or ${this.averageTimeBetweenRefresh} seconds remaining on the debuff.</li><li>You had ${this.badRefresh} bad refreshes. This means refreshes with more than ${formatPercentage(SERPENT_STING_SV_PANDEMIC)}% of the current debuff remaining and no Viper's Venom buff active.</li></ul><li>Serpent Sting dealt a total of ${formatNumber(this.bonusDamage / this.owner.fightDuration * 1000)} DPS or ${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDamage))}% of your total damage.</li></ul>`}
      />
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.SERPENT_STING_SV.id} />}
        value={<ItemDamageDone amount={this.bonusDamage} />}
      />
    );
  }
}

export default SerpentSting;
