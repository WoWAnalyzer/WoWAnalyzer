import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Main/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS/HUNTER';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

const T20_2P_INCREASE = 6000;

const EARLIEST_REFRESH = 0.3;

/**
 * Tears a bleeding wound in the target, dealing [(964.8% of Attack power) + (187.2% of Attack power)] Physical damage over 12 sec.
 */
class Lacerate extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  bonusDamage = 0;
  casts = 0;
  lacerateDuration = 12000;
  _earliestRefresh = EARLIEST_REFRESH * this.lacerateDuration;
  lastCastTimestamp = 0;
  lacerateTargets = [];
  badRefresh = 0;
  timesRefreshed = 0;
  accumulatedTimeBetweenRefresh = 0;

  on_initialized() {
    if (this.combatants.selected.hasBuff(SPELLS.HUNTER_SV_T20_2P_BONUS.id)) {
      this.lacerateDuration += T20_2P_INCREASE;
    }
    //Using the boots grants you more focus, allowing you to more liberally be casting Lacerate
    if (this.combatants.selected.hasFeet(ITEMS.NESINGWARYS_TRAPPING_TREADS.id)) {
      this._earliestRefresh += 0.1 * this.lacerateDuration;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LACERATE.id) {
      return;
    }
    this.casts++;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LACERATE.id) {
      return;
    }
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    let targetInstance = event.targetInstance;
    if (spellId !== SPELLS.LACERATE.id) {
      return;
    }
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const lacerateTarget = { targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp };
    this.lacerateTargets.push(lacerateTarget);
  }

  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    let targetInstance = event.targetInstance;
    if (spellId !== SPELLS.LACERATE.id) {
      return;
    }

    for (let i = 0; i < this.lacerateTargets.length; i++) {
      if (event.timestamp - this.lacerateTargets[i].timestamp > this.lacerateDuration) {
        this.lacerateTargets.splice(i, 1);
      }
    }
    if (this.lacerateTargets.length === 0) {
      return;
    }
    this.timesRefreshed++;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const lacerateTarget = { targetID: event.targetID, targetInstance: targetInstance, timestamp: event.timestamp };
    for (let i = 0; i <= this.lacerateTargets.length - 1; i++) {
      if (this.lacerateTargets[i].targetID === lacerateTarget.targetID && this.lacerateTargets[i].targetInstance === lacerateTarget.targetInstance) {
        if (event.timestamp - this.lacerateTargets[i].timestamp < (this.lacerateDuration - this._earliestRefresh)) {
          this.badRefresh++;
        }
        this.accumulatedTimeBetweenRefresh += event.timestamp - this.lacerateTargets[i].timestamp;
        this.lacerateTargets[i].timestamp = event.timestamp;
      }
    }
  }

  on_byPlayer_removedebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LACERATE.id) {
      return;
    }
    for (let i = 0; i < this.lacerateTargets.length; i++) {
      if (event.timestamp - this.lacerateTargets[i].timestamp > this.lacerateDuration) {
        this.lacerateTargets.splice(i, 1);
      }
    }
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.LACERATE.id) / this.owner.fightDuration;
  }
  get averageTimeBetweenRefresh() {
    return (this.accumulatedTimeBetweenRefresh / this.timesRefreshed / 1000).toFixed(2);
  }

  get uptimeThreshold() {
    if (this.combatants.selected.hasBuff(SPELLS.HUNTER_SV_T20_2P_BONUS.id)) {
      return {
        actual: this.uptimePercentage,
        isLessThan: {
          minor: 0.95,
          average: 0.90,
          major: 0.80,
        },
        style: 'percentage',
      };
    } else if (this.combatants.selected.hasFeet(ITEMS.NESINGWARYS_TRAPPING_TREADS.id)) {
      return {
        actual: this.uptimePercentage,
        isGreaterThan: {
          minor: 0.875,
          average: 0.9,
          major: 0.95,
        },
        style: 'percentage',
      };
    } else {
      return {
        actual: this.uptimePercentage,
        isGreaterThan: {
          minor: 0.8,
          average: 0.85,
          major: 0.9,
        },
        style: 'percentage',
      };
    }
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

  suggestions(when) {
    if (this.combatants.selected.hasBuff(SPELLS.HUNTER_SV_T20_2P_BONUS.id)) {
      when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>When you're using <ItemLink id={ITEMS.HUNTER_SV_T20_2P_BONUS.id} />, it's worth maintaining a higher uptime of <SpellLink id={SPELLS.LACERATE.id} /> than you otherwise would.</React.Fragment>)
          .icon(SPELLS.LACERATE.icon)
          .actual(`${formatPercentage(actual)}% Lacerate uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
    } else {
      when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Having a high <SpellLink id={SPELLS.LACERATE.id} icon /> uptime isn't necessarily optimal, it's generally used purely as a filler to dump focus when you have nothing else to do apart from casting non-buffed <SpellLink id={SPELLS.RAPTOR_STRIKE.id} icon />.</React.Fragment>)
          .icon(SPELLS.LACERATE.icon)
          .actual(`${formatPercentage(actual)}% Lacerate uptime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
    }
    when(this.refreshingThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Due to the overall low dmg output of <SpellLink id={SPELLS.LACERATE.id} /> and the fact that it pandemics, it is generally not recommended to refresh <SpellLink id={SPELLS.LACERATE.id} /> earlier than when there is less than {(this._earliestRefresh / 1000).toFixed(1)} seconds remaining on the debuff.</React.Fragment>)
        .icon(SPELLS.LACERATE.icon)
        .actual(`${actual} Lacerate cast(s) were cast too early`)
        .recommended(`>${recommended} is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LACERATE.id} />}
        value={`${formatPercentage(this.uptimePercentage)}%`}
        label="Lacerate information"
        tooltip={`<ul><li>You had a Lacerate uptime of ${formatPercentage(this.uptimePercentage)}%. </li><li>You cast Lacerate a total of ${this.casts} times. </li> <li>You refreshed the debuff ${this.timesRefreshed} times. </li> <ul><li> When you did refresh, it happened on average with ${((this.lacerateDuration / 1000) - this.averageTimeBetweenRefresh).toFixed(2)} seconds remaining on the debuff.</li> </ul><li>Lacerate dealt a total of ${formatNumber(this.bonusDamage / this.owner.fightDuration * 1000)} DPS or ${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDamage))}% of your total damage.</li></ul>`}
      />
    );
  }
}

export default Lacerate;
