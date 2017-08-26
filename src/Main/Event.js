import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import { formatThousands } from 'common/format';

function formatDuration(duration) {
  const sumSeconds = duration / 1000;
  const seconds = (sumSeconds % 60);
  const minutes = Math.floor(sumSeconds / 60);
  return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds.toFixed(3)}` : seconds.toFixed(3)}`;
}

class Event extends React.PureComponent {
  static propTypes = {
    event: PropTypes.object.isRequired,
    fightStart: PropTypes.number.isRequired,
    source: PropTypes.object.isRequired,
    target: PropTypes.object,
  };

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    console.log(this.props.event);
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
    const { event, fightStart, source, target } = this.props;

    const trimmedEvent = { ...event };
    delete trimmedEvent.ability;
    delete trimmedEvent.type;
    delete trimmedEvent.timestamp;
    delete trimmedEvent.sourceID;
    delete trimmedEvent.targetID;

    return (
      <tr onClick={this.handleClick} data-tip={`<pre>${JSON.stringify(event, null, 2)}</pre>`} data-place="left" data-effect="solid">
        <td>{formatDuration(event.timestamp - fightStart)}</td>
        <td>{this.renderEntity(source)} ({event.sourceID})</td>
        <td className={event.type}>{event.type}</td>
        <td>{this.renderAbility(event.ability)}</td>
        {target ? <td>on {this.renderEntity(target)} ({event.targetID})</td> : <td />}
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
  }
}

export default Event;
