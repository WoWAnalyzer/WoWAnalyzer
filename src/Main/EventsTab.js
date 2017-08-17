import React from 'react';
import PropTypes from 'prop-types';

import SPECS from 'common/SPECS';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import './EventsTab.css';

function formatDuration(duration) {
  const sumSeconds = duration / 1000;
  const seconds = (sumSeconds % 60);
  const minutes = Math.floor(sumSeconds / 60);
  return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds.toFixed(3)}` : seconds.toFixed(3)}`;
}

class EventsTab extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    // results: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      page: 0,
    };
  }

  findEntity(id) {
    const friendly = this.props.parser.report.friendlies.find(friendly => friendly.id === id);
    if (friendly) {
      return friendly;
    }
    const enemy = this.props.parser.report.enemies.find(enemy => enemy.id === id);
    if (enemy) {
      return enemy;
    }
    return null;
  }

  renderEntity(entity) {
    if (!entity) {
      return null;
    }
    return <span className={entity.type}>{entity.name}</span>;
  }
  renderAbility(ability) {
    if (!ability) {
      return null;
    }
    const spellId = ability.guid;
    const exists = !!SPELLS[spellId];

    return (
      <a href={`http://www.wowhead.com/spell=${spellId}`} target="_blank" rel="noopener noreferrer" className={exists ? 'exists' : 'missing'}>
        {exists ? '✔' : '✖'} <Icon icon={ability.abilityIcon} /> {ability.name}
      </a>
    );
  }

  render() {
    const { parser } = this.props;

    return (
      <div>
        <div className="panel-heading">
          <h2>Combatlog Events</h2>
        </div>
        <div className="panel-body">
          <table className="events">
            {parser._debugEventHistory.map((event, index) => {
              const source = event.sourceID ? this.findEntity(event.sourceID) : event.source;
              const target = event.targetID ? this.findEntity(event.targetID) : event.target;

              const trimmedEvent = { ...event };
              delete trimmedEvent.ability;
              delete trimmedEvent.type;
              delete trimmedEvent.timestamp;
              delete trimmedEvent.sourceID;
              delete trimmedEvent.targetID;

              return (
                <tr key={index} onClick={() => console.log(event)} data-tip={`<pre>${JSON.stringify(event, null, 2)}</pre>`} data-place="left" data-effect="solid">
                  <td>{formatDuration(event.timestamp - parser.fight.start_time)}</td>
                  <td>{this.renderEntity(source)}</td>
                  <td>{event.type}</td>
                  <td>{this.renderAbility(event.ability)}</td>
                  {target ? <td>on {this.renderEntity(target)}</td> : <td />}
                  <td>
                    {event.type === 'damage' && (
                      <span className={event.type}>
                        {formatThousands(event.amount)} {event.absorbed ? <span className="absorbed">(A: {formatThousands(event.absorbed)})</span> : null}
                      </span>
                    )}
                    {event.type === 'heal' && (
                      <span className={event.type}>
                        {formatThousands(event.amount)} {event.absorbed ? <span className="absorbed">(A: {formatThousands(event.absorbed)})</span> : null} {event.overheal ? <span className="overheal">(O: {formatThousands(event.overheal)})</span> : null}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </table>
        </div>
      </div>
    );
  }
}

export default EventsTab;
