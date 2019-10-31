import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import { getIcon, getName } from 'parser/shared/modules/features/STAT';
import SpellIcon from 'common/SpellIcon';

import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import StatisticGroup from 'interface/statistics/StatisticGroup';

import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

import UptimeIcon from 'interface/icons/Uptime';
import { formatPercentage, formatNumber } from 'common/format';

const PRIMARY_AMOUNT = 264;
const SECONDARY_AMOUNT = 170;

const BUFFS = {
  [SPELLS.FORCE_MULTIPLIER_AGI.id]: {agility: PRIMARY_AMOUNT},
  [SPELLS.FORCE_MULTIPLIER_STR.id]: {strength: PRIMARY_AMOUNT},
  [SPELLS.FORCE_MULTIPLIER_HASTE.id]: {haste: SECONDARY_AMOUNT},
  [SPELLS.FORCE_MULTIPLIER_CRIT.id]: {crit: SECONDARY_AMOUNT},
  [SPELLS.FORCE_MULTIPLIER_MASTERY.id]: {mastery: SECONDARY_AMOUNT},
};

export default class ForceMultiplier extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.mainHand && this.selectedCombatant.mainHand.permanentEnchant === ITEMS.ENCHANT_WEAPON_FORCE_MULTIPLIER.effectId;

    if(!this.active) {
      return;
    }

    Object.entries(BUFFS).forEach(([key, value]) => this.stats.add(key, value));
  }

  get avgStats() {
    return Object.entries(BUFFS).reduce((result, [key, value]) => {
      const uptime = this.selectedCombatant.getBuffUptime(key) / this.owner.fightDuration;
      if(uptime > 0) {
        Object.entries(value).forEach(([stat, amount]) => {
          result[stat] = amount * uptime;
        });
      }
      return result;
    }, {});
  }

  get uptime() {
    return Object.keys(BUFFS).reduce((maxUptime, key) => {
      const uptime = this.selectedCombatant.getBuffUptime(key) / this.owner.fightDuration;
      return Math.max(maxUptime, uptime);
    }, 0);
  }

  _translateStat(stat) {
    if(stat === 'crit') {
      return 'criticalstrike';
    } else {
      return stat;
    }
  }

  _getName(stat) {
    if(stat === 'crit') {
      return 'Crit.';
    } else {
      return getName(stat);
    }
  }

  avgStatElements() {
    return Object.entries(this.avgStats).filter(([stat, amount]) => amount > 0)
      .map(([stat, amount]) => {
        const Icon = getIcon(this._translateStat(stat));
        return (
          <span key={stat}>
            <Icon />{' '}
            {formatNumber(amount)} Avg. {this._getName(stat)}<br />
          </span>
        );
      });
  }

  statistic() {
    return (
      <StatisticGroup category={STATISTIC_CATEGORY.ITEMS}>
        <ItemStatistic ultrawide size="flexible">
          <div className="pad">
            <label><SpellIcon id={SPELLS.FORCE_MULTIPLIER_CRIT.id} /> Enchant Weapon: Force Multiplier</label>
            <div className="value">
              <UptimeIcon /> {formatPercentage(this.uptime)}% <small>Uptime</small><br />
              {this.avgStatElements()}
            </div>
          </div>
        </ItemStatistic>
      </StatisticGroup>
    );
  }
}
