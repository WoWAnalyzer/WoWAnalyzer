import React from 'react';
import Toggle from 'react-toggle';

import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import { TooltipElement } from 'common/Tooltip';
import AtonementHealingDone from 'parser/priest/discipline/modules/features/AtonementHealingDone';
import CombatLogParser from 'parser/core/CombatLogParser';

interface Props {
  analyzer: AtonementHealingDone,
  owner: CombatLogParser,
}

interface State {
  absolute: boolean
}

class AtonementHealingBreakdown extends React.Component<Props, State> {
  constructor(options: Props) {
    super(options);
    this.state = {
      absolute: false,
    };
  }

  reason(spellId: string) {
    switch (Number(spellId)) {
      case -2: // Melee
        return <SpellLink id={SPELLS.LIGHTSPAWN.id} />;
      default:
        return null;
    }
  }

  renderTableBody() {
    const { analyzer, owner } = this.props;
    const { totalAtonement, bySource, total } = analyzer;

    const highestHealing = Object.keys(bySource)
      .map(key => bySource[key])
      .reduce((highest, source) => Math.max(highest, source.healing.effective), 1);

    return (
      <tbody>
        {bySource && Object.keys(bySource)
          .sort((a, b) => bySource[b].healing.effective - bySource[a].healing.effective)
          .map(spellId => {
            const { ability, healing, bolts } = bySource[spellId];

            const currentTotal = this.state.absolute ? total : totalAtonement.effective;
            const reason = this.reason(spellId);

            return (
              <>
                <tr key={ability.guid}>
                  <td style={{ width: '30%' }}>
                    <SpellLink id={ability.guid} icon={false}>
                      <Icon icon={ability.abilityIcon} />{' '}
                      {ability.name}
                    </SpellLink>
                    {reason && (
                      <>
                        {' '}({reason})
                      </>
                    )}
                  </td>
                  <td style={{ paddingRight: 5, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {formatPercentage(healing.effective / currentTotal)} %
                  </td>
                  <td style={{ width: '70%' }}>
                    {/* TODO: Color the bar based on the damage type, physical = yellow, chaos = gradient, etc. idk */}
                    <div
                      className="performance-bar"
                      style={{ width: `${healing.effective / highestHealing * 100}%` }}
                    />
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <TooltipElement content={`Total: ${formatNumber(healing.effective)}`}>
                      {formatNumber(healing.effective / owner.fightDuration * 1000)} HPS
                    </TooltipElement>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {formatPercentage(healing.overheal / healing.raw)} %
                  </td>
                </tr>

                {bolts && bolts.map((value: any, index: number) => {
                  if (!value) {
                    return null;
                  }

                  return (
                    <tr key={index}>
                      <td style={{ width: '30%', paddingLeft: 50 }}>
                        <SpellLink id={ability.guid} icon={false}>
                          <Icon icon={ability.abilityIcon} />{' '}
                          {ability.name} bolt {index + 1}
                        </SpellLink>
                      </td>
                      <td style={{ paddingRight: 5, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {formatPercentage(value.effective / currentTotal)} %
                      </td>
                      <td style={{ width: '70%', paddingLeft: 50 }}>
                        <div
                          className="performance-bar"
                          style={{ width: `${value.effective / healing.effective * 100}%` }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <TooltipElement content={`Total: ${formatNumber(value.effective)}`}>
                          {formatNumber(value.effective / owner.fightDuration * 1000)} HPS
                        </TooltipElement>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {formatPercentage(value.overheal / healing.raw)} %
                      </td>
                    </tr>
                  );
                })}
              </>
            );
          })}

      </tbody>
    );
  }

  render() {
    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Name</th>
              <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Healing</th>
              <th colSpan={2}>
                <div className="text-right toggle-control">
                  <Toggle
                    defaultChecked={false}
                    icons={false}
                    onChange={event => this.setState({ absolute: event.target.checked })}
                    id="absolute-toggle"
                  />
                  <label htmlFor="absolute-toggle" style={{ marginLeft: '0.5em' }}>
                    relative to total healing
                  </label>
                </div>
              </th>
              <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>Overheal</th>
            </tr>
          </thead>
          {this.renderTableBody()}
        </table>
      </div>
    );
  }
}

export default AtonementHealingBreakdown;
