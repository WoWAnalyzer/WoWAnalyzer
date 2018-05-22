import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatNumber } from 'common/format';

export const MITIGATED_NONE = 0;
export const MITIGATED_MAGICAL = 1;
export const MITIGATED_PHYSICAL = 2;
export const MITIGATED_UNKNOWN = 99;

class DamageTakenTable extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    spec: PropTypes.object.isRequired,
    total: PropTypes.number.isRequired,
  };

  mitigationNames = {
    [MITIGATED_NONE]: "None",
    [MITIGATED_MAGICAL]: "Magical",
    [MITIGATED_PHYSICAL]: "Physical",
    [MITIGATED_UNKNOWN]: "Unknown",
  };


  render() {
    const specClassName = this.props.spec.className.replace(' ', '');
    const row = (abilityData) => {
      const { ability, totalDmg, largestSpike } = abilityData;
      return (
        <tr key={ability.guid}>
          <td>
            <div className="flex performance-bar-container"
                 data-tip={`Total Damage Taken: ${formatNumber(totalDmg)} of ${formatNumber(this.props.total)}.`} >
              <div
                className={`flex-sub performance-bar ${specClassName}-bg`}
                style={{ width: `${(totalDmg - largestSpike) / this.props.total * 100}%` }}
              />
              <div
                className="flex-sub performance-bar Hunter-bg"
                style={{ width: `${(largestSpike / this.props.total * 100)}%`, opacity: 0.4 }}
              />
            </div>
          </td>
          <td>
            <SpellLink id={ability.guid} icon={false}>
              <Icon icon={ability.abilityIcon} alt={ability.name} /> {ability.name}
            </SpellLink>
          </td>
          <td>
            {formatNumber(totalDmg)}
          </td>
          <td>
            {formatNumber(largestSpike)}
          </td>
        </tr>
      );
    };

    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th><dfn data-tip="Damage mitigated by stats &amp; abilities that reduce or absorb Physical damage, such as armor, Death Knights' Blood Shield, and Demon Hunters' Demon Spikes."><b>Physical</b></dfn></th>
              <th>Ability</th>
              <th>Total Damage Taken</th>
              <th>Largest Spike</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.data
                .filter(abilityData => abilityData.mitigatedAs === MITIGATED_PHYSICAL)
                .map(row)
            }
          </tbody>
          <thead>
            <tr>
              <th><dfn data-tip="Damage mitigated by stats &amp; abilities that reduce or absorb Magical damage, such as Paladins' Blessing of Spellwarding, Brewmasters' Stagger (especially with Mystic Vitality), and Demon Hunters' Empower Wards."><b>Magical</b></dfn></th>
              <th>Ability</th>
              <th>Total Damage Taken</th>
              <th>Largest Spike</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.data
                .filter(abilityData => abilityData.mitigatedAs === MITIGATED_MAGICAL)
                .map(row)
            }
          </tbody>
        </table>
      </div>
    );
  }
}

export default DamageTakenTable;
