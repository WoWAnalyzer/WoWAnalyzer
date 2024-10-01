import { t, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import { Component } from 'react';

import ResourceTracker from './ResourceTracker';

interface Props {
  /** Associated tracker module that holds the resource data */
  tracker: ResourceTracker;
  /** If true, there will be a separate section showing resources spent */
  showSpenders: boolean;
  /** If true, the spenders section will show the number of casts that consumed
   *  the maxResources. (This is primarily for something like Combo Points) */
  showMaxSpenders?: boolean;
  /** If true the section showing generated and wasted resources from builders will be hidden - for classes like evokers that only have passive generation for their secondary resource */
  hideGenerated?: boolean;
  /** Some are scaled differently in events vs the user facing value. Implementer may override
   *  this to apply a scale factor so the graph shows with the user facing value.} */
  scaleFactor?: number;
}

interface ResourceUsageRow {
  /** Builder or spender spell id for {@link SpellLink} */
  abilityId: number;
  /** If supplied, will be appended to the end of the {@link SpellLink} as plain text */
  extraDetail?: string;
}

interface GeneratedResourceRow extends ResourceUsageRow {
  /** Total resource generated, minus any waste */
  generated: number;
  /** Amount of resource wasted */
  wasted: number;
}

interface SpentResourceRow extends ResourceUsageRow {
  /** Total resource spent */
  spent: number;
  /** No. of times ability was cast */
  casts: number;
  /** No. of casts while at resource cap */
  maxSpendCasts: number;
}

class ResourceBreakdown extends Component<Props> {
  prepareGenerated(tracker: ResourceTracker, scaleFactor = 1): GeneratedResourceRow[] {
    return Object.keys(tracker.buildersObj)
      .map((abilityId) => ({
        abilityId: Number(abilityId),
        generated: tracker.buildersObj[Number(abilityId)].generated * scaleFactor,
        wasted: tracker.buildersObj[Number(abilityId)].wasted * scaleFactor,
        extraDetail: undefined as string | undefined,
      }))
      .sort((a, b) => b.generated - a.generated)
      .filter((ability) => ability.generated > 0 || ability.wasted);
  }

  prepareSpent(tracker: ResourceTracker, scaleFactor = 1): SpentResourceRow[] {
    return Object.keys(tracker.spendersObj)
      .map((abilityId) => ({
        abilityId: Number(abilityId),
        spent: tracker.spendersObj[Number(abilityId)].spent * scaleFactor,
        casts: tracker.spendersObj[Number(abilityId)].casts,
        maxSpendCasts: tracker.spendersObj[Number(abilityId)].spentByCast.filter(
          (spent) => spent === tracker.maxResource,
        ).length,
      }))
      .sort((a, b) => b.spent - a.spent)
      .filter((ability) => ability.spent > 0);
  }

  render() {
    const { tracker, showSpenders, showMaxSpenders, hideGenerated, scaleFactor = 1 } = this.props;
    const resourceName = tracker.resource.name;

    const generated = this.prepareGenerated(tracker, scaleFactor);
    const spent = this.prepareSpent(tracker, scaleFactor);

    let totalGenerated = tracker.generated * scaleFactor;
    let totalWasted = tracker.gainWaste * scaleFactor; // ignoring natural regen waste in this tab

    let totalSpent = tracker.spent * scaleFactor;
    let totalCasts = tracker.spendersCasts;

    // looks wrong but totals are only for the purpose of percentage, and if nothing was wasted, then 0/1 gives correct result 0% wasted, if it's not 0 it retains its original value
    totalGenerated = totalGenerated === 0 ? 1 : totalGenerated;
    totalWasted = totalWasted === 0 ? 1 : totalWasted;

    totalSpent = totalSpent === 0 ? 1 : totalSpent;
    totalCasts = totalCasts === 0 ? 1 : totalCasts;

    const numberColumnStyle = { width: 50, paddingRight: 5, textAlign: 'center' } as const;

    return (
      <>
        <table className="data-table">
          {!hideGenerated && (
            <thead>
              <tr>
                <th>
                  <Trans id="shared.resourceBreakdown.ability">Ability</Trans>
                </th>
                <th colSpan={2}>
                  <Trans id="shared.resourceBreakdown.generatedHeader">
                    {resourceName} generated
                  </Trans>
                </th>
                <th colSpan={2}>
                  <TooltipElement
                    content={t({
                      id: 'shared.resourceBreakdown.wastedHeader.tooltip',
                      message:
                        'This is the amount of resources that were generated while you were already at cap.',
                    })}
                  >
                    <Trans id="shared.resourceBreakdown.wastedHeader">{resourceName} wasted</Trans>
                  </TooltipElement>
                </th>
              </tr>
            </thead>
          )}
          <tbody>
            {!hideGenerated && (
              <tr className="poor">
                <td>
                  <Trans id="shared.resourceBreakdown.total">Total</Trans>
                </td>
                <td style={numberColumnStyle}>{totalGenerated.toFixed(0)}</td>
                <td></td>
                <td style={numberColumnStyle}>{totalWasted.toFixed(0)}</td>
                <td></td>
              </tr>
            )}
            {generated &&
              generated.map((ability, index) => (
                <tr key={`${ability.abilityId}-${index}`}>
                  <td style={{ width: '30%' }}>
                    <SpellLink spell={ability.abilityId} /> {ability.extraDetail}
                  </td>
                  <td style={numberColumnStyle}>
                    <TooltipElement
                      content={`${formatPercentage(ability.generated / totalGenerated)} %`}
                    >
                      {ability.generated.toFixed(0)}
                    </TooltipElement>
                  </td>
                  <td style={{ width: '40%' }}>
                    <div
                      className="performance-bar"
                      style={{ width: `${(ability.generated / totalGenerated) * 100}%` }}
                    />
                  </td>
                  <td style={numberColumnStyle}>
                    <TooltipElement content={`${formatPercentage(ability.wasted / totalWasted)} %`}>
                      {ability.wasted.toFixed(0)}
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
                <th>
                  <Trans id="shared.resourceBreakdown.ability">Ability</Trans>
                </th>
                <th colSpan={2}>
                  <Trans id="shared.resourceBreakdown.spentHeader">{resourceName} spent</Trans>
                </th>
                <th colSpan={2}>
                  {showMaxSpenders ? (
                    <>Max {resourceName} Casts / Total</>
                  ) : (
                    <Trans id="shared.resourceBreakdown.castsHeader">Casts</Trans>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="poor">
                <td>
                  <Trans id="shared.resourceBreakdown.total">Total</Trans>
                </td>
                <td style={numberColumnStyle}>{totalSpent.toFixed(0)}</td>
                <td></td>
                <td style={numberColumnStyle}>{tracker.spendersCasts}</td>
                <td></td>
              </tr>
              {spent &&
                spent.map((ability) => (
                  <tr key={ability.abilityId}>
                    <td style={{ width: '30%' }}>
                      <SpellLink spell={ability.abilityId} /> {ability.extraDetail}
                    </td>
                    <td style={numberColumnStyle}>
                      <TooltipElement content={`${formatPercentage(ability.spent / totalSpent)} %`}>
                        {ability.spent.toFixed(0)}
                      </TooltipElement>
                    </td>
                    <td style={{ width: '40%' }}>
                      <div
                        className="performance-bar"
                        style={{ width: `${(ability.spent / totalSpent) * 100}%` }}
                      />
                    </td>
                    {showMaxSpenders ? (
                      <td style={numberColumnStyle}>
                        {ability.maxSpendCasts} / {ability.casts}
                      </td>
                    ) : (
                      <td style={numberColumnStyle}>
                        <TooltipElement
                          content={`${formatPercentage(ability.casts / totalCasts)} %`}
                        >
                          {ability.casts}
                        </TooltipElement>
                      </td>
                    )}
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
      </>
    );
  }
}

export default ResourceBreakdown;
