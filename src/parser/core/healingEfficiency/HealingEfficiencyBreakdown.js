import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, formatPercentage } from 'common/format';
import Toggle from 'react-toggle';
import ReactTooltip from 'react-tooltip';
import PerformanceBar from 'common/performanceBar';
import SpellLink from 'common/SpellLink';

class HealingEfficiencyBreakdown extends React.Component {
  static propTypes = {
    tracker: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      showHealing: true,
      detailedView: false,
      showCooldowns: false,
    };
  }

  HealingEfficiencyTable = (props) => {
    const { tracker } = props;
    const { spells, topHpm, topDpm, topHpet, topDpet } = tracker.getAllSpellStats(this.state.showCooldowns);

    const spellArray = Object.values(spells);

    spellArray.sort((a, b) => {
      if (this.state.showHealing) {
        if (a.hpm < b.hpm) {
          return 1;
        }
        else if (a.hpm > b.hpm) {
          return -1;
        }
      } else {
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
          <SpellLink id={spellDetail.spell.id} />
        </td>
        {this.state.detailedView ? <this.DetailView spellDetail={spellDetail} /> : <this.BarView spellDetail={spellDetail} topHpm={topHpm} topDpm={topDpm} topHpet={topHpet} topDpet={topDpet} />}
      </tr>
    );
  };

  BarHeader = () => {
    return (
      <>
        <th>Mana Spent</th>
        {this.state.showHealing && (
          <>
            <th colSpan={2} className="text-center">Healing per mana spent</th>
            <th colSpan={2} className="text-center">Healing per second spent casting</th>
          </>
        )}
        {!this.state.showHealing && (
          <>
            <th colSpan={2} className="text-center">Damage per mana spent</th>
            <th colSpan={2} className="text-center">Damage per second spent casting</th>
          </>
        )}
      </>
    );
  };

  BarView = (props) => {
    const { spellDetail, topHpm, topDpm, topHpet, topDpet } = props;
    const hasHealing = spellDetail.healingDone;
    const hasDamage = spellDetail.damageDone > 0;
    const barWidth = 20;

    return (
      <>
        <td>
          {formatNumber(spellDetail.manaSpent)}
          {' (' + formatPercentage(spellDetail.manaPercentSpent) + '%)'}
        </td>
        {this.state.showHealing && (
          <>
            <td className="text-right">{hasHealing ? formatNumber(spellDetail.hpm) : '-'}</td>
            <td width={barWidth + '%'}><PerformanceBar percent={spellDetail.hpm / topHpm} /></td>

            <td className="text-right">{hasHealing ? formatNumber(spellDetail.hpet * 1000) : '-'}</td>
            <td width={barWidth + '%'}><PerformanceBar percent={(spellDetail.hpet / topHpet)} /></td>
          </>
        )}
        {!this.state.showHealing && (
          <>
            <td className="text-right">{hasDamage ? formatNumber(spellDetail.dpm) : '-'}</td>
            <td width={barWidth + '%'}><PerformanceBar percent={spellDetail.dpm / topDpm} /></td>

            <td className="text-right">{hasDamage ? formatNumber(spellDetail.dpet * 1000) : '-'}</td>
            <td width={barWidth + '%'}><PerformanceBar percent={(spellDetail.dpet / topDpet)} /></td>
          </>
        )}
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
        {this.state.showHealing && (
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
        )}
        {!this.state.showHealing && (
          <>
            <th>Damage Done</th>
            <th>
              <dfn data-tip={`Damage per mana spent casting the spell`}>DPM</dfn>
            </th>
            <th>
              <dfn data-tip={`Damage per second spent casting the spell`}>DPET</dfn>
            </th>
          </>
        )}
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
        <td>{spellDetail.casts} ({this.state.showHealing ? Math.floor(spellDetail.healingHits) : Math.floor(spellDetail.damageHits)})</td>
        <td>
          {formatNumber(spellDetail.manaSpent)}
          {' (' + formatPercentage(spellDetail.manaPercentSpent) + '%)'}
        </td>
        {this.state.showHealing && (
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
        )}
        {!this.state.showHealing && (
          <>
            <td>
              {hasDamage ? formatNumber(spellDetail.damageDone) : '-'}
              {hasDamage ? ' (' + formatPercentage(spellDetail.percentDamageDone) + '%)' : ''}
            </td>
            <td>{hasDamage ? formatNumber(spellDetail.dpm) : '-'}</td>
            <td>{hasDamage ? formatNumber(spellDetail.dpet * 1000) : '-'}</td>
          </>
        )}
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
            <div className="pull-left">
              <div className="toggle-control pull-right" style={{ marginLeft: '.5em', marginRight: '.5em' }}>
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
            <div className="pull-right">
              <div className="toggle-control pull-left" style={{ marginLeft: '.5em', marginRight: '.5em' }}>
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
              <div className="toggle-control pull-left" style={{ marginLeft: '.5em', marginRight: '.5em' }}>
                <label htmlFor="healing-toggle" style={{ marginLeft: '0.5em', marginRight: '1em' }}>
                  Show Damage
                </label>
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
                <this.HealingEfficiencyTable tracker={tracker} showHealing={this.state.showHealing} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default HealingEfficiencyBreakdown;
