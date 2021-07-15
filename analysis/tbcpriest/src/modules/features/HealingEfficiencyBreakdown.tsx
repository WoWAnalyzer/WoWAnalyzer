import BaseHealingEfficiencyBreakdown from 'parser/core/healingEfficiency/HealingEfficiencyBreakdown';
import React from 'react';
import Toggle from 'react-toggle';

class HealingEfficiencyBreakdown extends BaseHealingEfficiencyBreakdown {
  render() {
    const { tracker } = this.props;

    return (
      <div>
        <div className="row">
          <div className="col-md-12" style={{ marginTop: 10, marginBottom: 10 }}>
            <div className="pull-left">
              <div
                className="toggle-control pull-right"
                style={{ marginLeft: '.5em', marginRight: '.5em' }}
              >
                <Toggle
                  defaultChecked={false}
                  icons={false}
                  onChange={(event: any) => this.setState({ detailedView: event.target.checked })}
                  id="detailed-toggle"
                />
                <label htmlFor="detailed-toggle" style={{ marginLeft: '0.5em' }}>
                  Detailed View
                </label>
              </div>
            </div>
            <div className="pull-right">
              <div
                className="toggle-control pull-left"
                style={{ marginLeft: '.5em', marginRight: '.5em' }}
              >
                <Toggle
                  defaultChecked={false}
                  icons={false}
                  onChange={(event: any) => this.setState({ showCooldowns: event.target.checked })}
                  id="cooldown-toggle"
                />
                <label htmlFor="cooldown-toggle" style={{ marginLeft: '0.5em' }}>
                  Show Cooldowns
                </label>
              </div>
              <div
                className="toggle-control pull-left"
                style={{ marginLeft: '.5em', marginRight: '.5em' }}
              >
                <label htmlFor="healing-toggle" style={{ marginLeft: '0.5em', marginRight: '1em' }}>
                  Show Damage
                </label>
                <Toggle
                  defaultChecked
                  icons={false}
                  onChange={(event: any) => this.setState({ showHealing: event.target.checked })}
                  id="healing-toggle"
                />
                <label htmlFor="healing-toggle" style={{ marginLeft: '0.5em' }}>
                  Show Healing
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-12">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ability</th>
                  {this.state.detailedView ? <this.DetailHeader /> : <this.BarHeader />}
                </tr>
              </thead>
              <tbody>{this.HealingEfficiencyTable({ tracker })}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default HealingEfficiencyBreakdown;
