import Spell from 'common/SPELLS/Spell';
import { MappedEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { PureComponent } from 'react';

import './Cooldowns.scss';
import Lane from './Lane';

interface Props {
  start: number;
  end: number;
  secondWidth: number;
  eventsBySpellId: Map<number, MappedEvent[]>;
  abilities: Abilities;
  /**
   * Show exactly a set of spells, even if not cast or if other spells are present in `eventsBySpellId`.
   *
   * Used for guides.
   */
  exactlySpells?: Spell[];
}

class Cooldowns extends PureComponent<Props> {
  getSortIndex([spellId, events]: [number, MappedEvent[]]) {
    const ability = this.props.abilities.getAbility(spellId);
    if (!ability?.timelineSortIndex) {
      return 1000 - events.length;
    } else {
      return ability.timelineSortIndex;
    }
  }

  renderLanes(eventsBySpellId: Map<number, MappedEvent[]>, growUp: boolean) {
    const entries: Array<[number, MappedEvent[]]> =
      this.props.exactlySpells?.map((spell) => [spell.id, eventsBySpellId.get(spell.id) ?? []]) ??
      Array.from(eventsBySpellId);
    return entries
      .sort((a, b) => this.getSortIndex(growUp ? b : a) - this.getSortIndex(growUp ? a : b))
      .map((item) => this.renderLane(item));
  }
  renderLane([spellId, events]: [number, MappedEvent[]]) {
    return (
      <Lane
        key={spellId}
        spell={this.props.exactlySpells?.find((spell) => spell.id === spellId)}
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
