import React from 'react';
import PropTypes from 'prop-types';

import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TooltipElement } from 'interface';

import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';

//Need to extend this class to change how passive rune regeneration is displayed.
//The only new lines are 44, 49-54 and 78.
class RuneBreakdown extends ResourceBreakdown {
  static propTypes = {
    tracker: PropTypes.object.isRequired,
    showSpenders: PropTypes.bool,
  };

  render() {
    const { tracker, showSpenders } = this.props;
    const resourceName = tracker.resource.name;
    const generated = this.prepareGenerated(tracker.buildersObj);
    const spent = this.prepareSpent(tracker.spendersObj);

    let totalGenerated = tracker.generated;
    let totalWasted = tracker.wasted;

    let totalSpent = tracker.spent;
    let totalCasts = tracker.spendersCasts;

    // looks wrong but totals are only for the purpose of percentage, and if nothing was wasted, then 0/1 gives correct result 0% wasted, if it's not 0 it retains its original value
    totalGenerated = (totalGenerated === 0) ? 1 : totalGenerated;
    totalWasted = (totalWasted === 0) ? 1 : totalWasted;

    totalSpent = (totalSpent === 0) ? 1 : totalSpent;
    totalCasts = (totalCasts === 0) ? 1 : totalCasts;

    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ability</th>
              <th colSpan="2"><TooltipElement content="Runes generated from passive regeneration and abilities that accelerate it are estimates.">{resourceName} generated</TooltipElement></th>
              <th colSpan="2"><TooltipElement content="This is the amount of resources that were generated while you were already at cap.">{resourceName} wasted</TooltipElement></th>
            </tr>
          </thead>
          <tbody>
            {generated && generated
              .filter(ability => ability.abilityId === SPELLS.RUNE_1.id)
              .map(ability => (
                <tr key={ability.abilityId}>
                  <td style={{ width: '30%' }}>
                    <SpellIcon id={ability.abilityId} noLink />{' '}
                    Passive Rune regeneration
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
                    <TooltipElement content={`${formatPercentage(ability.generated / totalGenerated)} %`}>{ability.generated}</TooltipElement>
                  </td>
                  <td style={{ width: '40%' }}>
                    <div
                      className="performance-bar"
                      style={{ width: `${(ability.generated / totalGenerated) * 100}%` }}
                    />
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
                    <TooltipElement content={`${formatPercentage(ability.wasted / totalWasted)} %`}>{ability.wasted}</TooltipElement>
                  </td>
                  <td style={{ width: '30%' }}>
                    <div
                      className="performance-bar"
                      style={{ width: `${(ability.wasted / totalWasted) * 100}%` }}
                    />
                  </td>
                </tr>
              ))}
            {generated && generated
              .filter(ability => ability.abilityId !== SPELLS.RUNE_1.id)
              .map(ability => (
                <tr key={ability.abilityId}>
                  <td style={{ width: '30%' }}>
                    <SpellLink id={ability.abilityId} />
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
                    <TooltipElement content={`${formatPercentage(ability.generated / totalGenerated)} %`}>{ability.generated}</TooltipElement>
                  </td>
                  <td style={{ width: '40%' }}>
                    <div
                      className="performance-bar"
                      style={{ width: `${(ability.generated / totalGenerated) * 100}%` }}
                    />
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
                    <TooltipElement content={`${formatPercentage(ability.wasted / totalWasted)} %`}>{ability.wasted}</TooltipElement>
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
        {showSpenders && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Ability</th>
                <th colSpan="2">{resourceName} spent</th>
                <th colSpan="2">Casts</th>
              </tr>
            </thead>
            <tbody>
              {spent && spent
                .map(ability => (
                  <tr key={ability.abilityId}>
                    <td style={{ width: '30%' }}>
                      <SpellLink id={ability.abilityId} />
                    </td>
                    <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
                      <TooltipElement content={`${formatPercentage(ability.spent / totalSpent)} %`}>{ability.spent}</TooltipElement>
                    </td>
                    <td style={{ width: '40%' }}>
                      <div
                        className="performance-bar"
                        style={{ width: `${(ability.spent / totalSpent) * 100}%` }}
                      />
                    </td>
                    <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
                      <TooltipElement content={`${formatPercentage(ability.casts / totalCasts)} %`}>{ability.casts}</TooltipElement>
                    </td>
                    <td style={{ width: '30%' }}>
                      <div
                        className="performance-bar"
                        style={{ width: `${(ability.casts / totalCasts) * 100}%` }}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default RuneBreakdown;
