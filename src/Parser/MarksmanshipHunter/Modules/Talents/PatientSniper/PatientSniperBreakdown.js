import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import PatientSniperTracker from './PatientSniperTracker';


class PatientSniperBreakdown extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
  };

  render() {
    const { parser } = this.props;

    const abilityTracker = parser.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const styles = {
      cellBorder: { borderTop: '.5px solid #dddddd' },
      table: { borderBottom: '1px solid #dddddd', borderTop: '1px solid #dddddd', align: 'left', padding: '8px', float: 'left', margin: '2px' },
    };
    return (
      <div>
        <table className="data-table" style={styles.cellBorder}>
          <thead>
            <tr>
              <th>Time into Vulnerable:</th>
              <th>Amount</th>
              <th>% of total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                <SpellLink id={SPELLS.AIMED_SHOT.id} />s outside of <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td>{parser.modules.patientSniperTracker.oneSecondIntoVulnerableAimed}</td>
              <td>{formatPercentage(parser.modules.patientSniperTracker.nonVulnerableAimedShots / parser.modules.patientSniperTracker.totalAimed)}</td>


            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default PatientSniperBreakdown;
