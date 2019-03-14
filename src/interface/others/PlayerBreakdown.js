import React from 'react';
import PropTypes from 'prop-types';

import SPECS from 'game/SPECS';
import SpecIcon from 'common/SpecIcon';
import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';
import indexByProperty from 'common/indexByProperty';

class PlayerBreakdown extends React.Component {
  static propTypes = {
    report: PropTypes.object.isRequired,
    players: PropTypes.array.isRequired,
  };

  calculatePlayerBreakdown(statsByTargetId, players) {
    const friendlyStats = [];
    const playersById = indexByProperty(players, 'id');
    Object.keys(statsByTargetId)
      .forEach(targetId => {
        const playerStats = statsByTargetId[targetId];
        const playerInfo = playersById[targetId];

        if (playerInfo) {
          friendlyStats.push({
            ...playerInfo,
            ...playerStats,
            masteryEffectiveness: playerStats.healingFromMastery / (playerStats.maxPotentialHealingFromMastery || 1),
          });
        }
      });

    return friendlyStats;
  }

  render() {
    const { report, players } = this.props;

    const friendlyStats = this.calculatePlayerBreakdown(report, players);
    const totalEffectiveHealing = Object.values(report).reduce((sum, player) => sum + player.effectiveHealing, 0);
    const highestEffectiveHealing = friendlyStats.reduce((highest, player) => Math.max(highest, player.effectiveHealing), 1);
    const highestMasteryEffectiveness = friendlyStats.reduce((highest, player) => Math.max(highest, player.masteryEffectiveness), 0);

    return (
      <table className="data-table">
        <thead>
          <tr style={{ textTransform: 'uppercase' }}>
            <th><Trans>Name</Trans></th>
            <th colSpan="2"><Trans>Mastery effectiveness</Trans></th>
            <th colSpan="3"><TooltipElement content={<Trans>This is the amount of healing done by spells affected by mastery. Things like Holy Paladin beacons or Restoration Shaman feeding are NOT included.</Trans>}><Trans>Healing done</Trans></TooltipElement></th>
          </tr>
        </thead>
        <tbody>
          {friendlyStats && friendlyStats
            .sort((a, b) => b.masteryEffectiveness - a.masteryEffectiveness)
            .map((player) => {
              const combatant = player.combatant;
              if (!combatant) {
                console.error('Missing combatant:', player);
                return null; // pet or something
              }
              const spec = SPECS[combatant.specId];
              const specClassName = spec.className.replace(' ', '');
              // We want the performance bar to show a full bar for whatever healing done percentage is highest to make
              // it easier to see relative amounts.
              const performanceBarMasteryEffectiveness = player.masteryEffectiveness / highestMasteryEffectiveness;
              const performanceBarHealingReceivedPercentage = player.effectiveHealing / highestEffectiveHealing;
              const actualHealingReceivedPercentage = player.effectiveHealing / totalEffectiveHealing;

              return (
                <tr key={combatant.id}>
                  <td style={{ width: '20%' }}>
                    <SpecIcon id={spec.id} />{' '}
                    {combatant.name}
                  </td>
                  <td style={{ width: 50, textAlign: 'right' }}>
                    {(Math.round(player.masteryEffectiveness * 10000) / 100).toFixed(2)}%
                  </td>
                  <td style={{ width: '40%' }}>
                    <div className="flex performance-bar-container">
                      <div
                        className={`flex-sub performance-bar ${specClassName}-bg`}
                        style={{ width: `${performanceBarMasteryEffectiveness * 100}%` }}
                      />
                    </div>
                  </td>
                  <td style={{ width: 50, textAlign: 'right' }}>
                    {(Math.round(actualHealingReceivedPercentage * 10000) / 100).toFixed(2)}%
                  </td>
                  <td style={{ width: '40%' }}>
                    <div className="flex performance-bar-container">
                      <div
                        className={`flex-sub performance-bar ${specClassName}-bg`}
                        style={{ width: `${performanceBarHealingReceivedPercentage * 100}%` }}
                      />
                    </div>
                  </td>
                  <td style={{ width: 50, textAlign: 'right' }}>
                    {(formatNumber(player.effectiveHealing))}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    );
  }
}

export default PlayerBreakdown;
