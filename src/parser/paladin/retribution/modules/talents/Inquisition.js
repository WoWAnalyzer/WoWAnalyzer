import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Enemies from 'parser/shared/modules/Enemies';
import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';

// This module looks at the relative amount of damage buffed rather than strict uptime to be more accurate for fights with high general downtime

const PANDEMIC_FRACTION = 1.3;
const MAX_TIME = 45 * 1000 * PANDEMIC_FRACTION;

class Inquisition extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  hasES = false;
  buffedDamage = 0;
  unbuffedDamage = 0;

  duration = 0;
  applied = 0;
  casts = [];
  
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INQUISITION_TALENT.id);
    this.hasES = this.selectedCombatant.hasTalent(SPELLS.EXECUTION_SENTENCE_TALENT.id);

    // event listeners
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INQUISITION_TALENT), this.onInquisitionCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES), this.onAffectedDamage);
  }

  onInquisitionCast(event) {
    let inefficientCastReason = '';
    if (this.selectedCombatant.hasBuff(SPELLS.AVENGING_WRATH.id)) {
      inefficientCastReason += 'You refreshed Inquisition during Avenging Wrath. ';
    }
    if (this.hasES) {
      const entities = this.enemies.getEntities();
      const hasDebuff = Object.values(entities)
      .some(enemy => enemy.hasBuff(SPELLS.EXECUTION_SENTENCE_DEBUFF.id));
      if (hasDebuff) {
        inefficientCastReason += 'You refreshed Inquisition during Execution Sentence. ';
      }
    }
    if (inefficientCastReason.length > 0) {
      inefficientCastReason += 'It is better to refresh early before damage amplifying cooldowns so you can spend Holy Power on damage during them.';
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = inefficientCastReason;
    }
  
    const timeDifference = (this.applied + this.duration) - event.timestamp;
    const newCalculation = event.classResources[0].cost * 15 * 1000;
    if(timeDifference > 0){
      this.duration = Math.min(MAX_TIME, timeDifference + newCalculation);
    }else{
      this.duration = newCalculation;
    }
    const one = {
      holyPower: Math.floor(this.duration/(15*1000)),
      timeRemaining: this.applied === 0 ? 0 : timeDifference/1000, 
    };
    this.applied = event.timestamp;
    this.casts.push(one);
  }

  onAffectedDamage(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.INQUISITION_TALENT.id)) {
      this.buffedDamage += event.amount + (event.absorbed || 0);
    } else {
      this.unbuffedDamage += event.amount + (event.absorbed || 0);
    }
  }


  get efficiency() {
    return this.buffedDamage / (this.buffedDamage + this.unbuffedDamage);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.INQUISITION_TALENT.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.efficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    console.log(this.casts);
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Your <SpellLink id={SPELLS.INQUISITION_TALENT.id} icon /> efficiency is low. You should aim to have it active as often as possible while dealing damage.</>)
        .icon(SPELLS.INQUISITION_TALENT.icon)
        .actual(`${formatPercentage(actual)}% of damage buffed.`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon id={SPELLS.INQUISITION_TALENT.id} />}
        value={`${formatPercentage(this.efficiency)}%`}
        label="Damage Buffed"
        tooltip={`Relative amount of damage done while Inquisition was active. You had Inquisition active for ${formatPercentage(this.uptime)}% of the fight.`}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Holy Power</th>
              <th>Time Remaining</th>
            </tr>
          </thead>
          <tbody>
            {
              this.casts.map(id => (
                <tr>
                <td>{formatNumber(id.holyPower)}</td>
                <td>{formatDuration(id.timeRemaining)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </StatisticBox>
    );
  }
}

export default Inquisition;
