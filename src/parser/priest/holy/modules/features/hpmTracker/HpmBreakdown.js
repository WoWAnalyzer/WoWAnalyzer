import React from 'react';
import PropTypes from 'prop-types';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import Toggle from 'react-toggle';
import ReactTooltip from 'react-tooltip';

class HpmBreakdown extends React.Component {
  static propTypes = {
    tracker: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      showHealing: true,
      showDamage: false,
      showPercentages: true,
    };
  }

  Table = (props) => {
    const { tracker } = props;
    const spellDetails = tracker.spellDetails;

    const detailsArray = Object.keys(spellDetails).map(function (key) {
      return spellDetails[key];
    });
    detailsArray.sort((a, b) => {
      if (a.healingDone < b.healingDone) {
        return 1;
      }
      else if (a.healingDone > b.healingDone) {
        return -1;
      }
      else {
        return 0;
      }
    });

    const spellRows = detailsArray.map((value => {
      if (value.casts > 0) {
        return this.SpellRow(value);
      }
      return null;
    }));

    return spellRows;
  };

  SpellRow = (spellDetail) => {
    return (
      <tr key={spellDetail.spell.id}>
        <td>
          <SpellIcon id={spellDetail.spell.id} /> {spellDetail.spell.name}
        </td>
        <td>{spellDetail.casts} ({spellDetail.healingHits + spellDetail.damageHits})</td>
        <td>
          {formatNumber(spellDetail.manaSpent)}
          {this.state.showPercentages ? ' (' + formatPercentage(spellDetail.manaPercentSpent) + '%)' : ''}
        </td>
        {this.state.showHealing &&
        <>
          <td>
            {formatNumber(spellDetail.healingDone)}
            {this.state.showPercentages ? ' (' + formatPercentage(spellDetail.percentHealingDone) + '%)' : ''}
          </td>
          <td>
            {formatNumber(spellDetail.overhealingDone)}
            {this.state.showPercentages ? ' (' + formatPercentage(spellDetail.percentOverhealingDone) + '%)' : ''}
          </td>
          <td>
            {formatNumber(spellDetail.hpm)}
          </td>
          <td>{formatNumber(spellDetail.healingPerTimeSpentCasting * 1000)}</td>
        </>
        }
        {this.state.showDamage &&
        <>
          <td>
            {formatNumber(spellDetail.damageDone)}
            {this.state.showPercentages ? ' (' + formatPercentage(spellDetail.percentDamageDone) + '%)' : ''}
          </td>
          <td>
            {formatNumber(spellDetail.dpm)}
          </td>
          <td>{formatNumber(spellDetail.damagePerTimeSpentCasting * 1000)}</td>
        </>
        }
      </tr>
    );
  };

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  render() {
    const { tracker } = this.props;

    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            <div className="toggle-control pull-right" style={{ 'marginLeft': '.5em', 'marginRight': '.5em' }}>
              <Toggle
                defaultChecked={false}
                icons={false}
                onChange={event => this.setState({ showDamage: event.target.checked })}
                id="damage-toggle"
              />
              <label htmlFor="damage-toggle" style={{ marginLeft: '0.5em' }}>
                Show Damage
              </label>
            </div>
            <div className="toggle-control pull-right" style={{ 'marginLeft': '.5em', 'marginRight': '.5em' }}>
              <Toggle
                defaultChecked
                icons={false}
                onChange={event => this.setState({ showHealing: event.target.checked })}
                id="healing-toggle"
              />
              <label htmlFor="healing-toggle" style={{ marginLeft: '0.5em' }}>
                Show Healing
              </label>
            </div>
            <div className="toggle-control pull-right" style={{ 'marginLeft': '.5em', 'marginRight': '.5em' }}>
              <Toggle
                defaultChecked
                icons={false}
                onChange={event => this.setState({ showPercentages: event.target.checked })}
                id="percent-toggle"
              />
              <label htmlFor="percent-toggle" style={{ marginLeft: '0.5em' }}>
                Show Percentages
              </label>
            </div>
          </div>
          <div className="col-md-12">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Casts</th>
                  <th>Mana Spent</th>
                  {this.state.showHealing &&
                  <>
                    <th>Healing Done</th>
                    <th>Overhealing</th>
                    <th>
                      <dfn data-tip={`Healing per mana spent casting the spell`}>HPM</dfn>
                    </th>
                    <th>
                      <dfn data-tip={`Healing per second spent casting the spell`}>HPET</dfn>
                    </th>
                  </>
                  }
                  {this.state.showDamage &&
                  <>
                    <th>Damage Done</th>
                    <th>
                      <dfn data-tip={`Damage per mana spent casting the spell`}>DPM</dfn>
                    </th>
                    <th>
                      <dfn data-tip={`Damage per second spent casting the spell`}>DPET</dfn>
                    </th>
                  </>
                  }
                </tr>
              </thead>
              <tbody>
                <this.Table tracker={tracker} showHealing={this.state.showHealing} showDamage={this.state.showDamage} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default HpmBreakdown;
