import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

class SoulShardBreakdown extends React.Component {
  static propTypes = {
    fragmentsGeneratedAndWasted: PropTypes.object.isRequired,
    fragmentsSpent: PropTypes.object.isRequired,
  };
  prepareGenerated(fragmentsGeneratedAndWasted) {
    return Object.keys(fragmentsGeneratedAndWasted)
      .map(abilityName => ({
        abilityId: fragmentsGeneratedAndWasted[abilityName].id,
        name: abilityName,
        generated: fragmentsGeneratedAndWasted[abilityName].generated,
        wasted: fragmentsGeneratedAndWasted[abilityName].wasted,
      }))
      .sort((a, b) => b.generated - a.generated)
      .filter(ability => ability.generated > 0);
  }
  prepareSpent(fragmentsSpent) {
    return Object.keys(fragmentsSpent)
      .map(abilityId => ({
        abilityId: Number(abilityId),
        spent: fragmentsSpent[abilityId] / 10, // abilities spend always whole Soul Shards and those are made of 10 Fragments
      }))
      .sort((a, b) => b.spent - a.spent)
      .filter(ability => ability.spent > 0);
  }
  render() {
    const { fragmentsGeneratedAndWasted, fragmentsSpent } = this.props;
    const generated = this.prepareGenerated(fragmentsGeneratedAndWasted);
    const spent = this.prepareSpent(fragmentsSpent);

    let totalGenerated = 0;
    let totalWasted = 0;
    let totalSpent = 0;
    generated.forEach((ability) => {
      totalGenerated += ability.generated;
      totalWasted += ability.wasted;
    });
    spent.forEach(ability => totalSpent += ability.spent);
    // looks wrong but totals are only for the purpose of percentage, and if nothing was wasted, then 0/1 gives correct result 0% wasted, if it's not 0 it retains its original value
    totalGenerated = (totalGenerated === 0) ? 1 : totalGenerated;
    totalWasted = (totalWasted === 0) ? 1 : totalWasted;
    totalSpent = (totalSpent === 0) ? 1 : totalSpent;

    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th><dfn data-tip="Abilities/effects that didn't generate any fragments were hidden">Ability</dfn></th>
              <th colSpan="2"><dfn data-tip={`You generated ${totalGenerated} fragments in total`}>Fragments generated</dfn></th>
              <th colSpan="2"><dfn data-tip="This is the amount of fragments that were generated while you were having full shards.">Fragments wasted</dfn></th>
            </tr>
          </thead>
          <tbody>
            {generated && generated
              .map(ability => (
                <tr>
                  <td style={{ width: '30%' }}>
                    <SpellLink id={ability.abilityId}>{ability.name}</SpellLink>
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
        <table className="data-table">
          <thead>
            <tr>
              <th><dfn data-tip="Unused abilities were hidden">Ability</dfn></th>
              <th colSpan="2">Shards spent</th>
              {/* I know it shouldn't be done like this but I'm not proficient with CSS and this is the only way I could think of to align the columns with table above */}
              <th colSpan="2" />
            </tr>
          </thead>
          <tbody>
            {spent && spent
            .map(ability => (
              <tr>
                <td style={{ width: '30%' }}>
                  <SpellLink id={ability.abilityId} />
                </td>
                <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
                  <dfn data-tip={`${formatPercentage(ability.spent / totalSpent)} %`}>{ability.spent}</dfn>
                </td>
                <td style={{ width: '40%' }}>
                  <div
                    className="performance-bar"
                    style={{ width: `${(ability.spent / totalSpent) * 100}%` }}
                  />
                </td>
                <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }} />
                <td style={{ width: '30%' }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    );
  }
}

export default SoulShardBreakdown;
