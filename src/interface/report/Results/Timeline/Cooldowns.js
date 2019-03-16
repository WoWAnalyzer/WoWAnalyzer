import React from 'react';
import PropTypes from 'prop-types';

import Abilities from 'parser/core/modules/Abilities';

import './Cooldowns.scss';
import Lane from './Lane';

class Cooldowns extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
    eventsBySpellId: PropTypes.instanceOf(Map).isRequired,
    abilities: PropTypes.instanceOf(Abilities).isRequired,
  };

  getSortIndex([spellId, events]) {
    const ability = this.props.abilities.getAbility(spellId);
    if (!ability || ability.timelineSortIndex === undefined) {
      return 1000 - events.length;
    } else {
      return ability.timelineSortIndex;
    }
  }

  renderLanes(eventsBySpellId, growUp) {
    return Array.from(eventsBySpellId)
      .sort((a, b) => this.getSortIndex(growUp ? b : a) - this.getSortIndex(growUp ? a : b))
      .map(item => this.renderLane(item));
  }
  renderLane([spellId, events]) {
    return (
      <Lane
        key={spellId}
        spellId={spellId}
        fightStartTimestamp={this.props.start}
        fightEndTimestamp={this.props.end}
        secondWidth={this.props.secondWidth}
      >
        {events}
      </Lane>
    );
  }
  render() {
    const { eventsBySpellId } = this.props;
    return (
      <div className="cooldowns">
        {this.renderLanes(eventsBySpellId, false)}
      </div>
    );
  }
}

export default Cooldowns;
