// Heavily inspired by resource breakdown in Feral and Retribution
import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

class ChiBreakdown extends React.Component {
  static propTypes = {
    chiGained: PropTypes.object.isRequired,
    chiSpent: PropTypes.object.isRequired,
    chiWasted: PropTypes.object.isRequired,
    chiCast: PropTypes.object.isRequired,
  };
  prepareGenerated(chiGen, chiWasted) {
    return Object.keys(chiGen)
      .map(abilityId => ({
        abilityId: Number(abilityId),
        generated: chiGen[abilityId].chi,
        wasted: chiWasted[abilityId].chi,
      }))
      .sort((a, b) => b.generated - a.generated);
  }
  prepareSpent(chipent, chiCast) {
    return Object.keys(chipent)
      .map(abilityId => ({
        abilityId: Number(abilityId),
        spent: chipent[abilityId].chi,
        maxCP: chiCast[abilityId].maxCP,
        total: chiCast[abilityId].total,
      }))
      .sort((a, b) => b.spent - a.spent);
  }
  render() {
    const { chiGained, chiSpent, chiWasted, chiCast } = this.props;
    const generated = this.prepareGenerated(chiGained, chiWasted);
    const spent = this.prepareSpent(chiSpent, chiCast);

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
              <th>Ability</th>
              <th colSpan="2">Chi generated</th>
              <th colSpan="2"><dfn data-tip="This is the amount of chi that were generated while you were already at cap.">Chi wasted</dfn></th>
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
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
                    <dfn data-tip={`${formatPercentage(ability.generated / totalGenerated)} %`}>{ability.generated}</dfn>
                  </td>
                  <td style={{ width: '40%' }}>
                    <div
                      className={'performance-bar'}
                      style={{ width: `${(ability.generated / totalGenerated) * 100}%` }}
                    />
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
                    <dfn data-tip={`${formatPercentage(ability.wasted / totalWasted)} %`}>{ability.wasted}</dfn>
                  </td>
                  <td style={{ width: '30%' }}>
                    <div
                      className={'performance-bar '}
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
              <th>Ability</th>
              <th colSpan='2'>Chi spent</th>
              <th colSpan='2'>Casts</th>
            </tr>
          </thead>
          <tbody>
            {spent && spent
              .map(ability => (
                <tr>
                  <td style={{ width: '30%' }}>
                    <SpellIcon id={ability.abilityId} />{' '}
                    <SpellLink id={ability.abilityId} />
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
                    <dfn data-tip={`${formatPercentage(ability.spent / totalGenerated)} %`}>{ability.spent}</dfn>
                  </td>
                  <td style={{ width: '40%' }}>
                    <div
                      className={'performance-bar'}
                      style={{ width: `${(ability.spent / totalSpent) * 100}%` }}
                    />
                  </td>
                  <td style={{ width: 150, textAlign: 'center' }}>{ability.total}</td>
                  <td style={{ width: '30%' }} />
                </tr>
              ))}
          </tbody>
        </table>
      </div>

    );
  }
}

export default ChiBreakdown;
