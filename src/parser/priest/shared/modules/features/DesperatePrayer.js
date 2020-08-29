import React from 'react';
import StatisticBox from 'interface/others/StatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class DesperatePrayer extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
  };

  desperatePrayerUsages = [];
  deathsWithDPReady = 0;

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.DESPERATE_PRAYER.id) {
      return;
    }
    this.desperatePrayerUsages.push({
      damageTaken: 0,
      originalHealth: 0,
      originalMaxHealth: 0,
    });
  }

  on_toPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.DESPERATE_PRAYER.id) {
      return;
    }
    this.lastDesperatePrayerUsage.originalHealth = event.hitPoints - event.amount;
    this.lastDesperatePrayerUsage.originalMaxHealth = event.maxHitPoints;
  }

  on_toPlayer_damage(event) {
    if(!this.selectedCombatant.hasBuff(SPELLS.DESPERATE_PRAYER.id)) {
      return;
    }

    this.lastDesperatePrayerUsage.damageTaken += event.amount + event.absorbed;
  }

  on_toPlayer_death(event) {
    if(!this.spellUsable.isOnCooldown(SPELLS.DESPERATE_PRAYER.id)){
      this.deathsWithDPReady += 1;
    }
  }

  get lastDesperatePrayerUsage() {
    return this.desperatePrayerUsages[this.desperatePrayerUsages.length - 1];
  }

  statistic() {
    return (
      <StatisticBox
        value={`${this.desperatePrayerUsages.length}`}
        label={`Desperate Prayer Usage(s)`}
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
                    <td>{ formatPercentage(dp.damageTaken / dp.originalMaxHealth) } %</td>
                    <td>{ formatPercentage(dp.originalHealth / dp.originalMaxHealth) } %</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </StatisticBox>
    );
  }

  suggestions(when) {
    const boss = this.owner.boss;
    if (!boss || !boss.fight.disableDeathSuggestion) {
      when(this.deathsWithDPReady).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>You died with <SpellLink id={SPELLS.DESPERATE_PRAYER.id} /> available.</>)
            .icon(SPELLS.DESPERATE_PRAYER.icon)
            .actual(`You died ${this.deathsWithDPReady} time(s) with Desperate Prayer available.`)
            .recommended(`0 is recommended`);
        });
    }
  }
}

export default DesperatePrayer;
