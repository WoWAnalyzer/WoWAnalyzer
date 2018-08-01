import React from 'react';
import PropTypes from 'prop-types';

import Danger from 'common/Alert/Danger';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

const THRESHOLD = 100;

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
            There is a large amount of damage mitigation which's source is unknown. Since this tab is still in early development, it is likely due to fully absorbed hits missing block amounts, Aura of Sacrifice and Devotion Aura not being implemented yet, or the stat tracker missing armor or versatility buffs.
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
      </div>
    );
  }
}

export default DamageMitigationBreakdown;
