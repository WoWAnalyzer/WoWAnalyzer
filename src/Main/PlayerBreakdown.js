import React from 'react';

import SPEC_IDS from './SPEC_IDS';

const PlayerBreakdown = ({ friendlyStats, highestHealingFromMastery, totalHealingFromMastery }) => (
  <table style={{ width: '100%' }}>
    <thead>
    <tr>
      <th>Name</th>
      <th colSpan="2">Mastery effectiveness</th>
      <th colSpan="2"><dfn title="This is the amount of healing done with abilities that are affected by mastery. Things like beacons are NOT included.">Healing done</dfn></th>
    </tr>
    </thead>
    <tbody>
    {friendlyStats
      .filter(player => !!player.name)
      .sort((a, b) => b.masteryEffectiveness - a.masteryEffectiveness)
      .map(player => {
        const spec = SPEC_IDS[player.specID];
        const specClassName = spec.className.replace(' ', '');
        // We want the performance bar to show a full bar for whatever healing done percentage is highest to make
        // it easier to see relative amounts.
        const performanceBarHealingReceivedPercentage = player.healingFromMastery / highestHealingFromMastery;
        const actualHealingReceivedPercentage = player.healingFromMastery / (totalHealingFromMastery || 1);

        return (
          <tr key={player.name}>
            <td style={{ width: '20%'}}>
              <img src={`./specs/${specClassName}-${spec.spec.replace(' ', '')}.jpg`} style={{ width: '20px', height: '20px', border: '1px solid #000' }} alt="Spec logo" />{' '}
              {player.name}
            </td>
            <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
              {(Math.round(player.masteryEffectiveness * 10000) / 100).toFixed(2)}%
            </td>
            <td style={{ width: '40%' }}>
              <div
                className={`performance-bar ${specClassName}-bg`}
                style={{ width: `${player.masteryEffectiveness * 100}%` }}
              ></div>
            </td>
            <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
              {(Math.round(actualHealingReceivedPercentage * 10000) / 100).toFixed(2)}%
            </td>
            <td style={{ width: '40%' }}>
              <div
                className={`performance-bar ${specClassName}-bg`}
                style={{ width: `${performanceBarHealingReceivedPercentage * 100}%` }}
              ></div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);
PlayerBreakdown.propTypes = {
  friendlyStats: React.PropTypes.arrayOf(React.PropTypes.shape({
    specID: React.PropTypes.number.isRequired,
  })),
  highestHealingFromMastery: React.PropTypes.number.isRequired,
  totalHealingFromMastery: React.PropTypes.number.isRequired,
};

export default PlayerBreakdown;
