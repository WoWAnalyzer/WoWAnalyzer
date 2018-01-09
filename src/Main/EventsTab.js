import React from 'react';
import PropTypes from 'prop-types';

import './EventsTab.css';
import EventsTable from './EventsTable';

class EventsTab extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    // results: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      filter: this.filterPlayerOnly,
      tester: Function('event', `return (${this.filterPlayerOnly});`), // eslint-disable-line no-new-func
      newFilterValue: this.filterPlayerOnly,
    };
    this.handleNewFilterValueChange = this.handleNewFilterValueChange.bind(this);
    this.handleApplyFilterClick = this.handleApplyFilterClick.bind(this);
    this.findEntity = this.findEntity.bind(this);
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

  handleNewFilterValueChange(e) {
    this.setState({
      newFilterValue: e.target.value,
    });
  }
  handleApplyFilterClick() {
    const value = this.state.newFilterValue;
    const isValid = !value.match(/[^=]=[^=]/);
    if (isValid) {
      this.setState({
        filter: value,
        tester: Function('event', `return (${value});`), // eslint-disable-line no-new-func
      });
    } else {
      alert('Do not use a single "=" for checking equality; you need to use "=="!');
    }
  }
  setFilter(value) {
    this.setState({
      newFilterValue: value,
    });
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

    return (
      <div>
        <div className="panel-heading">
          <h2>Combatlog Events</h2>
        </div>
        <div className="panel-body">
          You can access any property of the event object directly. The filter is fully JS enabled, so be extremely careful when copy-pasting a filter from someone else. Note: Rendering the list is extremely slow right now.<br /><br />

          <div className="flex" style={{ marginBottom: '1em' }}>
            <div className="flex-main">
              <textarea
                className="form-control"
                value={this.state.newFilterValue || ''}
                onChange={this.handleNewFilterValueChange}
              />
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
                onClick={() => this.setFilter('true')}
              >
                All
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
                disabled={this.state.newFilterValue === this.state.filter}
              >
                Apply filter
              </button>
            </div>
          </div>
          <br />

          {!parser.finished && (
            <div className="alert alert-info">Waiting for parsing to finish...</div>
          )}
          {parser.finished && (
            <EventsTable
              events={parser._debugEventHistory}
              filter={this.state.tester}
              fightStart={parser.fight.start_time}
              findEntity={this.findEntity}
            />
          )}
        </div>
      </div>
    );
  }
}

export default EventsTab;
