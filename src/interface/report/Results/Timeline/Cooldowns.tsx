import Spell from 'common/SPELLS/Spell';
import { AbilityEvent, AnyEvent, HasAbility } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { PureComponent } from 'react';

import './Cooldowns.scss';
import Lane from './Lane';
import Icon from 'interface/Icon';
import { EventType } from 'vega';

interface Props {
  start: number;
  end: number;
  secondWidth: number;
  eventsBySpellId: Map<number, AnyEvent[]>;
  abilities: Abilities;
  /**
   * Show exactly a set of spells, even if not cast or if other spells are present in `eventsBySpellId`.
   *
   * Used for guides.
   */
  exactlySpells?: Spell[];
}

class Cooldowns extends PureComponent<Props> {
  getSortIndex([spellId, events]: [number, AnyEvent[]]) {
    const ability = this.props.abilities.getAbility(spellId);
    if (!ability?.timelineSortIndex) {
      return 1000 - events.length;
    } else {
      return ability.timelineSortIndex;
    }
  }

  renderLanes(eventsBySpellId: Map<number, AnyEvent[]>, growUp: boolean) {
    const entries: [number, AnyEvent[]][] =
      this.props.exactlySpells?.map((spell) => [spell.id, eventsBySpellId.get(spell.id) ?? []]) ??
      Array.from(eventsBySpellId);
    return entries
      .sort((a, b) => this.getSortIndex(growUp ? b : a) - this.getSortIndex(growUp ? a : b))
      .map((item) => this.renderLane(item));
  }
  renderLane([spellId, events]: [number, AnyEvent[]]) {
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
  renderLegend(eventsBySpellId: Map<number, AnyEvent[]>) {
    const entries: [number, AnyEvent[]][] =
      this.props.exactlySpells?.map((spell) => [spell.id, eventsBySpellId.get(spell.id) ?? []]) ??
      Array.from(eventsBySpellId);
    return entries
      .sort((a, b) => this.getSortIndex(a) - this.getSortIndex(b))
      .map(([_spellId, events]) => {
        const ability = (events.find(HasAbility) as AbilityEvent<EventType> | undefined)?.ability;

        return (
          <div className="legend">
            {ability && <Icon icon={ability.abilityIcon} alt={ability.name} />}
          </div>
        );
      });
  }
  render() {
    const { eventsBySpellId } = this.props;
    return (
      <div className="cooldowns">
        <div className={'legend-container'}>{this.renderLegend(eventsBySpellId)}</div>
        {this.renderLanes(eventsBySpellId, false)}
      </div>
    );
  }
}

export default Cooldowns;
