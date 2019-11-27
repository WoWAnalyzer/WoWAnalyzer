import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/others/ItemHealingDone';
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
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL), this.onEarthShieldDirectHeal);

    // event listener for healing being buffed by having earth shield on the target
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(HEALING_ABILITIES_AMPED_BY_EARTH_SHIELD), this.onHeal);
  }

  onEarthShieldDirectHeal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.EARTH_SHIELD_HEAL.id) {
      this.healing += calculateEffectiveHealing(event, 0);
    }
  }

  onHeal(event) {
    const combatant = this.combatants.players[event.targetID];
    if (combatant && combatant.hasBuff(SPELLS.EARTH_SHIELD_TALENT.id, event.timestamp)) {
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
