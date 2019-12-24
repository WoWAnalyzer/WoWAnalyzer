import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import UptimeIcon from 'interface/icons/Uptime';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import { HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD } from '../constants';

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

    // event listener for direct heals when taking damage with earth shield
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL), this.onEarthShieldHeal);

    // event listener for healing being buffed by having earth shield on the target
    HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD.forEach((spell) => {
      this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(spell), this.onEarthShieldAmpSpellHeal);
    });
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

  onEarthShieldHeal(event) {
    this.healing += (event.amount + (event.absorbed || 0));
  }

  onEarthShieldAmpSpellHeal(event) {
    const combatant = this.combatants.players[event.targetID];
    if (combatant && combatant.hasBuff(SPELLS.EARTH_SHIELD_TALENT.id, event.timestamp)) {
      this.buffHealing += calculateEffectiveHealing(event, EARTHSHIELD_HEALING_INCREASE);
    }
  }

  statistic() {
    return (
      <StatisticBox
        label={<SpellLink id={SPELLS.EARTH_SHIELD_TALENT.id} />}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(45)}
        tooltip={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))}% from the HoT and ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.buffHealing))}% from the healing increase.`}
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
