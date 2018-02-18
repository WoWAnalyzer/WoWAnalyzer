import React from 'react';

import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import STAT, { getName, getClassNameColor, getIcon } from './STAT';
import StatTracker from '../StatTracker';

/**
 * @property {StatTracker} statTracker
 */
class StatsDisplay extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  getStatRating(stat) {
    switch (stat) {
      case STAT.STRENGTH: return this.statTracker.startingStrengthRating;
      case STAT.AGILITY: return this.statTracker.startingAgilityRating;
      case STAT.INTELLECT: return this.statTracker.startingIntellectRating;
      case STAT.STAMINA: return this.statTracker.startingStaminaRating;
      case STAT.CRITICAL_STRIKE: return this.statTracker.startingCritRating;
      case STAT.HASTE: return this.statTracker.startingHasteRating;
      case STAT.MASTERY: return this.statTracker.startingMasteryRating;
      case STAT.VERSATILITY: return this.statTracker.startingVersatilityRating;
      case STAT.LEECH: return this.statTracker.startingLeechRating;
      case STAT.AVOIDANCE: return this.statTracker.startingAvoidanceRating;
      case STAT.SPEED: return this.statTracker.startingSpeedRating;
      default: return null;
    }
  }
  getStatPercentage(stat) {
    switch (stat) {
      case STAT.CRITICAL_STRIKE: return this.statTracker.critPercentage(this.statTracker.startingCritRating, true);
      case STAT.HASTE: return this.statTracker.hastePercentage(this.statTracker.startingHasteRating, true);
      case STAT.MASTERY: return this.statTracker.masteryRatingPerPercent === null ? null : this.statTracker.masteryPercentage(this.statTracker.startingMasteryRating, true);
      case STAT.VERSATILITY: return this.statTracker.versatilityPercentage(this.statTracker.startingVersatilityRating, true);
      case STAT.LEECH: return this.statTracker.leechPercentage(this.statTracker.startingLeechRating, true);
      case STAT.AVOIDANCE: return this.statTracker.avoidancePercentage(this.statTracker.startingAvoidanceRating, true);
      case STAT.SPEED: return this.statTracker.speedPercentage(this.statTracker.startingSpeedRating, true);
      default: return null;
    }
  }
  get primaryStat() {
    if (this.statTracker.startingStrengthRating > this.statTracker.startingAgilityRating && this.statTracker.startingStrengthRating > this.statTracker.startingIntellectRating) {
      return STAT.STRENGTH;
    }
    if (this.statTracker.startingAgilityRating > this.statTracker.startingStrengthRating && this.statTracker.startingAgilityRating > this.statTracker.startingIntellectRating) {
      return STAT.AGILITY;
    }
    if (this.statTracker.startingIntellectRating > this.statTracker.startingStrengthRating && this.statTracker.startingIntellectRating > this.statTracker.startingAgilityRating) {
      return STAT.INTELLECT;
    }
    return null;
  }
  getTertiarySpell(stat) {
    switch (stat) {
      case STAT.LEECH: return SPELLS.LEECH.id;
      case STAT.AVOIDANCE: return SPELLS.AVOIDANCE.id;
      case STAT.SPEED: return SPELLS.SPEED.id;
      default: return null;
    }
  }

  renderStatValue(stat) {
    const rating = this.getStatRating(stat);
    const percentage = this.getStatPercentage(stat);

    return percentage === null ? formatThousands(rating) : `${formatPercentage(percentage)}% - ${formatThousands(rating)} Rating`;
  }

  // This is a special module, we're giving it a custom position. Normally we'd use "statistic" instead.
  render() {
    const mainStats = [
      this.primaryStat,
      STAT.STAMINA,
      STAT.CRITICAL_STRIKE,
      STAT.HASTE,
      STAT.MASTERY,
      STAT.VERSATILITY,
    ];
    const tertiaries = [
      STAT.LEECH,
      STAT.AVOIDANCE,
      STAT.SPEED,
    ];

    return (
      <div className="panel" style={{ border: 0 }}>
        <div className="panel-heading">
          <h2>
            <dfn data-tip="These stats includes any <b>rating</b> buffs, such as flasks, potions and other buffs. Percentage buffs such as Bloodlust are <b>not</b> included.">
              Stats on pull
            </dfn>
          </h2>
        </div>
        <div className="panel-body flex" style={{ flexDirection: 'row', padding: 0 }}>
          <div className="row">
            {mainStats.map(stat => {
              const Icon = getIcon(stat);

              return (
                <div className={`flex-main ${getClassNameColor(stat)}`} key={stat} style={{ height: '3em', marginTop: 10 }}>
                  <div className="col-md-1"/>
                  <div className="col-md-2">
                    <Icon style={{ width: '3em', height: '3em' }} />
                  </div>
                  <div className="col-md-8">
                    <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>
                      {getName(stat)}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {this.renderStatValue(stat)}
                    </div>
                    <div className="col-md-1"/>
                  </div>
                </div>
              );
            })}
            {tertiaries.map(stat => {
              if (this.getStatRating(stat) > 0) {
                return (
                  <div key={stat} className={`flex-main ${getClassNameColor(stat)}`} style={{ height: '3em', marginTop: 10 }}>
                    <div className="col-md-1"/>
                    <div className="col-md-2">
                      <SpellIcon id={this.getTertiarySpell(stat)} style={{ height: '3em', borderRadius: 2 }} />
                    </div>
                    <div className="col-md-8">
                      <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>
                        {getName(stat)}
                      </div>
                      <div style={{ fontSize: 13 }}>
                        {this.renderStatValue(stat)}
                      </div>
                      <div className="col-md-1"/>
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default StatsDisplay;
