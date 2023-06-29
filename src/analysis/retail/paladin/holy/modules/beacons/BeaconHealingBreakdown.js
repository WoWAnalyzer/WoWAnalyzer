import { formatNumber, formatPercentage } from 'common/format';
import { Icon } from 'interface';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import HealingValue from 'parser/shared/modules/HealingValue';
import PropTypes from 'prop-types';
import { Component } from 'react';
import Toggle from 'react-toggle';

class BeaconHealingBreakdown extends Component {
  static propTypes = {
    totalHealingDone: PropTypes.instanceOf(HealingValue).isRequired,
    totalBeaconHealing: PropTypes.instanceOf(HealingValue).isRequired,
    beaconHealingBySource: PropTypes.object.isRequired,
    fightDuration: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.state = {
      absolute: false,
    };
  }

  renderTableBody() {
    const { totalHealingDone, totalBeaconHealing, beaconHealingBySource, fightDuration } =
      this.props;

    const currentTotal = this.state.absolute
      ? totalHealingDone.effective
      : totalBeaconHealing.effective;
    const highestHealing = Object.keys(beaconHealingBySource)
      .map((key) => beaconHealingBySource[key])
      .reduce((highest, source) => Math.max(highest, source.healing.effective), 1);

    return (
      <tbody>
        {beaconHealingBySource &&
          Object.keys(beaconHealingBySource)
            .sort(
              (a, b) =>
                beaconHealingBySource[b].healing.effective -
                beaconHealingBySource[a].healing.effective,
            )
            .map((spellId) => {
              const { ability, healing } = beaconHealingBySource[spellId];

              return (
                <tr key={ability.guid}>
                  <td style={{ width: '30%' }}>
                    <SpellLink id={ability.guid} icon={false}>
                      <Icon icon={ability.abilityIcon} /> {ability.name}
                    </SpellLink>
                  </td>
                  <td
                    style={{
                      paddingRight: 5,
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatPercentage(healing.effective / currentTotal)} %
                  </td>
                  <td style={{ width: '70%' }}>
                    {/* TODO: Color the bar based on the damage type, physical = yellow, chaos = gradient, etc. idk */}
                    <div
                      className="performance-bar"
                      style={{
                        width: `${(healing.effective / highestHealing) * 100}%`,
                      }}
                    />
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <TooltipElement content={<>Total: {formatNumber(healing.effective)}</>}>
                      <>{formatNumber((healing.effective / fightDuration) * 1000)} HPS</>
                    </TooltipElement>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {formatPercentage(healing.overheal / healing.raw)} %
                  </td>
                </tr>
              );
            })}
      </tbody>
    );
  }

  render() {
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>
              <>Name</>
            </th>
            <th colSpan="3">
              <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                <>Beacon healing caused</>
              </span>
              <div className="pull-right toggle-control">
                <Toggle
                  defaultChecked={false}
                  icons={false}
                  onChange={(event) => this.setState({ absolute: event.target.checked })}
                  id="absolute-toggle"
                />
                <label htmlFor="absolute-toggle" style={{ marginLeft: '0.5em' }}>
                  <>relative to total healing</>
                </label>
              </div>
            </th>
            <th style={{ fontWeight: 700, textTransform: 'uppercase' }}>
              <>Overheal</>
            </th>
          </tr>
        </thead>
        {this.renderTableBody()}
      </table>
    );
  }
}

export default BeaconHealingBreakdown;
