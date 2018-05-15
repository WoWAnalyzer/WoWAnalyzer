import React from 'react';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';

class DesperatePrayer extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  desperatePrayerUsages = [];
  currentDesperatePrayerUsage;
  deathsWithDPReady = 0;

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.DESPERATE_PRAYER.id) {
      return;
    }
    this.currentDesperatePrayerUsage = {
      DamageTaken: 0,
      HPWhenUsed: 0,
      MaxHPWhenUsed: 0,
    };
  }

  on_toPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.DESPERATE_PRAYER.id) {
      return;
    }
    this.currentDesperatePrayerUsage.HPWhenUsed = event.hitPoints - event.amount;
    this.currentDesperatePrayerUsage.MaxHPWhenUsed = event.maxHitPoints;
  }

  on_toPlayer_damage(event) {
    if(!this.combatants.selected.hasBuff(SPELLS.DESPERATE_PRAYER.id)) {
      return;
    }
    this.currentDesperatePrayerUsage.DamageTaken += event.amount || 0;
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.DESPERATE_PRAYER.id) {
      return;
    }
    this.desperatePrayerUsages.push(this.currentDesperatePrayerUsage);
  }

  on_toPlayer_death(event) {
    if(!this.spellUsable.isOnCooldown(SPELLS.DESPERATE_PRAYER.id)){
      this.deathsWithDPReady++;
    }
  }

  statistic() {
    return (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.DESPERATE_PRAYER.id} />}>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast</th>
              <th>Damage Taken</th>
              <th>Health When Used</th>
            </tr>
          </thead>
          <tbody>
            {
              this.desperatePrayerUsages
                .map((dp, index) => (
                  <tr key={index}>
                    <th scope="row">{ index + 1 }</th>
                    <td>{ formatPercentage(dp.DamageTaken / dp.MaxHPWhenUsed) } %</td>
                    <td>{ formatPercentage(dp.HPWhenUsed / dp.MaxHPWhenUsed) } %</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }

  suggestions(when) {
    when(this.deathsWithDPReady).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You died with <SpellLink id={SPELLS.DESPERATE_PRAYER.id} /> on cooldown.</span>)
          .icon(SPELLS.DESPERATE_PRAYER.icon)
          .actual(`You died ${this.deathsWithDPReady} times with Desperate Prayer on cooldown.`)
          .recommended(`0 is recommended`);
      });
  }
}

export default DesperatePrayer;
