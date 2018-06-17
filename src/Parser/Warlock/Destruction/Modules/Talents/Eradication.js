import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import StatisticsListBox from 'Main/StatisticsListBox';

const ERADICATION_DAMAGE_BONUS = 0.1;

// only calculates the bonus damage, output depends if we have the talent directly or via legendary finger (then it appears as either a Statistic or Item)
class Eradication extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  _hasCDF = false;
  _buffedCB = 0;
  _totalCB = 0;
  _buffedCDF = 0;
  _totalCDF = 0;
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ERADICATION_TALENT.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_NETHERLORD.id);
    this._hasCDF = this.combatants.selected.hasTalent(SPELLS.CHANNEL_DEMONFIRE_TALENT.id);
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
      <div className="flex">
        <div className="flex-main">
          Uptime
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Your Eradication contributed ${this.owner.formatItemDamageDone(this.bonusDmg)} (${formatNumber(this.bonusDmg)} damage).`}>
            {formatPercentage(this.uptime)} %
          </dfn>
        </div>
      </div>
    );
  }

  get chaosBoltStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          Buffed <SpellLink id={SPELLS.CHAOS_BOLT.id} icon>Chaos Bolts</SpellLink>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`${this._buffedCB} / ${this._totalCB}`}>
            {formatPercentage(this.CBpercentage)} %
          </dfn>
        </div>
      </div>
    );
  }

  get channelDemonfireStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          Buffed <SpellLink id={SPELLS.CHANNEL_DEMONFIRE_TALENT.id} icon /> ticks
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`${this._buffedCDF} / ${this._totalCDF}`}>
            {formatPercentage(this.CDFpercentage)} %
          </dfn>
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <StatisticsListBox title={<SpellLink id={SPELLS.ERADICATION_TALENT.id} icon />}>
        {this.uptimeStatistic}
        {this.chaosBoltStatistic}
        {this._hasCDF && this.channelDemonfireStatistic}
      </StatisticsListBox>
    );
  }
}

export default Eradication;
