import React from 'react';
import PropTypes from 'prop-types';

import Event from './Event';
import './EventsTab.css';

class EventsTab extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
    // results: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      sourceFilter: null,
      typeFilter: null,
      abilityFilter: null,
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

  render() {
    const { parser } = this.props;

    const sourceFilterRegExp = this.state.sourceFilter && new RegExp(this.state.sourceFilter, 'i');
    const typeFilterRegExp = this.state.typeFilter && new RegExp(this.state.typeFilter, 'i');
    const abilityFilterRegExp = this.state.abilityFilter && new RegExp(this.state.abilityFilter, 'i');
    const targetFilterRegExp = this.state.targetFilter && new RegExp(this.state.targetFilter, 'i');

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
          The filters can be regular expressions (e.g. <code>cast|heal</code>). Source/target currently only search by ID. Note: Rendering the list is extremely slow right now.

          <table className="events">
            <thead>
              <tr>
                <td />
                <td>
                  <input type="text" className="form-control" onChange={e => this.setState({ sourceFilter: e.target.value })} value={this.state.sourceFilter || ''} />
                </td>
                <td>
                  <input type="text" className="form-control" onChange={e => this.setState({ typeFilter: e.target.value })} value={this.state.typeFilter || ''} />
                </td>
                <td>
                  <input type="text" className="form-control" onChange={e => this.setState({ abilityFilter: e.target.value })} value={this.state.abilityFilter || ''} />
                </td>
                <td>
                  <input type="text" className="form-control" onChange={e => this.setState({ targetFilter: e.target.value })} value={this.state.targetFilter || ''} />
                </td>
                <td />
              </tr>
            </thead>
            <tbody>
              {parser._debugEventHistory
                .map((event, i) => ({ ...event, eventUniqueId: i })) // this greatly speeds up rendering
                .filter((event) => {
                  if (sourceFilterRegExp && !sourceFilterRegExp.test(event.sourceID)) {
                    return false;
                  }
                  if (typeFilterRegExp && !typeFilterRegExp.test(event.type)) {
                    return false;
                  }
                  if (abilityFilterRegExp && event.ability && !abilityFilterRegExp.test(event.ability.name)) {
                    return false;
                  }
                  if (targetFilterRegExp && !targetFilterRegExp.test(event.targetID)) {
                    return false;
                  }
                  return true;
                })
                .map((event) => {
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
