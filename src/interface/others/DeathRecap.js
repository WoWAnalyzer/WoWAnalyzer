import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import WarcraftLogsIcon from 'interface/icons/WarcraftLogs';
import Tooltip, { TooltipElement } from 'common/Tooltip';
import { EventType } from 'parser/core/Events';

const SHOW_SECONDS_BEFORE_DEATH = 10;
const AMOUNT_THRESHOLD = 0;

class DeathRecap extends React.PureComponent {
  static propTypes = {
    events: PropTypes.array.isRequired,
    enemies: PropTypes.object.isRequired,
    combatants: PropTypes.object.isRequired,
    report: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      detailedView: 0,
      amountThreshold: AMOUNT_THRESHOLD,
    };
    this.handleClick = this.handleClick.bind(this);
    this.filterDeath = this.filterDeath.bind(this);
  }

  handleClick(event) {
    const clicked = event === this.state.detailedView ? -1 : event;
    this.setState({ detailedView: clicked });
  }

  filterDeath(event, i) {
    const start = this.props.report.fight.offset_time + (i !== 0 && this.props.events[i-1].deathtime - this.props.report.fight.start_time);
    const end = event.deathtime + this.props.report.fight.offset_time - this.props.report.fight.start_time;
    this.props.report.applyTimeFilter(start, end);
  }

  render() {
    let lastHitPoints = 0;
    let lastMaxHitPoints = 0;

    function sortByTimelineIndex(a, b) {
      return a.timelineSortIndex - b.timelineSortIndex;
    }

    const sliderProps = {
      min: 0,
      max: 0.5,
      step: 0.05,
      marks: {
        0: '0%',
        0.05: '5%',
        0.1: '10%',
        0.15: '15%',
        0.2: '20%',
        0.25: '25%',
        0.3: '30%',
        0.35: '35%',
        0.4: '40%',
        0.45: '45%',
        0.5: '50%',
      },
      style: {
        margin: '0 5px',
      },
    };

    const events = this.props.events;
    /* eslint-disable no-script-url */
    /* eslint-disable jsx-a11y/anchor-is-valid */
    return (
      <>
        <div className="pad" style={{ marginBottom: 15 }}>
          <div className="row">
            <div className="col-md-8">
              <div>
                Filter events based on min amount (percentage of players health):
              </div>
              <Slider
                {...sliderProps}
                defaultValue={this.state.amountThreshold}
                onChange={(value) => {
                  this.setState({
                    amountThreshold: value,
                  });
                }}
              />
            </div>
            <div className="col-md-4">
              <Tooltip content="Open the deaths on Warcraft Logs">
                <a
                  href={`https://www.warcraftlogs.com/reports/${this.props.report.report.code}#fight=${this.props.report.fight.id}&type=deaths&source=${this.props.report.player.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ fontSize: 24 }}
                >
                  <WarcraftLogsIcon /> Warcraft Logs
                </a>
              </Tooltip>
            </div>
          </div>
        </div>
        {events.map((death, i) => (
          <React.Fragment key={i}>
            <div style={{display: 'block'}}>
              <h2 onClick={() => this.handleClick(i)} style={{ padding: '10px 20px', cursor: 'pointer', display: 'inline-block' }}>Death #{i + 1}</h2>
              <TooltipElement content="Filter events to the time between either the start of combat or your last death (whichever happened more recently) and this death.">
                <a href="javascript:" onClick={() => this.filterDeath(death, i)}>Filter to prior events</a>
              </TooltipElement>
            </div>
            <table style={{ display: this.state.detailedView === i ? 'block' : 'none' }} className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Ability</th>
                  <th>HP</th>
                  <th>Amount</th>
                  <th>Defensive Buffs/Debuffs</th>
                  <th>Personals available</th>
                </tr>
              </thead>
              <tbody>
                {death.events
                  .filter(e => e.timestamp <= death.deathtime && e.timestamp >= death.deathtime - (SHOW_SECONDS_BEFORE_DEATH * 1000))
                  .filter(e => ((e.amount + (e.absorbed || 0)) / e.maxHitPoints > this.state.amountThreshold) || e.type === EventType.Instakill)
                  .map((event, eventIndex) => {
                    if (event.hitPoints && event.maxHitPoints) {
                      lastHitPoints = event.hitPoints;
                      lastMaxHitPoints = event.maxHitPoints;
                    }

                    const hitPercent = event.amount / lastMaxHitPoints;
                    let percent = 0;
                    let output = null;
                    //name = either NPC-Name > sourceID-Name > Ability-Name as fallback
                    let sourceName = event.source && event.source.type === 'NPC' ? event.source.name : null;
                    if (!sourceName && event.type === EventType.Heal) {
                      sourceName = this.props.combatants[event.sourceID] ? this.props.combatants[event.sourceID]._combatantInfo.name : null;
                    }
                    if (!sourceName && event.type === EventType.Damage) {
                      sourceName = this.props.enemies[event.sourceID] ? this.props.enemies[event.sourceID]._baseInfo.name : null;
                    }
                    if (!sourceName && event.type !== EventType.Instakill) {
                      sourceName = event.ability.name;
                    }

                    if (event.type === EventType.Heal) {
                      percent = (lastHitPoints - event.amount) / lastMaxHitPoints;
                      output = (
                        <TooltipElement
                          content={(
                            <>
                              {event.sourceID === event.targetID ?
                                `You healed yourself for ${formatNumber(event.amount)}` :
                                `${sourceName} healed you for ${formatNumber(event.amount)}`
                              }
                              {event.absorbed > 0 ? `, ${formatNumber(event.absorbed)} of that healing was absorbed` : ''}
                              {event.overheal > 0 ? ` and overhealed for ${formatNumber(event.overheal)}` : ''}
                            </>
                          )}
                          style={(event.amount === 0 && event.absorbed > 0) ? { color: 'orange' } : { color: 'green' }}
                        >
                          +{formatNumber(event.amount)} {event.absorbed > 0 ? `(A: ${formatNumber(event.absorbed)} )` : ''} {event.overheal > 0 ? `(O: ${formatNumber(event.overheal)} )` : ''}
                        </TooltipElement>
                      );
                    } else if (event.type === EventType.Damage) {
                      percent = lastHitPoints / lastMaxHitPoints;
                      output = (
                        <TooltipElement
                          content={(
                            <>
                              {event.sourceID === event.targetID ?
                                `You damaged yourself for ${formatNumber(event.amount)}` :
                                `${sourceName} damaged you for a total of ${formatNumber(event.amount + (event.absorbed || 0))}`
                              }<br />
                              {event.absorbed > 0 ? <>{formatNumber(event.absorbed)} of this damage was absorbed and you took {formatNumber(event.amount)} damage<br /></> : ''}
                            </>
                          )}
                          style={{ color: 'red' }}
                        >
                          -{formatNumber(event.amount)} {event.absorbed > 0 ? `(A: ${formatNumber(event.absorbed)} )` : ''}
                        </TooltipElement>
                      );
                    } else if (event.type === EventType.Instakill) {
                      percent = 0;
                      output = '1-Shot';
                    }

                    if (event.overkill || event.hitPoints === 0) {
                      percent = 0;
                    }

                    return (
                      <tr key={eventIndex}>
                        <td style={{ width: '5%' }}>
                          {formatDuration((event.time + this.props.report.fight.offset_time) / 1000, 2)}
                        </td>
                        <td style={{ width: '20%' }}>
                          <SpellLink id={event.ability.guid} icon={false}>
                            <Icon icon={event.ability.abilityIcon} /> {event.ability.name}
                          </SpellLink>
                        </td>
                        <td style={{ width: '20%' }}>
                          <div className="flex performance-bar-container">
                            {percent !== 0 && (
                              <div className="flex-sub performance-bar" style={{ color: 'white', width: formatPercentage(percent) + '%' }} />
                            )}
                            <div
                              className="flex-sub performance-bar"
                              style={{
                                backgroundColor: event.type === EventType.Heal ? 'green' : 'red',
                                width: formatPercentage(hitPercent) + '%',
                                opacity: event.type === EventType.Heal ? .8 : .4,
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ width: '15%' }}>
                          {output}
                        </td>
                        <td style={{ width: '20%' }}>
                          {event.buffsUp && event.buffsUp.sort(sortByTimelineIndex).map(e =>
                            <SpellIcon key={e.id} style={{ border: '1px solid rgba(0, 0, 0, 0)' }} id={e.id} />,
                          )}<br />
                          {event.debuffsUp && event.debuffsUp.sort(sortByTimelineIndex).map(e =>
                            <SpellIcon key={e.id} style={{ border: '1px solid red' }} id={e.id} />,
                          )}
                        </td>
                        <td style={{ width: '20%' }}>
                          {event.defensiveCooldowns.sort(sortByTimelineIndex).map(e =>
                            <SpellIcon key={e.id} style={{ opacity: e.cooldownReady ? 1 : .2 }} id={e.id} />,
                          )}
                        </td>
                      </tr>
                    );
                  })}
                <tr>
                  <td />
                  <td colSpan="6">
                    You died
                  </td>
                </tr>
              </tbody>
            </table>
          </React.Fragment>
        ))}
      </>
    );
  }
}

export default DeathRecap;
