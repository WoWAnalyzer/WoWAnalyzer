import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import StatisticsListBox from 'Interface/Others/StatisticsListBox';
import StatisticListBoxItem from 'Interface/Others/StatisticListBoxItem';

const ERADICATION_DAMAGE_BONUS = 0.1;

// only calculates the bonus damage, output depends if we have the talent directly or via legendary finger (then it appears as either a Statistic or Item)
class Eradication extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  _hasCDF = false;
  _buffedCB = 0;
  _totalCB = 0;
  _buffedCDF = 0;
  _totalCDF = 0;
  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ERADICATION_TALENT.id);
    this._hasCDF = this.selectedCombatant.hasTalent(SPELLS.CHANNEL_DEMONFIRE_TALENT.id);
  }

  // TODO: SPELL QUEUE ON CAST, SPELLS SNAPSHOT ON CAST, NOT ON HIT SO THIS IS INACCURATE
  on_byPlayer_damage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }

    const buffed = enemy.hasBuff(SPELLS.ERADICATION_DEBUFF.id, event.timestamp);

    if (event.ability.guid === SPELLS.CHAOS_BOLT.id) {
      if (buffed) {
        this._buffedCB += 1;
      }
      this._totalCB += 1;
    }
    if (event.ability.guid === SPELLS.CHANNEL_DEMONFIRE_DAMAGE.id) {
      if (buffed) {
        this._buffedCDF += 1;
      }
      this._totalCDF += 1;
    }

    this.bonusDmg += calculateEffectiveDamage(event, ERADICATION_DAMAGE_BONUS);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.ERADICATION_DEBUFF.id) / this.owner.fightDuration;
  }

  get CBpercentage() {
    return this._buffedCB / this._totalCB || 0;
  }

  get CDFpercentage() {
    return this._buffedCDF / this._totalCDF || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.7,
        average: 0.65,
        major: 0.55,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your uptime on the <SpellLink id={SPELLS.ERADICATION_DEBUFF.id} /> debuff could be improved. You should try to spread out your <SpellLink id={SPELLS.CHAOS_BOLT.id} /> casts more for higher uptime.<br /><small><em>NOTE:</em> Uptime may vary based on the encounter.</small></React.Fragment>)
          .icon(SPELLS.ERADICATION_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Eradication uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  get uptimeStatistic() {
    return (
      <StatisticListBoxItem
        title="Uptime"
        value={`${formatPercentage(this.uptime)} %`}
        valueTooltip={`Your Eradication contributed ${this.owner.formatItemDamageDone(this.bonusDmg)} (${formatNumber(this.bonusDmg)} damage).`}
      />
    );
  }

  get chaosBoltStatistic() {
    return (
      <StatisticListBoxItem
        title={<React.Fragment>Buffed <SpellLink id={SPELLS.CHAOS_BOLT.id}>Chaos Bolts</SpellLink></React.Fragment>}
        value={`${formatPercentage(this.CBpercentage)} %`}
        valueTooltip={`${this._buffedCB} / ${this._totalCB}`}
      />
    );
  }

  get channelDemonfireStatistic() {
    return (
      <StatisticListBoxItem
        title={<React.Fragment>Buffed <SpellLink id={SPELLS.CHANNEL_DEMONFIRE_TALENT.id} /> ticks</React.Fragment>}
        value={`${formatPercentage(this.CDFpercentage)} %`}
        valueTooltip={`${this._buffedCDF} / ${this._totalCDF}`}
      />
    );
  }

  statistic() {
    return (
      <StatisticsListBox title={<SpellLink id={SPELLS.ERADICATION_TALENT.id} />}>
        {this.uptimeStatistic}
        {this.chaosBoltStatistic}
        {this._hasCDF && this.channelDemonfireStatistic}
      </StatisticsListBox>
    );
  }
}

export default Eradication;
