import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import UptimeIcon from 'interface/icons/Uptime';

import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../constants';

const EARTHSHIELD_HEALING_INCREASE = 0.10;

class EarthShield extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healing = 0;
  buffHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.EARTH_SHIELD_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.EARTH_SHIELD_HEAL.id) {
      this.healing += event.amount + (event.absorbed || 0);
      return;
    }

    const spellEffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)
    const combatant = this.combatants.players[event.targetID];

    if (spellEffectedByHealingIncreases && combatant) {
      const hasBuff = combatant.hasBuff(SPELLS.EARTH_SHIELD_TALENT.id, event.timestamp);
      if (hasBuff) {
        this.buffHealing += calculateEffectiveHealing(event, EARTHSHIELD_HEALING_INCREASE);
      }
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

  statistic() {
    return (
      <StatisticBox
        label={<SpellLink id={SPELLS.EARTH_SHIELD_TALENT.id} />}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(30)}
        tooltip={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))}% from the HoT and ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.buffHealing))}% from the healing buff.`}
        value={
          (
            <div>
              <UptimeIcon /> {formatPercentage(this.uptimePercent)}% <small>uptime</small><br />     
              <ItemHealingDone amount={this.healing + this.buffHealing} />
            </div>
          )
        }
      />
    );
  }
}

export default EarthShield;
