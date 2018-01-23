import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import Toggle from 'react-toggle';

import Wrapper from 'common/Wrapper';
import { formatNumber, formatPercentage } from 'common/format';

class AtonementHealingBreakdown extends React.Component {
  static propTypes = {
    analyzer: PropTypes.shape({
      totalAtonement: PropTypes.object.isRequired,
      total: PropTypes.number.isRequired,
      bySource: PropTypes.object.isRequired,
      parser: PropTypes.shape({
        fightDuration: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  };

  constructor() {
    super();
    this.state = {
      absolute: false,
    };
  }

  render() {
    const { analyzer } = this.props;

    const { totalAtonement, bySource, total, owner: parser } = analyzer;

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
              <th colSpan="2">
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
              <th>Overheal</th>
            </tr>
          </thead>
          <tbody>
            {bySource && Object.keys(bySource)
              .sort((a, b) => bySource[b].healing.effective - bySource[a].healing.effective)
              .map((spellId) => {
                const { ability, healing, bolts } = bySource[spellId];

                const currentTotal = this.state.absolute ? total : totalAtonement.effective;

                return (
                  <Wrapper>
                    <tr key={ability.guid}>
                      <td style={{ width: '30%' }}>
                        <SpellLink id={ability.guid}>
                          <Icon icon={ability.abilityIcon} />{' '}
                          {ability.name}
                        </SpellLink>
                      </td>
                      <td style={{ paddingRight: 5, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {formatPercentage(healing.effective / currentTotal)} %
                      </td>
                      <td style={{ width: '70%' }}>
                        {/* TODO: Color the bar based on the damage type, physical = yellow, chaos = gradient, etc. idk */}
                        <div
                          className="performance-bar"
                          style={{ width: `${healing.effective / highestHealing * 100}%` }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <dfn data-tip={`Total: ${formatNumber(healing.effective)}`}>
                          {formatNumber(healing.effective / parser.fightDuration * 1000)} HPS
                        </dfn>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {formatPercentage(healing.overheal / healing.raw)} %
                      </td>
                    </tr>

                    {bolts && bolts.map((value, index) => {
                      if (!value) {
                        return null;
                      }

                      return (
                        <tr>
                          <td style={{ width: '30%', paddingLeft: 50 }}>
                            <SpellLink id={ability.guid}>
                              <Icon icon={ability.abilityIcon} />{' '}
                              {ability.name} Bolt {index + 1}
                            </SpellLink>
                          </td>
                          <td style={{ paddingRight: 5, textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {formatPercentage(value.effective / currentTotal)} %
                          </td>
                          <td style={{ width: '70%', paddingLeft: 50 }}>
                            <div
                              className="performance-bar"
                              style={{ width: `${value.effective / healing.effective * 100}%` }}
                            />
                          </td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <dfn data-tip={`Total: ${formatNumber(value)}`}>
                              {formatNumber(value.effective / parser.fightDuration * 1000)} HPS
                            </dfn>
                          </td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {formatPercentage(value.overheal / healing.raw)} %
                          </td>
                        </tr>
                      );
                    })}
                  </Wrapper>
                );
              })}

          </tbody>
        </table>
      </div>
    );
  }
}

export default AtonementHealingBreakdown;
