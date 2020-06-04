import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatThousands, formatNumber, formatPercentage, formatDuration } from 'common/format';
import { TooltipElement } from 'common/Tooltip';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import { EventType } from 'parser/core/Events';
import { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';

import './Cooldown.css';

class Cooldown extends React.Component {
  static propTypes = {
    fightStart: PropTypes.number.isRequired,
    fightEnd: PropTypes.number.isRequired,
    cooldown: PropTypes.shape({
      ability: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      }),
      start: PropTypes.number.isRequired,
      end: PropTypes.number,
      events: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string.isRequired,
      })).isRequired,
      summary: PropTypes.array.isRequired,
      spell: PropTypes.shape({
        id: PropTypes.number,
        icon: PropTypes.string,
        name: PropTypes.string,
      }),
    }).isRequired,
    applyTimeFilter: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      showCastEvents: false,
      showAllEvents: false,
    };
    this.handleExpandClick = this.handleExpandClick.bind(this);
    this.handleShowHealsClick = this.handleShowHealsClick.bind(this);
  }

  handleExpandClick() {
    this.setState({
      showCastEvents: !this.state.showCastEvents,
      showAllEvents: false,
    });
  }
  handleShowHealsClick() {
    this.setState({
      showAllEvents: !this.state.showAllEvents,
    });
  }

  groupHeals(events) {
    let lastHeal = null;
    return events.reduce((results, event) => {
      if (event.type === EventType.Cast) {
        results.push(event);
      } else if (event.type === EventType.Heal) {
        const spellId = event.ability.guid;
        if (lastHeal && lastHeal.event.ability.guid === spellId) {
          lastHeal.count += 1;
          lastHeal.amount += event.amount;
          lastHeal.absorbed += (event.absorbed || 0);
          lastHeal.overheal += (event.overheal || 0);
        } else {
          const heal = {
            event,
            amount: event.amount,
            absorbed: event.absorbed || 0,
            overheal: event.overheal || 0,
            count: 1,
          };
          results.push(heal);
          lastHeal = heal;
        }
      }
      return results;
    }, []);
  }

  calculateHealingStatistics(cooldown) {
    let healingDone = 0;
    let overhealingDone = 0;
    cooldown.events.filter(event => event.type === EventType.Heal || event.type === EventType.Absorbed).forEach((event) => {
      healingDone += event.amount + (event.absorbed || 0);
      overhealingDone += event.overheal || 0;
    });

    return {
      healingDone,
      overhealingDone,
    };
  }

  calculateDamageStatistics(cooldown) {
    const damageDone = cooldown.events.reduce((acc, event) => event.type === EventType.Damage ? acc + ((event.amount || 0) + (event.absorbed || 0)) : acc, 0);

    return { damageDone };
  }

  render() {
    const { cooldown, fightStart, fightEnd } = this.props;

    let healingStatistics = null;

    const start = cooldown.start;
    const end = cooldown.end || fightEnd;

    /* eslint-disable no-script-url */
    /* eslint-disable jsx-a11y/anchor-is-valid */
    return (
      <article>
        <figure>
          <SpellLink id={cooldown.spell.id} icon={false}>
            <Icon
              icon={cooldown.spell.icon}
              alt={cooldown.spell.name}
            />
          </SpellLink>
        </figure>
        <div className="row" style={{ width: '100%' }}>
          <div className={this.state.showAllEvents ? 'col-md-12' : 'col-md-6'}>
            <header style={{ marginTop: 5, fontSize: '1.25em', marginBottom: '.1em' }}>
              <SpellLink id={cooldown.spell.id} icon={false} /> ({formatDuration((start - fightStart) / 1000)} -&gt; {formatDuration((end - fightStart) / 1000)})
              &nbsp;<TooltipElement content="Filter events to the cooldown window.">
                <a href="javascript:" onClick={() => this.props.applyTimeFilter(start - fightStart, end - fightStart)}>Filter events</a>
              </TooltipElement>
            </header>

            {!this.state.showCastEvents && (
              <div>
                {
                  cooldown.events
                    .filter(event => event.type === EventType.Cast && event.ability.guid !== 1)
                    .map((event, i) => (
                      <SpellLink key={`${event.ability.guid}-${event.timestamp}-${i}`} id={event.ability.guid} icon={false}>
                        <Icon icon={event.ability.abilityIcon} alt={event.ability.name} style={{ height: 23, marginRight: 4 }} />
                      </SpellLink>
                    ))
                }
                <div className="row">
                  <div className="col-xs-12">
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a href="javascript:void(0)" onClick={this.handleExpandClick} style={{ marginTop: '.2em' }}>More</a>
                  </div>
                </div>
              </div>
            )}

            {this.state.showCastEvents && !this.state.showAllEvents && (
              <div className="container-fluid">
                {
                  cooldown.events
                    .filter(event => event.type === EventType.Cast && event.ability.guid !== 1)
                    .map((event, i) => (
                      <div className="row" key={i}>
                        <div className="col-xs-2 text-right" style={{ padding: 0 }}>
                          +{((event.timestamp - cooldown.start) / 1000).toFixed(3)}
                        </div>
                        <div className="col-xs-10">
                          <SpellLink key={`${event.ability.guid}-${event.timestamp}-${i}`} id={event.ability.guid} icon={false}>
                            <Icon icon={event.ability.abilityIcon} alt={event.ability.name} style={{ height: 23, marginRight: 4 }} /> {event.ability.name}
                          </SpellLink>
                        </div>
                      </div>
                    ))
                }
                <div className="row">
                  <div className="col-xs-12">
                    <a href="javascript:" onClick={this.handleShowHealsClick} style={{ marginTop: '.2em' }}>Even more</a>{' | '}{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
                    <a href="javascript:" onClick={this.handleExpandClick} style={{ marginTop: '.2em' }}>Show less</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
                  </div>
                </div>
              </div>
            )}
            {this.state.showCastEvents && this.state.showAllEvents && (
              <div className="container-fluid">
                {this.groupHeals(cooldown.events.filter(event => (event.type === EventType.Cast || event.type === EventType.Heal) && event.ability.guid !== 1)).map((heal, i) => {
                  const event = heal.event || heal;
                  return (
                    <div className="row" key={i}>
                      <div className="col-xs-1 text-right" style={{ padding: 0 }}>
                        +{((event.timestamp - cooldown.start) / 1000).toFixed(3)}
                      </div>
                      <div className={`col-xs-4 ${event.type === EventType.Heal ? 'col-xs-offset-1' : ''}`}>
                        <SpellLink key={`${event.ability.guid}-${event.timestamp}-${i}`} id={event.ability.guid} icon={false}>
                          <Icon icon={event.ability.abilityIcon} alt={event.ability.name} style={{ height: 23, marginRight: 4 }} /> {event.ability.name}
                        </SpellLink>
                        {event.type === EventType.Heal && (
                          <span>
                          <span className="grouped-heal-meta amount"> x {heal.count}</span>
                          </span>
                        )}
                      </div>
                      {event.type === EventType.Heal && (
                        <div className="col-xs-4">
                          <span className="grouped-heal-meta healing"> +{formatThousands(heal.amount + heal.absorbed)}</span>
                          <span className="grouped-heal-meta overhealing"> (O: {formatThousands(heal.overheal)})</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <a href="javascript:" onClick={this.handleShowHealsClick} style={{ marginTop: '.2em' }}>Show less</a>{' | '}{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
                <a href="javascript:" onClick={this.handleExpandClick} style={{ marginTop: '.2em' }}>Show simple</a>{/* eslint-disable-line jsx-a11y/anchor-is-valid */}
              </div>
            )}
          </div>
          {!this.state.showAllEvents && (
            <div className="col-md-6">
              <div className="row">
                {cooldown.summary.map((item) => {
                  switch (item) {
                    case BUILT_IN_SUMMARY_TYPES.HEALING:
                      healingStatistics = healingStatistics || this.calculateHealingStatistics(cooldown);
                      return (
                        <div className="col-md-4 text-center" key="healing">
                          <div style={{ fontSize: '2em' }}>{formatNumber(healingStatistics.healingDone)}</div>
                          <TooltipElement content="This includes all healing that occured while the buff was up, even if it was not triggered by spells cast inside the buff duration. Any delayed healing such as HOTs, Absorbs and Atonements will stop contributing to the healing done when the cooldown buff expires, so this value is lower for any specs with such abilities.">
                            healing ({formatNumber(healingStatistics.healingDone / (end - start) * 1000)} HPS)
                          </TooltipElement>
                        </div>
                      );
                    case BUILT_IN_SUMMARY_TYPES.OVERHEALING:
                      healingStatistics = healingStatistics || this.calculateHealingStatistics(cooldown);
                      return (
                        <div className="col-md-4 text-center" key="overhealing">
                          <div style={{ fontSize: '2em' }}>{formatPercentage(healingStatistics.overhealingDone / (healingStatistics.healingDone + healingStatistics.overhealingDone))}%</div>
                          <TooltipElement content="This includes all healing that occured while the buff was up, even if it was not triggered by spells cast inside the buff duration. Any delayed healing such as HOTs, Absorbs and Atonements will stop contributing to the healing done when the cooldown buff expires, so this value is lower for any specs with such abilities.">
                            overhealing
                          </TooltipElement>
                        </div>
                      );
                    case BUILT_IN_SUMMARY_TYPES.ABSORBED: {
                      const total = cooldown.events.filter(event => event.type === EventType.Absorbed).reduce((total, event) => total + (event.amount || 0), 0);
                      return (
                        <div className="col-md-4 text-center" key="absorbed">
                          <div style={{ fontSize: '2em' }}>{formatNumber(total)}</div>
                          <TooltipElement content="This includes all damage absorbed that occured while the buff was up, even if it was not triggered by spells cast inside the buff duration.">
                            damage absorbed
                          </TooltipElement>
                        </div>
                      );
                    }
                    case BUILT_IN_SUMMARY_TYPES.ABSORBS_APPLIED: {
                      const total = cooldown.events.filter(event => event.type === EventType.ApplyBuff).reduce((total, event) => total + (event.absorb || 0), 0);
                      return (
                        <div className="col-md-4 text-center" key="absorbs-applied">
                          <div style={{ fontSize: '2em' }}>{formatNumber(total)}</div>
                          <TooltipElement content="The total amount of absorb shields applied during the buff.">
                            absorb applied
                          </TooltipElement>
                        </div>
                      );
                    }
                    case BUILT_IN_SUMMARY_TYPES.MANA: {
                      let manaUsed = 0;
                      if(cooldown.spell.id === SPELLS.INNERVATE.id) {
                        manaUsed = cooldown.events.filter(event => event.type === EventType.Cast).reduce((total, event) => total + (event.rawResourceCost[RESOURCE_TYPES.MANA.id] || 0), 0);
                      } else {
                        manaUsed = cooldown.events.filter(event => event.type === EventType.Cast).reduce((total, event) => total + (event.resourceCost[RESOURCE_TYPES.MANA.id] || 0), 0);
                      }
                      return (
                        <div className="col-md-4 text-center" key="mana">
                          <div style={{ fontSize: '2em' }}>{formatNumber(manaUsed)}</div>
                          mana used
                        </div>
                      );
                    }
                    case BUILT_IN_SUMMARY_TYPES.DAMAGE: {
                      const damageStatistics = this.calculateDamageStatistics(cooldown);
                      return (
                        <div className="col-md-4 text-center" key="damage">
                          <div style={{ fontSize: '2em' }}>{formatNumber(damageStatistics.damageDone)}</div>
                          <TooltipElement content="This number represents the total amount of damage done during the duration of this cooldown, any damage done by DOTs after the effect of this cooldown has exprired will not be included in this statistic.">
                            damage ({formatNumber(damageStatistics.damageDone / (end - start) * 1000)} DPS)
                          </TooltipElement>
                        </div>
                      );
                    }
                    default:
                      // Custom
                      return (
                        <div className="col-md-4 text-center" key={item.label}>
                          <div style={{ fontSize: '2em' }}>{typeof item.value === 'string' ? item.value : formatNumber(item.value)}</div>
                          <TooltipElement content={item.tooltip}>{item.label}</TooltipElement>
                        </div>
                      );
                  }
                })}
              </div>
            </div>
          )}
        </div>
      </article>
    );
  }
}

export default Cooldown;
