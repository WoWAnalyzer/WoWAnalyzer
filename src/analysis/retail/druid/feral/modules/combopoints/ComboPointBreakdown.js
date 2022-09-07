import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import PropTypes from 'prop-types';
import { Component } from 'react';

// Copied from core breakdown, but with support for 'max CP casts' in spenders display
class ResourceBreakdown extends Component {
  static propTypes = {
    tracker: PropTypes.object.isRequired,
    showSpenders: PropTypes.bool,
  };

  prepareGenerated(buildersObj) {
    return Object.keys(buildersObj)
      .map((abilityId) => ({
        abilityId: Number(abilityId),
        generated: buildersObj[abilityId].generated,
        wasted: buildersObj[abilityId].wasted,
      }))
      .sort((a, b) => b.generated - a.generated)
      .filter((ability) => ability.generated > 0);
  }

  prepareSpent(spendersObj) {
    return Object.keys(spendersObj)
      .map((abilityId) => ({
        abilityId: Number(abilityId),
        spent: spendersObj[abilityId].spent,
        casts: spendersObj[abilityId].casts,
        maxCP: spendersObj[abilityId].spentByCast.filter((spent) => spent === 5).length,
      }))
      .sort((a, b) => b.spent - a.spent)
      .filter((ability) => ability.spent > 0);
  }

  render() {
    const { tracker, showSpenders } = this.props;
    const resourceName = tracker.resource.name;
    const generated = this.prepareGenerated(tracker.buildersObj);
    const spent = this.prepareSpent(tracker.spendersObj);

    let totalGenerated = tracker.generated;
    let totalWasted = tracker.wasted;

    let totalSpent = tracker.spent;

    // looks wrong but totals are only for the purpose of percentage, and if nothing was wasted, then 0/1 gives correct result 0% wasted, if it's not 0 it retains its original value
    totalGenerated = totalGenerated === 0 ? 1 : totalGenerated;
    totalWasted = totalWasted === 0 ? 1 : totalWasted;

    totalSpent = totalSpent === 0 ? 1 : totalSpent;

    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ability</th>
              <th colSpan="2">{resourceName} generated</th>
              <th colSpan="2">
                <TooltipElement content="This is the amount of resources that were generated while you were already at cap.">
                  {resourceName} wasted
                </TooltipElement>
              </th>
            </tr>
          </thead>
          <tbody>
            {generated &&
              generated.map((ability) => (
                <tr key={ability.abilityId}>
                  <td style={{ width: '30%' }}>
                    <SpellLink id={ability.abilityId} />
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
                    <TooltipElement
                      content={`${formatPercentage(ability.generated / totalGenerated)} %`}
                    >
                      {ability.generated}
                    </TooltipElement>
                  </td>
                  <td style={{ width: '40%' }}>
                    <div
                      className="performance-bar"
                      style={{ width: `${(ability.generated / totalGenerated) * 100}%` }}
                    />
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
                    <TooltipElement content={`${formatPercentage(ability.wasted / totalWasted)} %`}>
                      {ability.wasted}
                    </TooltipElement>
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
                <th colSpan="2">Max CP Casts / Total Casts</th>
              </tr>
            </thead>
            <tbody>
              {spent &&
                spent.map((ability) => (
                  <tr key={ability.abilityId}>
                    <td style={{ width: '30%' }}>
                      <SpellLink id={ability.abilityId} />
                    </td>
                    <td style={{ width: 50, paddingRight: 5, textAlign: 'right' }}>
                      <TooltipElement content={`${formatPercentage(ability.spent / totalSpent)} %`}>
                        {ability.spent}
                      </TooltipElement>
                    </td>
                    <td style={{ width: '40%' }}>
                      <div
                        className="performance-bar"
                        style={{ width: `${(ability.spent / totalSpent) * 100}%` }}
                      />
                    </td>
                    <td style={{ width: 50, paddingRight: 5 }} />
                    <td style={{ width: '30%', textAlign: 'left' }}>
                      {ability.maxCP} / {ability.casts}
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

export default ResourceBreakdown;
