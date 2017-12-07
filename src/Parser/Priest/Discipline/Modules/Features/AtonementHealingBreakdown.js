import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import Toggle from 'react-toggle';

class AtonementHealingBreakdown extends React.Component {
  static propTypes = {
    totalAtonement: PropTypes.object.isRequired,
    total: PropTypes.object.isRequired,
    bySource: PropTypes.object.isRequired,
  };

    constructor() {
      super();
      this.state = {
        absolute: false,
      };
    }

  render() {
    const { totalAtonement, bySource, total } = this.props;

    const highestHealing = Object.keys(bySource)
      .map(key => bySource[key])
      .reduce((highest, source) => Math.max(highest, source.healing.effective), 1);

    return (
      <div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Healing</th>
              <th>
              <div className="text-right toggle-control">
                <Toggle
                  defaultChecked={false}
                  icons={false}
                  onChange={event => this.setState({ absolute: event.target.checked })}
                  id="absolute-toggle"
                />
                <label htmlFor="absolute-toggle">
                  Relative to total healing
                </label>
              </div>
              </th>
          </tr>
        </thead>
        <tbody>
          {bySource && Object.keys(bySource)
            .sort((a, b) => bySource[b].healing.effective - bySource[a].healing.effective)
            .map((spellId) => {
              const { ability, healing, bolts } = bySource[spellId];

              const performanceBarPercentage = healing.effective / highestHealing;

              return ([
                <tr key={ability.guid}>
                  <td style={{ width: '30%' }}>
                    <SpellLink id={ability.guid}>
                      <Icon icon={ability.abilityIcon} />{' '}
                      {ability.name}
                    </SpellLink>
                  </td>
                  {!this.state.absolute && (
                  <td style={{ width: 60, paddingRight: 5, textAlign: 'center' }}>
                    {(Math.round(healing.effective / totalAtonement.effective * 10000) / 100).toFixed(2)}%
                  </td>)
                  }
                  {this.state.absolute && (
                  <td style={{ width: 60, paddingRight: 5, textAlign: 'center' }}>
                    {(Math.round(healing.effective / total * 10000) / 100).toFixed(2)}%
                  </td>)
                  }
                  <td style={{ width: '70%' }}>
                    {/* TODO: Color the bar based on the damage type, physical = yellow, chaos = gradient, etc. idk */}
                    <div
                      className={'performance-bar'}
                      style={{ width: `${performanceBarPercentage * 100}%` }}
                    />
                  </td>
                </tr>

              , (bolts && bolts.map((value,index) => {

                const penanceBarPercentage = value / healing.effective;

                if(!value) return null;

                const currentTotal = this.state.absolute ? total : totalAtonement.effective;

                return (
                  <tr>
                    <td style={{ width: '30%', paddingLeft:50 }}>
                      <SpellLink id={ability.guid}>
                        <Icon icon={ability.abilityIcon} />{' '}
                        {ability.name} Bolt {index + 1}
                      </SpellLink>
                    </td>
                    <td style={{ width: 60, paddingRight: 5, textAlign: 'center' }}>
                      {(Math.round(value / currentTotal * 10000) / 100).toFixed(2)}%
                    </td>
                    <td style={{ width: '70%', paddingLeft: 50 }}>
                      <div
                        className={'performance-bar'}
                        style={{ width: `${penanceBarPercentage * 100}%` }}
                      />
                    </td>
                  </tr>
                );
              })),
            ]);
          })}

          </tbody>
      </table>
      </div>
    );
  }
}

export default AtonementHealingBreakdown;
