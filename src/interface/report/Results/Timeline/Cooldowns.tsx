import { AnyEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import React from 'react';

import './Cooldowns.scss';
import Lane from './Lane';

interface Props {
  start: number;
  end: number;
  secondWidth: number;
  eventsBySpellId: Map<number, AnyEvent[]>;
  abilities: Abilities;
}

class Cooldowns extends React.PureComponent<Props> {
  getSortIndex([spellId, events]: [number, AnyEvent[]]) {
    const ability = this.props.abilities.getAbility(spellId);
    if (!ability?.timelineSortIndex) {
      return 1000 - events.length;
    } else {
      return ability.timelineSortIndex;
    }
  }

  renderLanes(eventsBySpellId: Map<number, AnyEvent[]>, growUp: boolean) {
    return Array.from(eventsBySpellId)
      .sort((a, b) => this.getSortIndex(growUp ? b : a) - this.getSortIndex(growUp ? a : b))
      .map((item) => this.renderLane(item));
  }
  renderLane([spellId, events]: [number, AnyEvent[]]) {
    return (
      <Lane
        key={spellId}
        spellId={spellId}
        fightStartTimestamp={this.props.start}
        fightEndTimestamp={this.props.end}
        secondWidth={this.props.secondWidth}
        castableBuff={this.props.abilities.getAbility(spellId)?.timelineCastableBuff}
      >
        {events}
      </Lane>
    );
  }
  render() {
    const { eventsBySpellId } = this.props;
    return <div className="cooldowns">{this.renderLanes(eventsBySpellId, false)}</div>;
  }
}

export default Cooldowns;
