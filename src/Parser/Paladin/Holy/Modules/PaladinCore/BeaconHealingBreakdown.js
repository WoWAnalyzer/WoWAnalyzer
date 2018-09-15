import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import HealingValue from 'Parser/Core/Modules/HealingValue';

class BeaconHealingBreakdown extends React.Component {
  static propTypes = {
    totalHealingDone: PropTypes.instanceOf(HealingValue).isRequired,
    totalBeaconHealing: PropTypes.instanceOf(HealingValue).isRequired,
    beaconHealingBySource: PropTypes.object.isRequired,
    fightDuration: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.state = {
      absolute: false,
    };
  }

  renderTableBody() {
    const { totalHealingDone, totalBeaconHealing, beaconHealingBySource, fightDuration } = this.props;

    const currentTotal = this.state.absolute ? totalHealingDone.effective : totalBeaconHealing.effective;
    const highestHealing = Object.keys(beaconHealingBySource)
      .map(key => beaconHealingBySource[key])
      .reduce((highest, source) => Math.max(highest, source.healing.effective), 1);

    return (
      <tbody>
        {beaconHealingBySource && Object.keys(beaconHealingBySource)
          .sort((a, b) => beaconHealingBySource[b].healing.effective - beaconHealingBySource[a].healing.effective)
          .map(spellId => {
            const { ability, healing } = beaconHealingBySource[spellId];

            return (
              <tr key={ability.guid}>
                <td style={{ width: '30%' }}>
                  <SpellLink id={ability.guid} icon={false}>
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
                    {formatNumber(healing.effective / fightDuration * 1000)} HPS
                  </dfn>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {formatPercentage(healing.overheal / healing.raw)} %
                </td>
              </tr>
            );
          })}
      </tbody>
    );
  }

  render() {
    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Name</th>
              <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Healing</th>
              <th colSpan="2">
                <div className="text-right toggle-control">
                  <Toggle
                    defaultChecked={false}
                    icons={false}
                    onChange={event => this.setState({ absolute: event.target.checked })}
                    id="absolute-toggle"
                  />
                  <label htmlFor="absolute-toggle" style={{ marginLeft: '0.5em' }}>
                    relative to total healing
                  </label>
                </div>
              </th>
              <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Overheal</th>
            </tr>
          </thead>
          {this.renderTableBody()}
        </table>
      </div>
    );
  }
}

export default BeaconHealingBreakdown;
