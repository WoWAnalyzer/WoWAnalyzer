import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';


import PatientSniperTracker from './PatientSniperTracker';

import SPELLS from 'common/SPELLS';

class PatientSniperBreakdown extends React.Component {
  static dependencies = {
    patientSniperTracker: PatientSniperTracker,
  }

  render() {
    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Time into Vulnerable:</th>
              <th colSpan="2">Amount</th>
              <th colSpan="2">% of total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ width: '30%' }}>
                <SpellIcon id={SPELLS.AIMED_SHOT.id} />{'  '}
                <SpellLink id={SPELLS.AIMED_SHOT.id} />s outside of <SpellLink id={SPELLS.VULNERABLE.id} />
              </td>
              <td style={{ width: '30%' }}>
                <dfn>
                  HEJ
                </dfn>
              </td>
              <td style={{ width: '30%' }}>
                <dfn>
                </dfn>
              </td>


            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default PatientSniperBreakdown;
