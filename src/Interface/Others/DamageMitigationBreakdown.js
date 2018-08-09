import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import Danger from 'common/Alert/Danger';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

const THRESHOLD = 100;
const EXCEPTIONS = [
  SPELLS.MASTERY_CHAOTIC_ENERGIES.id,
  SPELLS.AURA_OF_SACRIFICE_BUFF.id,
  SPELLS.DEVOTION_AURA_BUFF.id,
  -1000,
];

class DamageMitigationBreakdown extends React.Component {
  static propTypes = {
    tracker: PropTypes.object.isRequired,
  };

  prepareMitigated(mitigated) {
    return Object.keys(mitigated)
      .map(id => ({
        id: Number(id),
        name: mitigated[id].name,
        amount: mitigated[id].amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .filter(reduction => reduction.amount > THRESHOLD);
  }

  render() {
    const { tracker } = this.props;
    const mitigated = this.prepareMitigated(tracker.mitigated);

    let totalMitigated = tracker.totalMitigated;
    totalMitigated = (totalMitigated === 0) ? 1 : totalMitigated;

    return (
      <div>
        {!tracker.isAccurate && (
          <Danger style={{ marginTop: 10, marginBottom: 10 }}>
            There is a large amount of damage mitigation which's source is unknown. This is likely caused by our avoidance or versatility tracker being incomplete, our list of abilities affected by avoidance being incomplete or one of the following abilities being partially untrackable in the log, and we can only guess at how much it actually mitigated: Devotion Aura, Aura of Sacrifice, Destruction Warlock Mastery and Spirit Link Totem.
          </Danger>
        )}
        <table className="data-table">
          <thead>
            <tr>
              <th>Ability</th>
              <th colSpan="2">Mitigated</th>
            </tr>
          </thead>
          <tbody>
            {mitigated && mitigated
              .map(reduction => (
                <tr>
                  <td style={{ width: '20%' }}>
                    {
                      reduction.id > 0 ? (<SpellLink id={reduction.id} />) : reduction.name
                    }
                    {
                      EXCEPTIONS.includes(reduction.id) ? ' *' : ''
                    }
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
                    <dfn data-tip={`${formatPercentage(reduction.amount / totalMitigated)} %`}>{formatNumber(reduction.amount)}</dfn>
                  </td>
                  <td style={{ width: '75%' }}>
                    <div
                      className="performance-bar"
                      style={{ width: `${(reduction.amount / totalMitigated) * 100}%` }}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="text-muted" style={{ padding: '10px' }}>
        * These values might have inaccuracies due to the limitations of the logs.
        </div>
      </div>
    );
  }
}

export default DamageMitigationBreakdown;
