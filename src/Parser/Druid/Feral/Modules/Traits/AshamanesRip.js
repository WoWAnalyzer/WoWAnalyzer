import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';

/**
 * Ashamane's Bite (Artifact Trait)
 * Combo point generators on targets with your Rip have a 10% chance to place a duplicate of that Rip on the target.
 * There is a maximum of one Ashamane's Rip active on a target at once, and it will be overriden if it procs again. 
 * Ashamane's Rip copies the damage and duration of the Rip at the moment it is created.
 * For this reason it's beneficial to pool energy before refreshing Rip so you can use many combo point generators when the Rip still has a long duration in the hope of copying a long duration rip.
 */
class AshamanesRip extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.ASHAMANES_BITE.id] === 1;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.ASHAMANES_RIP.id){
      return;
    }
    
    this.damage += (event.amount || 0) + (event.absorbed || 0) + (event.overkill || 0);
  }

  get ashamanesRipUptime() {
    return this.enemies.getBuffUptime(SPELLS.ASHAMANES_RIP.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.ashamanesRipUptime,
      isLessThan: {
        minor: 0.40,
        average: 0.30,
        major: 0.20,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          Your <SpellLink id={SPELLS.ASHAMANES_RIP.id} /> uptime can be improved. Pooling energy before refreshing Rip lets you maximise the chance of triggering a long duration Ashamane's Rip.
        </React.Fragment>
      )
        .icon(SPELLS.ASHAMANES_RIP.icon)
        .actual(`${formatPercentage(actual)}% Ashamane's Rip uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <SmallStatisticBox
        icon={<SpellIcon id={SPELLS.ASHAMANES_RIP.id} />}
        value={`${formatPercentage(this.ashamanesRipUptime)} %`}
        label="Ashamane's Rip uptime"
        tooltip={`Your Ashamane's Rip contributed ${formatNumber(this.damage)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))}%)`}
      />
    );
  }
  
  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default AshamanesRip;
