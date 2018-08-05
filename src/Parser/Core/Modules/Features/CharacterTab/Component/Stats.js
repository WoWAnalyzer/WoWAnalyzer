import React from 'react';
import PropTypes from 'prop-types';

import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import STAT, { getName, getClassNameColor, getIcon } from 'Parser/Core/Modules/Features/STAT';

class Stats extends React.PureComponent {
  static propTypes = {
    statTracker: PropTypes.objectOf(StatTracker).isRequired,
  };
  
  getStatRating(stat) {
    const statTracker = this.props.statTracker;
    switch (stat) {
      case STAT.STRENGTH: return statTracker.startingStrengthRating;
      case STAT.AGILITY: return statTracker.startingAgilityRating;
      case STAT.INTELLECT: return statTracker.startingIntellectRating;
      case STAT.STAMINA: return statTracker.startingStaminaRating;
      case STAT.CRITICAL_STRIKE: return statTracker.startingCritRating;
      case STAT.HASTE: return statTracker.startingHasteRating;
      case STAT.MASTERY: return statTracker.startingMasteryRating;
      case STAT.VERSATILITY: return statTracker.startingVersatilityRating;
      case STAT.LEECH: return statTracker.startingLeechRating;
      case STAT.AVOIDANCE: return statTracker.startingAvoidanceRating;
      case STAT.SPEED: return statTracker.startingSpeedRating;
      default: return null;
    }
  }
  getStatPercentage(stat) {
    const statTracker = this.props.statTracker;
    switch (stat) {
      case STAT.CRITICAL_STRIKE: return statTracker.critPercentage(statTracker.startingCritRating, true);
      case STAT.HASTE: return statTracker.hastePercentage(statTracker.startingHasteRating, true);
      case STAT.MASTERY: return statTracker.masteryRatingPerPercent === null ? null : statTracker.masteryPercentage(statTracker.startingMasteryRating, true);
      case STAT.VERSATILITY: return statTracker.versatilityPercentage(statTracker.startingVersatilityRating, true);
      case STAT.LEECH: return statTracker.leechPercentage(statTracker.startingLeechRating, true);
      case STAT.AVOIDANCE: return statTracker.avoidancePercentage(statTracker.startingAvoidanceRating, true);
      case STAT.SPEED: return statTracker.speedPercentage(statTracker.startingSpeedRating, true);
      default: return null;
    }
  }
  get primaryStat() {
    const statTracker = this.props.statTracker;
    if (statTracker.startingStrengthRating > statTracker.startingAgilityRating && statTracker.startingStrengthRating > statTracker.startingIntellectRating) {
      return STAT.STRENGTH;
    }
    if (statTracker.startingAgilityRating > statTracker.startingStrengthRating && statTracker.startingAgilityRating > statTracker.startingIntellectRating) {
      return STAT.AGILITY;
    }
    if (statTracker.startingIntellectRating > statTracker.startingStrengthRating && statTracker.startingIntellectRating > statTracker.startingAgilityRating) {
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

    return percentage === null ? formatThousands(rating) : `${formatPercentage(percentage)}% - ${formatThousands(rating)} rating`;
  }
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
      <React.Fragment>
        <div className="row" style={{ marginBottom: '2em' }}>
          <div className="col-md-12">
            <h2>
              <dfn data-tip="These stats includes any <b>rating</b> buffs, such as flasks, potions and other buffs. Percentage buffs such as Bloodlust are <b>not</b> included.">
                Stats on pull
              </dfn>
            </h2>
          </div>
        </div>
        {mainStats.map(stat => {
          const Icon = getIcon(stat);

          return (
            <div key={stat} className={`row ${getClassNameColor(stat)}`} style={{ marginBottom: '0.5em' }}>
              <div className="col-xs-2 col-md-3 text-center">
                <Icon style={{ width: '3em', height: '3em' }} />
              </div>
              <div className="col-xs-10 col-md-9">
                <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  {getName(stat)}
                </div>
                <div style={{ fontSize: '0.9em' }}>
                  {this.renderStatValue(stat)}
                </div>
              </div>
            </div>
          );
        })}
        {tertiaries.map(stat => {
          if (this.getStatRating(stat) <= 0) {
            return null;
          }
          return (
            <div key={stat} className={`row ${getClassNameColor(stat)}`} style={{ marginBottom: '0.5em' }}>
              <div className="col-xs-2 col-md-3 text-center">
                <SpellIcon id={this.getTertiarySpell(stat)} style={{ height: '3em', borderRadius: 2 }} />
              </div>
              <div className="col-xs-10 col-md-9">
                <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  {getName(stat)}
                </div>
                <div style={{ fontSize: '0.9em' }}>
                  {this.renderStatValue(stat)}
                </div>
              </div>
            </div>
          );
        })}
      </React.Fragment>
    );
  }
}

export default Stats;
