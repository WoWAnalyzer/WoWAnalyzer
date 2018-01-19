import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatNumber } from 'common/format';

export const MITIGATED_NONE = 0;
export const MITIGATED_MAGICAL = 1;
export const MITIGATED_PHYSICAL = 2;

class DamageTakenTable extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
  };

  mitigationNames = {
    [MITIGATED_NONE]: "None",
    [MITIGATED_MAGICAL]: "Magical",
    [MITIGATED_PHYSICAL]: "Physical",
  };


  render() {
    const row = (abilityData)  => {
      const { ability, mitigatedAs, totalDmg, largestSpike } = abilityData;
      return (
        <tr key={ability.guid}>
          <td></td>
          <td>
            <SpellLink id={ability.guid}>
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
              <th><b>Physical</b></th>
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
              <th><b>Magical</b></th>
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
