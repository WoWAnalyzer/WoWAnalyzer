import React from 'react';
import PropTypes from 'prop-types';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import Toggle from 'react-toggle';
import ReactTooltip from 'react-tooltip';
import colorForPerformance from 'parser/shared/modules/features/Checklist2/helpers/colorForPerformance';

class PerformanceBar extends React.Component {
  static propTypes = {
    percent: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div className="performance-bar-container">
        <div
          className="performance-bar"
          style={{
            width: `${this.props.percent * 100}%`,
            transition: 'background-color 800ms',
            backgroundColor: colorForPerformance(this.props.percent),
          }}
        />
      </div>
    );
  }
}

class HealingEfficiencyBreakdown extends React.Component {
  static propTypes = {
    tracker: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      showHealing: true,
      showDamage: false,
      detailedView: false,
      showCooldowns: false,
    };
  }

  HealingEfficiencyTable = (props) => {
    const { tracker } = props;
    const { spells, topHpm, topDpm, topHpet, topDpet } = tracker.getAllSpellStats(this.state.showCooldowns);

    const spellArray = Object.keys(spells).map(function (key) {
      return spells[key];
    });
    spellArray.sort((a, b) => {
      if (a.hpm < b.hpm) {
        return 1;
      }
      else if (a.hpm > b.hpm) {
        return -1;
      }
      else {
        if (a.dpm < b.dpm) {
          return 1;
        }
        else if (a.dpm > b.dpm) {
          return -1;
        }
      }
      return 0;
    });

    const spellRows = spellArray.map((spellDetail => {
      if (spellDetail.casts > 0) {
        return this.HealingEfficiencySpellRow(spellDetail, topHpm, topDpm, topHpet, topDpet);
      }
      return null;
    }));

    return spellRows;
  };

  HealingEfficiencySpellRow = (spellDetail, topHpm, topDpm, topHpet, topDpet) => {
    return (
      <tr key={spellDetail.spell.id}>
        <td>
          <SpellIcon id={spellDetail.spell.id} /> {spellDetail.spell.name}
        </td>
        {this.state.detailedView ? <this.DetailView spellDetail={spellDetail} /> : <this.BarView spellDetail={spellDetail} topHpm={topHpm} topDpm={topDpm} topHpet={topHpet} topDpet={topDpet} />}
      </tr>
    );
  };

  BarHeader = () => {
    return (
      <>
        <th>Mana Spent</th>
        {this.state.showHealing &&
        <>
          <th colSpan={2} className={'text-center'}>Healing per mana spent</th>
          <th colSpan={2} className={'text-center'}>Healing per second spent casting</th>
        </>
        }
        {this.state.showDamage &&
        <>
          <th colSpan={2} className={'text-center'}>Damage per mana spent</th>
          <th colSpan={2} className={'text-center'}>Damage per second spent casting</th>
        </>
        }
      </>
    );
  };

  BarView = (props) => {
    const { spellDetail, topHpm, topDpm, topHpet, topDpet } = props;
    const hasHealing = spellDetail.healingDone;
    const hasDamage = spellDetail.damageDone > 0;
    let width = 30;
    if (this.state.showHealing) width -= 10;
    if (this.state.showDamage) width -= 10;

    return (
      <>
        <td>
          {formatNumber(spellDetail.manaSpent)}
          {' (' + formatPercentage(spellDetail.manaPercentSpent) + '%)'}
        </td>
        {this.state.showHealing &&
        <>
          <td className={'text-right'}>{hasHealing ? formatNumber(spellDetail.hpm) : '-'}</td>
          <td width={width + '%'}><PerformanceBar percent={spellDetail.hpm / topHpm} /></td>

          <td className={'text-right'}>{hasHealing ? formatNumber(spellDetail.hpet * 1000) : '-'}</td>
          <td width={width + '%'}><PerformanceBar percent={(spellDetail.hpet / topHpet)} /></td>
        </>
        }
        {this.state.showDamage &&
        <>
          <td className={'text-right'}>{hasDamage ? formatNumber(spellDetail.dpm) : '-'}</td>
          <td width={width + '%'}><PerformanceBar percent={spellDetail.dpm / topDpm} /></td>

          <td className={'text-right'}>{hasDamage ? formatNumber(spellDetail.dpet * 1000) : '-'}</td>
          <td width={width + '%'}><PerformanceBar percent={(spellDetail.dpet / topDpet)} /></td>
        </>
        }
      </>
    );
  };

  DetailHeader = () => {
    return (
      <>
        <th>
          <dfn data-tip={`Total Casts (Number of targets hit)`}>Casts</dfn>
        </th>
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
      </>
    );
  };

  DetailView = (props) => {
    const { spellDetail } = props;
    const hasHealing = spellDetail.healingDone;
    const hasOverhealing = spellDetail.healingDone > 0 || spellDetail.overhealingDone > 0;
    const hasDamage = spellDetail.damageDone > 0;

    return (
      <>
        <td>{spellDetail.casts} ({Math.floor(spellDetail.healingHits + spellDetail.damageHits)})</td>
        <td>
          {formatNumber(spellDetail.manaSpent)}
          {' (' + formatPercentage(spellDetail.manaPercentSpent) + '%)'}
        </td>
        {this.state.showHealing &&
        <>
          <td>
            {hasHealing ? formatNumber(spellDetail.healingDone) : '-'}
            {hasHealing ? ' (' + formatPercentage(spellDetail.percentHealingDone) + '%)' : ''}
          </td>
          <td>
            {hasOverhealing ? formatNumber(spellDetail.overhealingDone) : '-'}
            {hasOverhealing ? ' (' + formatPercentage(spellDetail.percentOverhealingDone) + '%)' : ''}
          </td>
          <td>{hasHealing ? formatNumber(spellDetail.hpm) : '-'}</td>
          <td>{hasHealing ? formatNumber(spellDetail.hpet * 1000) : '-'}</td>
        </>
        }
        {this.state.showDamage &&
        <>
          <td>
            {hasDamage ? formatNumber(spellDetail.damageDone) : '-'}
            {hasDamage ? ' (' + formatPercentage(spellDetail.percentDamageDone) + '%)' : ''}
          </td>
          <td>{hasDamage ? formatNumber(spellDetail.dpm) : '-'}</td>
          <td>{hasDamage ? formatNumber(spellDetail.dpet * 1000) : '-'}</td>
        </>
        }
      </>
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
                defaultChecked={false}
                icons={false}
                onChange={event => this.setState({ showCooldowns: event.target.checked })}
                id="cooldown-toggle"
              />
              <label htmlFor="cooldown-toggle" style={{ marginLeft: '0.5em' }}>
                Show Cooldowns
              </label>
            </div>
            <div className="toggle-control pull-right" style={{ 'marginLeft': '.5em', 'marginRight': '.5em' }}>
              <Toggle
                defaultChecked={false}
                icons={false}
                onChange={event => this.setState({ detailedView: event.target.checked })}
                id="detailed-toggle"
              />
              <label htmlFor="detailed-toggle" style={{ marginLeft: '0.5em' }}>
                Detailed View
              </label>
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
              <tbody>
                <this.HealingEfficiencyTable tracker={tracker} showHealing={this.state.showHealing} showDamage={this.state.showDamage} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default HealingEfficiencyBreakdown;
