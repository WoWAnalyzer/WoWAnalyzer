import Spell from 'common/SPELLS/Spell';
import { AnyEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { PureComponent } from 'react';

import './Cooldowns.scss';
import Lane from './Lane';
import Icon from 'interface/Icon';
import { TimelineSettingsContext } from './Settings';
import { maybeGetSpell } from 'common/SPELLS';

interface Props {
  start: number;
  end: number;
  secondWidth?: number;
  eventsBySpellId: Map<number, AnyEvent[]>;
  abilities: Abilities;
  /**
   * Show exactly a set of spells, even if not cast or if other spells are present in `eventsBySpellId`.
   *
   * Used for guides.
   */
  exactlySpells?: Spell[];
  /**
   * When true, treat spell usable events as cast events for display. This is not the default on the timeline tab,
   * but is used in embedded timelines.
   */
  castsOmitted?: boolean;
}

class Cooldowns extends PureComponent<Props> {
  declare context: React.ContextType<typeof TimelineSettingsContext>;

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
        secondWidth={this.props.secondWidth ?? this.context.secondWidth}
        castableBuff={this.props.abilities.getAbility(spellId)?.timelineCastableBuff}
        castsOmitted={this.props.castsOmitted}
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
      .map(([spellId, events]) => {
        if (events.length === 0) {
          return null;
        }

        const ability = maybeGetSpell(spellId);

        return (
          <div className="legend" key={spellId}>
            {ability && <Icon icon={ability.icon} alt={ability.name} />}
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

Cooldowns.contextType = TimelineSettingsContext;

export default Cooldowns;
