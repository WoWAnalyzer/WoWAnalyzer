import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import Enemies from 'Parser/Core/Modules/Enemies';
import Wrapper from 'common/Wrapper';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS/HUNTER';
import SpellLink from 'common/SpellLink';

const T20_2P_INCREASE = 6000;

const EARLIEST_REFRESH = 3600;

class Lacerate extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  bonusDamage = 0;
  casts = 0;
  lacerateDuration = 12000;
  lastCastTimestamp = 0;
  lacerateTargets = [];
  badRefresh = 0;
  timesRefreshed = 0;
  accumulatedTimeBetweenRefresh = 0;

  on_initialized() {
    if (this.combatants.selected.hasBuff(SPELLS.HUNTER_SV_T20_2P_BONUS.id)) {
      this.lacerateDuration += T20_2P_INCREASE;
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
        console.log(event.timestamp - this.lacerateTargets[i].timestamp);
        if (event.timestamp - this.lacerateTargets[i].timestamp > EARLIEST_REFRESH) {
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
        isGreaterThan: {
          minor: 0.9,
          average: 0.95,
          major: 0.99,
        },
        style: 'percentage',
      };
    } else if (this.combatants.selected.hasFeet(ITEMS.NESINGWARYS_TRAPPING_TREADS.id)) {
      return {
        actual: this.uptimePercentage,
        isGreaterThan: {
          minor: 0.85,
          average: 0.875,
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
        minor: 0,
        average: 2,
        major: 4,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Having a high <SpellLink id={SPELLS.LACERATE.id} icon /> uptime isn't necessarily optimal, it's generally used purely as a filler to dump focus when you have nothing else to do apart from casting non-buffed <SpellLink id={SPELLS.RAPTOR_STRIKE.id} icon />.</Wrapper>)
        .icon(SPELLS.LACERATE.icon)
        .actual(`${formatPercentage(actual)}% Lacerate uptime`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LACERATE.id} />}
        value={`${formatPercentage(this.uptimePercentage)}%`}
        label="Lacerate information"
        tooltip={`<ul><li>You had a Lacerate uptime of ${formatPercentage(this.uptimePercentage)}%. </li><li>You cast Lacerate a total of ${this.casts} times. </li> <li>You refreshed the debuff ${this.timesRefreshed} times. </li> <ul><li> When you did refresh, it happened on average with ${((this.lacerateDuration / 1000) - this.averageTimeBetweenRefresh).toFixed(2)} seconds remaining on the debuff.</li></ul>`}
      />
    );
  }
}

export default Lacerate;
