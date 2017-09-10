import React from 'react';
import PropTypes from 'prop-types';

import SPECS from 'common/SPECS';

class PlayerBreakdown extends React.Component {
  static propTypes = {
    report: PropTypes.object.isRequired,
    playersById: PropTypes.object.isRequired,
  };

  calculatePlayerBreakdown(stats, playersById) {
    const statsByTargetId = stats.statsByTargetId;
    const friendlyStats = [];
    Object.keys(statsByTargetId)
      .forEach(targetId => {
        const playerStats = statsByTargetId[targetId];
        const playerInfo = playersById[targetId];

        if (playerInfo) {
          friendlyStats.push({
            ...playerInfo,
            ...playerStats,
            masteryEffectiveness: playerStats.healingFromMastery / (playerStats.maxPotentialHealingFromMastery || 1),
            healingReceivedPercentage: playerStats.healingReceived / stats.totalHealingWithMasteryAffectedAbilities,
          });
        }
      });

    return friendlyStats;
  }

  render() {
    const { report, playersById } = this.props;

    const friendlyStats = this.calculatePlayerBreakdown(report, playersById);
    const highestHealingFromMastery = friendlyStats.reduce((highest, player) => Math.max(highest, player.healingFromMastery), 1);

    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th colSpan="2">Mastery effectiveness</th>
            <th colSpan="2"><dfn data-tip="This is the amount of healing done with abilities that are affected by mastery. Things like beacons are NOT included.">Healing done</dfn></th>
          </tr>
        </thead>
        <tbody>
          {friendlyStats && friendlyStats
            .sort((a, b) => b.masteryEffectiveness - a.masteryEffectiveness)
            .map(player => {
              const combatants = player.combatant;
              if (!combatants) {
                console.error('Missing combatant:', player);
                return null; // pet or something
              }
              const spec = SPECS[combatants.specId];
              const specClassName = spec.className.replace(' ', '');
              // We want the performance bar to show a full bar for whatever healing done percentage is highest to make
              // it easier to see relative amounts.
              const performanceBarHealingReceivedPercentage = player.healingFromMastery / highestHealingFromMastery;
              const actualHealingReceivedPercentage = player.healingFromMastery / (report.totalHealingFromMastery || 1);

              return (
                <tr key={player.combatant.name}>
                  <td style={{ width: '20%' }}>
                    <img src={`/specs/${specClassName}-${spec.specName.replace(' ', '')}.jpg`} alt="Spec logo" />{' '}
                    {player.combatant.name}
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
                    {(Math.round(player.masteryEffectiveness * 10000) / 100).toFixed(2)}%
                  </td>
                  <td style={{ width: '40%' }}>
                    <div
                      className={`performance-bar ${specClassName}-bg`}
                      style={{ width: `${player.masteryEffectiveness * 100}%` }}
                    />
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
                    {(Math.round(actualHealingReceivedPercentage * 10000) / 100).toFixed(2)}%
                  </td>
                  <td style={{ width: '40%' }}>
                    <div
                      className={`performance-bar ${specClassName}-bg`}
                      style={{ width: `${performanceBarHealingReceivedPercentage * 100}%` }}
                    />
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
