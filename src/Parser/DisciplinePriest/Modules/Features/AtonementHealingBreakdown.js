import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';

class AtonementHealingBreakdown extends React.Component {
  static propTypes = {
    total: PropTypes.object.isRequired,
    bySource: PropTypes.object.isRequired,
  };

  render() {
    const { total, bySource } = this.props;

    const highestHealing = Object.keys(bySource)
      .map(key => bySource[key])
      .reduce((highest, source) => Math.max(highest, source.healing.effective), 1);

    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th colSpan="2">Healing done</th>
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
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
                    {(Math.round(healing.effective / total.effective * 10000) / 100).toFixed(2)}%
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
