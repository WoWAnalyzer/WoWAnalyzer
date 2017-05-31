import React from 'react';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';

function formatThousands(number) {
  return (Math.round(number || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
function formatNumber(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}
const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};
function formatPercentage(percentage) {
  return (Math.round((percentage || 0) * 10000) / 100).toFixed(2);
}

class Cooldown extends React.Component {
  static propTypes = {
    fightStart: React.PropTypes.number.isRequired,
    fightEnd: React.PropTypes.number.isRequired,
    ShowStatistics: React.PropTypes.bool,
    showResourceStatistics: React.PropTypes.bool,
    cooldown: React.PropTypes.shape({
      ability: React.PropTypes.shape({
        id: React.PropTypes.number.isRequired,
        name: React.PropTypes.string.isRequired,
        icon: React.PropTypes.string.isRequired,
      }),
      start: React.PropTypes.number.isRequired,
      end: React.PropTypes.number,
      events: React.PropTypes.arrayOf(React.PropTypes.shape({
        type: React.PropTypes.string.isRequired,
      })).isRequired,
    }).isRequired,
  };

  constructor() {
    super();
    this.state = {
      expanded: false,
      showHeals: false,
    };
    this.handleExpandClick = this.handleExpandClick.bind(this);
    this.handleShowHealsClick = this.handleShowHealsClick.bind(this);
  }

  handleExpandClick() {
    this.setState({
      expanded: true,
    });
  }
  handleShowHealsClick() {
    this.setState({
      showHeals: true,
    });
  }

  groupHeals(events) {
    let lastHeal = null;
    let results = [];
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
    let healingDone = 0, overhealingDone = 0
    cooldown.events.filter(event => event.type === 'heal' || event.type === 'absorbed').forEach((event) => {
      healingDone += event.amount + (event.absorbed || 0);
      overhealingDone += event.overheal || 0;
    });

    return {
      healingDone,
      overhealingDone
    };
  }

  calculateDamageStatistics(cooldown) {
    let damageDone = cooldown.events.reduce((acc, event) => {
      return event.type === 'damage' ? acc + event.amount : acc
    }, 0)
    
    return {damageDone}
  }
  
  render() {
    const { cooldown, fightStart, fightEnd, showOutputStatistics, showResourceStatistics } = this.props;

    let outputStatistics, resourceStatistics;

    if (showOutputStatistics) {
      outputStatistics = cooldown.ability.cooldownType === 'HEALING' ? this.calculateHealingStatistics(cooldown) : this.calculateDamageStatistics(cooldown);
    }
    if (showResourceStatistics) {
      resourceStatistics = cooldown.events.filter(event => event.type === 'cast').reduce((mana, event) => mana + (event.manaCost || 0), 0);
    }
    
    const start = cooldown.start;
    const end = cooldown.end || fightEnd;

    /* eslint-disable no-script-url */

    return (
      <article>
        <figure>
          <SpellIcon id={cooldown.ability.id} />
        </figure>
        <div className="row" style={{ width: '100%' }}>
          <div className={showOutputStatistics ? 'col-md-6' : 'col-md-10'}>
            <header style={{ marginTop: 5, fontSize: '1.25em', marginBottom: '.1em' }}>
              <SpellLink id={cooldown.ability.id} /> ({formatDuration((start - fightStart) / 1000)} -&gt; {formatDuration((end - fightStart) / 1000)})
            </header>
            {!this.state.expanded && (
              <div>
                {cooldown.events.filter(event => event.type === 'cast' && event.ability.guid !== 1).map((event, i) => (
                  <SpellLink key={`${event.ability.guid}-${event.timestamp}-${i}`} id={event.ability.guid}>
                    <Icon icon={event.ability.abilityIcon} alt={event.ability.name} style={{ height: 23, marginRight: 4 }} />
                  </SpellLink>
                ))}<br />
                <a href="javascript:" onClick={this.handleExpandClick} style={{ marginTop: '.2em' }}>More</a>
              </div>
            )}
            {this.state.expanded && !this.state.showHeals && (
              <div>
                {cooldown.events.filter(event => event.type === 'cast' && event.ability.guid !== 1).map((event, i) => (
                  <div className="row">
                    <div className="col-xs-1 text-right" style={{ padding: 0 }}>
                      {((event.timestamp - cooldown.start) / 1000).toFixed(3)}
                    </div>
                    <div className="col-xs-11">
                      <SpellLink key={`${event.ability.guid}-${event.timestamp}-${i}`} id={event.ability.guid}>
                        <Icon icon={event.ability.abilityIcon} alt={event.ability.name} style={{ height: 23, marginRight: 4 }} /> {event.ability.name}
                      </SpellLink>
                    </div>
                  </div>
                ))}
                <a href="javascript:" onClick={this.handleShowHealsClick} style={{ marginTop: '.2em' }}>Even more</a>
              </div>
            )}
            {this.state.expanded && this.state.showHeals && (
              <div>
                {this.groupHeals(cooldown.events.filter(event => (event.type === 'cast' || event.type === 'heal') && event.ability.guid !== 1)).map((event, i) => (
                  <div className="row">
                    <div className="col-xs-1 text-right" style={{ padding: 0 }}>
                      {((event.timestamp - cooldown.start) / 1000).toFixed(3)}
                    </div>
                    <div className={`col-xs-4 ${event.type === 'heal' ? 'col-xs-offset-1' : ''}`}>
                      <SpellLink key={`${event.ability.guid}-${event.timestamp}-${i}`} id={event.ability.guid}>
                        <Icon icon={event.ability.abilityIcon} alt={event.ability.name} style={{ height: 23, marginRight: 4 }} /> {event.ability.name}
                      </SpellLink>
                      {event.type === 'heal' ? ` x ${event.count}` : ''}
                    </div>
                    <div className="col-xs-2 text-right">
                      {event.type === 'heal' ? formatThousands(event.amount + event.absorbed) : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {
            cooldown.ability.cooldownType === 'HEALING' && showOutputStatistics && (
              <div>
                <div className="col-md-2 text-center">
                  <div style={{ fontSize: '2em' }}>{formatNumber(outputStatistics.healingDone)}</div>
                  <dfn data-tip="This includes all healing the occured while the buff was up, even if it was not triggered by spells cast inside the buff duration. Any delayed healing such as HOTs, Absorbs and Atonements will stop contributing to the healing done when the cooldown buff expires, so this value is lower for any specs with such abilities.">healing ({formatNumber(outputStatistics.healingDone / (end - start) * 1000)} HPS)</dfn>
                </div>
                <div className="col-md-2 text-center">
                  <div style={{ fontSize: '2em' }}>{formatPercentage(outputStatistics.overhealingDone / (outputStatistics.healingDone + outputStatistics.overhealingDone))}%</div>
                  <dfn data-tip="This includes all healing the occured while the buff was up, even if it was not triggered by spells cast inside the buff duration. Any delayed healing such as HOTs, Absorbs and Atonements will stop contributing to the healing done when the cooldown buff expires, so this value is lower for any specs with such abilities.">overhealing</dfn>
                </div>
              </div>
            )
          }  
          {
            cooldown.ability.cooldownType === 'DAMAGE' && showOutputStatistics && (
              <div>
                <div className="col-md-2 text-center">
                  <div style={{ fontSize: '2em' }}>{formatNumber(outputStatistics.damageDone)}</div>
                  <dfn data-tip="This number represents the total amount of damage done during the duration of this cooldown, any damage done by DOTs after the effect of this cooldown has exprired will not be included in this statistic.">Damage Done</dfn>
                </div>
                <div className="col-md-2 text-center">
                  <div style={{ fontSize: '2em' }}>{formatNumber(outputStatistics.damageDone / (end - start) * 1000)} DPS</div>
                  DPS
                </div>
              </div>
            )
          }             
          {
            showResourceStatistics && (
              <div className="col-md-2 text-center">
                <div style={{ fontSize: '2em' }}>{formatNumber(resourceStatistics)}</div>
                mana used
              </div>
            )
          }
        </div>
      </article>
    );
  }
}

export default Cooldown;
