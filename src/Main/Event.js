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

class Event extends React.Component {
  static propTypes = {
    event: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    fightStart: PropTypes.number.isRequired,
    source: PropTypes.object,
    target: PropTypes.object,
  };

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  shouldComponentUpdate(nextProps) {
    return nextProps.id !== this.props.id;
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

    return (
      <tr
        onClick={this.handleClick}
        data-tip={`<pre>${JSON.stringify(event, null, 2)}</pre>`}
        data-place="top"
        data-effect="solid"
        className={(event.__fabricated || event.__modified) ? 'modified' : undefined}
      >
        <td>{formatDuration(event.timestamp - fightStart)}</td>
        <td>{this.renderEntity(source)} ({event.sourceID})</td>
        <td className={event.type}>{event.type}</td>
        <td>{this.renderAbility(event.ability)}</td>
        {target ? <td>on {this.renderEntity(target)} ({event.targetID})</td> : <td />}
        <td>
          {event.type === 'damage' && (
            <span className={event.type}>
              {formatThousands(event.amount)} {event.absorbed ? <span className="absorbed">(A: {formatThousands(event.absorbed)})</span> : null} {event.blocked ? <span className="absorbed">(B: {formatThousands(event.blocked)})</span> : null}
            </span>
          )}
          {event.type === 'heal' && (
            <span className={event.type}>
              {formatThousands(event.amount)} {event.absorbed ? <span className="absorbed">(A: {formatThousands(event.absorbed)})</span> : null} {event.overheal ? <span className="overheal">(O: {formatThousands(event.overheal)})</span> : null}
            </span>
          )}
          {event.type === 'absorbed' && (
            <span className={event.type}>
              A: {formatThousands(event.amount)}
            </span>
          )}
        </td>
      </tr>
    );
  }
}

export default Event;
