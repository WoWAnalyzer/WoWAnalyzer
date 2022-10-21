import { t, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';

//Need to extend this class to change how passive rune regeneration is displayed.
//The only new lines are 44, 49-54 and 78.
class RuneBreakdown extends ResourceBreakdown {
  render() {
    const { tracker, showSpenders } = this.props;
    const resourceName = tracker.resource.name;
    const generated = this.prepareGenerated(tracker);
    const spent = this.prepareSpent(tracker);

    let totalGenerated = tracker.generated;
    let totalWasted = tracker.wasted;

    let totalSpent = tracker.spent;
    let totalCasts = tracker.spendersCasts;

    // looks wrong but totals are only for the purpose of percentage, and if nothing was wasted, then 0/1 gives correct result 0% wasted, if it's not 0 it retains its original value
    totalGenerated = totalGenerated === 0 ? 1 : totalGenerated;
    totalWasted = totalWasted === 0 ? 1 : totalWasted;

    totalSpent = totalSpent === 0 ? 1 : totalSpent;
    totalCasts = totalCasts === 0 ? 1 : totalCasts;

    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <Trans id="shared.resourceBreakdown.ability">Ability</Trans>
              </th>
              <th colSpan={2}>
                <TooltipElement
                  content={t({
                    id: 'deathknight.shared.runeBreakdown.generatedHeaderTooltip',
                    message:
                      'Runes generated from passive regeneration and abilities that accelerate it are estimates.',
                  })}
                >
                  <Trans id="shared.resourceBreakdown.generatedHeader">
                    {resourceName} generated
                  </Trans>
                </TooltipElement>
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
          <tbody>
            {generated?.map((ability) => (
              <tr key={ability.abilityId}>
                <td style={{ width: '30%' }}>
                  {ability.abilityId === SPELLS.RUNE_1.id && (
                    <>
                      <SpellIcon id={ability.abilityId} noLink />{' '}
                      <Trans id="deathknight.shared.runeBreakdown.passive">
                        Passive Rune regeneration
                      </Trans>
                    </>
                  )}
                  {ability.abilityId !== SPELLS.RUNE_1.id && <SpellLink id={ability.abilityId} />}
                </td>
                <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
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
                <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
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
                <th>
                  <Trans id="shared.resourceBreakdown.ability">Ability</Trans>
                </th>
                <th colSpan={2}>
                  <Trans id="shared.resourceBreakdown.spentHeader">{resourceName} spent</Trans>
                </th>
                <th colSpan={2}>
                  <Trans id="shared.resourceBreakdown.castsHeader">Casts</Trans>
                </th>
              </tr>
            </thead>
            <tbody>
              {spent?.map((ability) => (
                <tr key={ability.abilityId}>
                  <td style={{ width: '30%' }}>
                    <SpellLink id={ability.abilityId} />
                  </td>
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
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
                  <td style={{ width: 50, paddingRight: 5, textAlign: 'center' }}>
                    <TooltipElement content={`${formatPercentage(ability.casts / totalCasts)} %`}>
                      {ability.casts}
                    </TooltipElement>
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
