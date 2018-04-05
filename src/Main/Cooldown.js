import React from 'react';
import PropTypes from 'prop-types';

import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatThousands, formatNumber, formatPercentage, formatDuration } from 'common/format';

import { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownThroughputTracker';

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
    }).isRequired,
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
    const results = [];
    events.forEach((event) => {
      if (event.type === 'cast') {
        results.push(event);
      } else if (event.type === 'heal') {
        const spellId = event.ability.guid;
        if (lastHeal && lastHeal.ability.guid === spellId) {
          lastHeal.count += 1;
          lastHeal.amount += event.amount;
          lastHeal.absorbed += (event.absorbed || 0);
          lastHeal.overheal += (event.overheal || 0);
        } else {
          const heal = {
            ...event,
            count: 1,
            absorbed: event.absorbed || 0,
            overheal: event.overheal || 0,
          };
          results.push(heal);
          lastHeal = heal;
        }
      }
    });
    return results;
  }

  calculateHealingStatistics(cooldown) {
    let healingDone = 0;
    let overhealingDone = 0;
    cooldown.events.filter(event => event.type === 'heal' || event.type === 'absorbed').forEach((event) => {
      healingDone += event.amount + (event.absorbed || 0);
      overhealingDone += event.overheal || 0;
    });

    return {
      healingDone,
      overhealingDone,
    };
  }

  calculateDamageStatistics(cooldown) {
    const damageDone = cooldown.events.reduce((acc, event) => event.type === 'damage' ? acc + event.amount : acc, 0);

    return { damageDone };
  }

  render() {
    const { cooldown, fightStart, fightEnd } = this.props;

    let healingStatistics = null;

    const start = cooldown.start;
    const end = cooldown.end || fightEnd;

    /* eslint-disable no-script-url */

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
            </header>

            {!this.state.showCastEvents && (
              <div>
                {
                  cooldown.events
                    .filter(event => event.type === 'cast' && event.ability.guid !== 1)
                    .map((event, i) => (
                      <SpellLink key={`${event.ability.guid}-${event.timestamp}-${i}`} id={event.ability.guid} icon={false}>
                        <Icon icon={event.ability.abilityIcon} alt={event.ability.name} style={{ height: 23, marginRight: 4 }} />
                      </SpellLink>
                    ))
                }
                <div className="row">
                  <div className="col-xs-12">
                    <a href="javascript:" onClick={this.handleExpandClick} style={{ marginTop: '.2em' }}>More</a>
                  </div>
                </div>
              </div>
            )}

            {this.state.showCastEvents && !this.state.showAllEvents && (
              <div className="container-fluid">
                {
                  cooldown.events
                    .filter(event => event.type === 'cast' && event.ability.guid !== 1)
                    .map((event, i) => (
                      <div className="row" key={i}>
                        <div className="col-xs-2 text-right" style={{ padding: 0 }}>
                          +{((event.timestamp - cooldown.start) / 1000).toFixed(3)}
                        </div>
                        <div className="col-xs-10">
                          <SpellLink key={`${event.ability.guid}-${event.timestamp}-${i}`} id={event.ability.guid}>
                            <Icon icon={event.ability.abilityIcon} alt={event.ability.name} style={{ height: 23, marginRight: 4 }} /> {event.ability.name}
                          </SpellLink>
                        </div>
                      </div>
                    ))
                }
                <div className="row">
                  <div className="col-xs-12">
                    <a href="javascript:" onClick={this.handleShowHealsClick} style={{ marginTop: '.2em' }}>Even more</a>{' | '}
                    <a href="javascript:" onClick={this.handleExpandClick} style={{ marginTop: '.2em' }}>Show less</a>
                  </div>
                </div>
              </div>
            )}
            {this.state.showCastEvents && this.state.showAllEvents && (
              <div className="container-fluid">
                {this.groupHeals(cooldown.events.filter(event => (event.type === 'cast' || event.type === 'heal') && event.ability.guid !== 1)).map((event, i) => (
                  <div className="row" key={i}>
                    <div className="col-xs-1 text-right" style={{ padding: 0 }}>
                      +{((event.timestamp - cooldown.start) / 1000).toFixed(3)}
                    </div>
                    <div className={`col-xs-4 ${event.type === 'heal' ? 'col-xs-offset-1' : ''}`}>
                      <SpellLink key={`${event.ability.guid}-${event.timestamp}-${i}`} id={event.ability.guid}>
                        <Icon icon={event.ability.abilityIcon} alt={event.ability.name} style={{ height: 23, marginRight: 4 }} /> {event.ability.name}
                      </SpellLink>
                      {event.type === 'heal' && (
                        <span>
                          <span className="grouped-heal-meta amount"> x {event.count}</span>
                        </span>
                      )}
                    </div>
                    {event.type === 'heal' && (
                      <div className="col-xs-4">
                        <span className="grouped-heal-meta healing"> +{formatThousands(event.amount + event.absorbed)}</span>
                        <span className="grouped-heal-meta overhealing"> (O: {formatThousands(event.overheal)})</span>
                      </div>
                    )}
                  </div>
                ))}
                <a href="javascript:" onClick={this.handleShowHealsClick} style={{ marginTop: '.2em' }}>Show less</a> {' | '}
                <a href="javascript:" onClick={this.handleExpandClick} style={{ marginTop: '.2em' }}>Show simple</a>
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
                          <dfn data-tip="This includes all healing that occured while the buff was up, even if it was not triggered by spells cast inside the buff duration. Any delayed healing such as HOTs, Absorbs and Atonements will stop contributing to the healing done when the cooldown buff expires, so this value is lower for any specs with such abilities.">healing ({formatNumber(healingStatistics.healingDone / (end - start) * 1000)} HPS)</dfn>
                        </div>
                      );
                    case BUILT_IN_SUMMARY_TYPES.OVERHEALING:
                      healingStatistics = healingStatistics || this.calculateHealingStatistics(cooldown);
                      return (
                        <div className="col-md-4 text-center" key="overhealing">
                          <div style={{ fontSize: '2em' }}>{formatPercentage(healingStatistics.overhealingDone / (healingStatistics.healingDone + healingStatistics.overhealingDone))}%</div>
                          <dfn data-tip="This includes all healing that occured while the buff was up, even if it was not triggered by spells cast inside the buff duration. Any delayed healing such as HOTs, Absorbs and Atonements will stop contributing to the healing done when the cooldown buff expires, so this value is lower for any specs with such abilities.">overhealing</dfn>
                        </div>
                      );
                    case BUILT_IN_SUMMARY_TYPES.ABSORBED: {
                      const total = cooldown.events.filter(event => event.type === 'absorbed').reduce((total, event) => total + (event.amount || 0), 0);
                      return (
                        <div className="col-md-4 text-center" key="absorbed">
                          <div style={{ fontSize: '2em' }}>{formatNumber(total)}</div>
                          <dfn data-tip="This includes all damage absorbed that occured while the buff was up, even if it was not triggered by spells cast inside the buff duration.">damage absorbed</dfn>
                        </div>
                      );
                    }
                    case BUILT_IN_SUMMARY_TYPES.ABSORBS_APPLIED: {
                      const total = cooldown.events.filter(event => event.type === 'applybuff').reduce((total, event) => total + (event.absorb || 0), 0);
                      return (
                        <div className="col-md-4 text-center" key="absorbs-applied">
                          <div style={{ fontSize: '2em' }}>{formatNumber(total)}</div>
                          <dfn data-tip="The total amount of absorb shields applied during the buff.">absorb applied</dfn>
                        </div>
                      );
                    }
                    case BUILT_IN_SUMMARY_TYPES.MANA: {
                      const manaUsed = cooldown.events.filter(event => event.type === 'cast').reduce((total, event) => total + (event.manaCost || 0), 0);
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
                          <dfn data-tip="This number represents the total amount of damage done during the duration of this cooldown, any damage done by DOTs after the effect of this cooldown has exprired will not be included in this statistic.">damage ({formatNumber(damageStatistics.damageDone / (end - start) * 1000)} DPS)</dfn>
                        </div>
                      );
                    }
                    default:
                      // Custom
                      return (
                        <div className="col-md-4 text-center" key={item.label}>
                          <div style={{ fontSize: '2em' }}>{typeof item.value === 'string' ? item.value : formatNumber(item.value)}</div>
                          <dfn data-tip={item.tooltip}>{item.label}</dfn>
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
