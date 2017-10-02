import React from 'react';
import PropTypes from 'prop-types';

import Event from './Event';
import './EventsTab.css';

class EventsTab extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    // results: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      filter: this.filterPlayerOnly,
    };
    this.handleApplyFilterClick = this.handleApplyFilterClick.bind(this);
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

  filter = null;
  handleApplyFilterClick() {
    const value = this.filter.value;
    const isValid = !value.match(/[^=]=[^=]/);
    if (isValid) {
      this.setState({
        filter: this.filter.value,
      });
    } else {
      alert('Do not use a single "=" for checking equality; you need to use "=="!');
    }
  }
  setFilter(value) {
    this.filter.value = value;
  }
  get playerId() {
    return this.props.parser.player.id;
  }
  get filterByPlayer() {
    return `event.sourceID==${this.playerId}`;
  }
  get filterToPlayer() {
    return `event.targetID==${this.playerId}`;
  }
  get filterPlayerOnly() {
    return `(${this.filterByPlayer} || ${this.filterToPlayer})`;
  }
  get filterBuffs() {
    return `['applybuff','applybuffstack','removebuff','applydebuff','applydebuffstack','removedebuff'].includes(event.type)`;
  }
  get filterAlwaysBeCasting() {
    return `(${this.filterByPlayer} && ['begincast','cast'].includes(event.type)) || (${this.filterToPlayer} && ${this.filterBuffs})`;
  }

  render() {
    const { parser } = this.props;

    // TODO: Use react-virtualized for performance
    // TODO: Show active buffs like WCL
    // TODO: Allow searching for players by name
    // TODO: Pollish so this can be turned on for everyone

    const testFilter = Function('event', `return (${this.state.filter});`);

    return (
      <div>
        <div className="panel-heading">
          <h2>Combatlog Events</h2>
        </div>
        <div className="panel-body">
          You can access any property of the event object directly. The filter is fully JS enabled, so be extremely careful when copy-pasting a filter from someone else. Note: Rendering the list is extremely slow right now.<br /><br />

          <div className="flex" style={{ marginBottom: '1em' }}>
            <div className="flex-main">
              <textarea className="form-control" ref={elem => (this.filter = elem)} defaultValue={this.state.filter || ''} />
              <button
                type="button"
                className="btn btn-default"
                onClick={() => this.setFilter(this.filterPlayerOnly)}
              >
                Default
              </button>{' '}
              <button
                type="button"
                className="btn btn-default"
                onClick={() => this.setFilter(this.filterAlwaysBeCasting)}
                data-tip="Always be casting"
              >
                ABC
              </button>

            </div>
            <div className="flex-sub">
              <button
                type="button"
                className="btn btn-success"
                style={{ height: '100%', marginLeft: 10 }}
                onClick={this.handleApplyFilterClick}
              >
                Apply filter
              </button>
            </div>
          </div>
          <br />

          <table className="events">
            <tbody>
              {!parser.finished && (
                <tr>
                  <td>Waiting for parsing to finish...</td>
                </tr>
              )}
              {parser.finished && parser._debugEventHistory
                .map((event, i) => ({ ...event, eventUniqueId: i })) // this greatly speeds up rendering
                // .filter(event => event.eventUniqueId < 200)
                .filter(event => testFilter(event))
                .map(event => {
                  const source = event.sourceID ? this.findEntity(event.sourceID) : event.source;
                  const target = event.targetID ? this.findEntity(event.targetID) : event.target;

                  return (
                    <Event key={`${event.eventUniqueId}`} event={event} fightStart={parser.fight.start_time} source={source} target={target} />
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default EventsTab;
