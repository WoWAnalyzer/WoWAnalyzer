import React from 'react';
import StatisticBox from 'interface/others/StatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class DesperatePrayer extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
  };

  desperatePrayerUsages = [];
  deathsWithDPReady = 0;

  constructor(options){
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DESPERATE_PRAYER), this.onApplyBuff);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER).spell(SPELLS.DESPERATE_PRAYER), this.onHeal);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.onDeath);
  }

  onApplyBuff(event) {
    this.desperatePrayerUsages.push({
      damageTaken: 0,
      originalHealth: 0,
      originalMaxHealth: 0,
    });
  }

  onHeal(event) {
    this.lastDesperatePrayerUsage.originalHealth = event.hitPoints - event.amount;
    this.lastDesperatePrayerUsage.originalMaxHealth = event.maxHitPoints;
  }

  onDamageTaken(event) {
    if(!this.selectedCombatant.hasBuff(SPELLS.DESPERATE_PRAYER.id)) {
      return;
    }

    this.lastDesperatePrayerUsage.damageTaken += event.amount + event.absorbed;
  }

  onDeath(event) {
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
        label="Desperate Prayer Usage(s)"
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
        .addSuggestion((suggest, actual, recommended) => suggest(<>You died with <SpellLink id={SPELLS.DESPERATE_PRAYER.id} /> available.</>)
            .icon(SPELLS.DESPERATE_PRAYER.icon)
            .actual(i18n._(t('priest.shared.suggestions.DesperatePrayer.efficiency')`You died ${this.deathsWithDPReady} time(s) with Desperate Prayer available.`))
            .recommended(`0 is recommended`));
    }
  }
}

export default DesperatePrayer;
