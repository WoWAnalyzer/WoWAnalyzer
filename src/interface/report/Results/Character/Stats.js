import React from 'react';
import PropTypes from 'prop-types';

import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Tooltip from 'common/Tooltip';
import StatTracker from 'parser/shared/modules/StatTracker';
import STAT, { getClassNameColor, getIcon, getNameTranslated } from 'parser/shared/modules/features/STAT';
import { Trans } from '@lingui/macro';

class Stats extends React.PureComponent {
  static propTypes = {
    statTracker: PropTypes.instanceOf(StatTracker).isRequired,
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
      case STAT.MASTERY: return statTracker.hasMasteryCoefficient ? statTracker.masteryPercentage(statTracker.startingMasteryRating, true) : null;
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
      <>
        <div className="row">
          <div className="col-md-12">
            <Tooltip
              content={(
                <Trans id="shared.characterPanel.stats.pull.tooltip">
                  These stats include any <strong>rating</strong> buffs, such as flasks, potions and other buffs. Percentage buffs such as Bloodlust are <strong>not</strong> included.
                </Trans>
              )}
            >
              <h2 style={{ marginTop: 0 }}>
                  <Trans id="shared.characterPanel.stats.pull">Stats on pull</Trans>
              </h2>
            </Tooltip>
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
                  {getNameTranslated(stat)}
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
                  {getNameTranslated(stat)}
                </div>
                <div style={{ fontSize: '0.9em' }}>
                  {this.renderStatValue(stat)}
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  }
}

export default Stats;
