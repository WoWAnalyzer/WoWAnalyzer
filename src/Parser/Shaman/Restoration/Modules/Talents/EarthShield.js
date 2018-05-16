import React from 'react';

import StatisticBox from 'Main/StatisticBox';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const EARTHSHIELD_HEALING_INCREASE = 0.10;

class EarthShield extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;
  buffHealing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.EARTH_SHIELD_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.EARTH_SHIELD_HEAL.id) {
      this.healing += event.amount;
      return;
    }

    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      return;
    }

    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      return;
    }
    
    const hasBuff = combatant.hasBuff(SPELLS.EARTH_SHIELD_TALENT.id, event.timestamp);
    if (!hasBuff) {
      return;
    }

    // earth shield bonus appears to be tripled for the riptide initial and chain heal healing
    if((spellId === SPELLS.RIPTIDE.id && !event.tick) || spellId === SPELLS.CHAIN_HEAL.id) {
      this.buffHealing += calculateEffectiveHealing(event, EARTHSHIELD_HEALING_INCREASE * 3);
    } else {
      this.buffHealing += calculateEffectiveHealing(event, EARTHSHIELD_HEALING_INCREASE);
    }
  }

  get uptime() {
    return Object.keys(this.combatants.players)
      .map(key => this.combatants.players[key])
      .reduce((uptime, player) =>
        uptime + player.getBuffUptime(SPELLS.EARTH_SHIELD_TALENT.id), 0);
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your <SpellLink id={SPELLS.EARTH_SHIELD_TALENT.id} /> uptime can be improved.</React.Fragment>)
          .icon(SPELLS.EARTH_SHIELD_TALENT.icon)
          .actual(`${formatPercentage(this.uptimePercent)}% uptime`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EARTH_SHIELD_TALENT.id} />}
        value={`${formatPercentage(this.uptimePercent)} %`}
        label="Earth Shield Uptime"
      />
    );
  }

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.EARTH_SHIELD_HEAL.id);
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.EARTH_SHIELD_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))}% from the HoT and ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.buffHealing))}% from the healing buff.`}>
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + this.buffHealing + feeding))} %
          </dfn>
        </div>
      </div>
    );
  }

}

export default EarthShield;
