import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';

class AtonementHealingBreakdown extends React.Component {
  static propTypes = {
    totalAtonement: PropTypes.object.isRequired,
    total: PropTypes.object.isRequired,
    bySource: PropTypes.object.isRequired,
  };

  render() {
    const { totalAtonement, bySource, total } = this.props;

    const highestHealing = Object.keys(bySource)
      .map(key => bySource[key])
      .reduce((highest, source) => Math.max(highest, source.healing.effective), 1);

    return (
      <table className="data-table">
        <thead>
          <tr>
            <th></th>
            <th colspan="2" style={{textAlign: 'center', fontSize: 16}}>Healing Done</th>
            <th></th>
          </tr>
          <tr>
            <th>Name</th>
            <th style={{textAlign: 'center'}}>Relative</th>
            <th style={{textAlign: 'center'}}>Absolute</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bySource && Object.keys(bySource)
            .sort((a, b) => bySource[b].healing.effective - bySource[a].healing.effective)
            .map((spellId) => {
              const { ability, healing } = bySource[spellId];

              const performanceBarPercentage = healing.effective / highestHealing;

              return (
                <tr key={ability.guid}>
                  <td style={{ width: '30%' }}>
                    <SpellLink id={ability.guid}>
                      <Icon icon={ability.abilityIcon} />{' '}
                      {ability.name}
                    </SpellLink>
                  </td>
                  <td style={{ width: 60, paddingRight: 5, textAlign: 'center' }}>
                    {(Math.round(healing.effective / totalAtonement.effective * 10000) / 100).toFixed(2)}%
                  </td>
                  <td style={{ width: 60, paddingRight: 5, textAlign: 'center' }}>
                    {(Math.round(healing.effective / total * 10000) / 100).toFixed(2)}%
                  </td>
                  <td style={{ width: '70%' }}>
                    {/* TODO: Color the bar based on the damage type, physical = yellow, chaos = gradient, etc. idk */}
                    <div
                      className={'performance-bar'}
                      style={{ width: `${performanceBarPercentage * 100}%` }}
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

export default AtonementHealingBreakdown;
