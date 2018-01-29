import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

class RunicPowerBreakdown extends React.Component {
  static propTypes = {
    rpGeneratedAndWasted: PropTypes.object.isRequired,
  };
  prepareGenerated(rpGeneratedAndWasted) {
    return Object.keys(rpGeneratedAndWasted)
      .map(abilityId => ({
        abilityId: (rpGeneratedAndWasted[abilityId].alternateId) ? rpGeneratedAndWasted[abilityId].alternateId : Number(abilityId),
        generated: rpGeneratedAndWasted[abilityId].generated,
        wasted: rpGeneratedAndWasted[abilityId].wasted,
      }))
      .sort((a, b) => b.generated - a.generated)
      .filter(ability => ability.generated > 0);
  }

  render() {
    const { rpGeneratedAndWasted } = this.props;
    const generated = this.prepareGenerated(rpGeneratedAndWasted);

    let totalGenerated = 0;
    let totalWasted = 0;
    generated.forEach((ability) => {
      totalGenerated += ability.generated;
      totalWasted += ability.wasted;
    });

    totalGenerated = (totalGenerated === 0) ? 1 : totalGenerated;
    totalWasted = (totalWasted === 0) ? 1 : totalWasted;

    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th><dfn data-tip="Abilities/effects that didn't generate any Runic Power were hidden">Ability</dfn></th>
              <th colSpan="2">Runic Power Generated</th>
              <th colSpan="2"><dfn data-tip="This is the amount of Runic Power that was generated while you were having full Runic Power.">Runic Power Wasted</dfn></th>
            </tr>
          </thead>
          <tbody>
            {generated && generated
              .map(ability => (
                <tr>
                  <td style={{ width: '30%' }}>
                    <SpellIcon id={ability.abilityId} />{' '}
                    <SpellLink id={ability.abilityId} />
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
                    <dfn data-tip={`${formatPercentage(ability.generated / totalGenerated)} %`}>{ability.generated}</dfn>
                  </td>
                  <td style={{ width: '40%' }}>
                    <div
                      className="performance-bar"
                      style={{ width: `${(ability.generated / totalGenerated) * 100}%` }}
                    />
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
                    <dfn data-tip={`${formatPercentage(ability.wasted / totalWasted)} %`}>{ability.wasted}</dfn>
                  </td>
                  <td style={{ width: '30%' }}>
                    <div
                      className="performance-bar"
                      style={{ width: `${(ability.wasted / totalWasted) * 100}%` }}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {/* Add Spent here if i ever need to. */}
      </div>

    );
  }
}

export default RunicPowerBreakdown;
