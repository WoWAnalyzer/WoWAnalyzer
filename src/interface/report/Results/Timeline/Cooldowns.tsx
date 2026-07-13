import Spell from 'common/SPELLS/Spell';
import { AnyEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { PureComponent } from 'react';

import './Cooldowns.scss';
import Lane from './Lane';
import Icon from 'interface/Icon';
import { TimelineSettingsContext } from './Settings';
import { maybeGetSpell } from 'common/SPELLS';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

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
  /**
   * Sort in a consistent order, regardless of data. This is used by embedded timelines in the cooldown to make sure
   * that every cooldown window shows the spells in the same order.
   */
  fixedCooldownOrder?: boolean;
  disableLegend?: boolean;
  visibleSpellCategories?: Set<keyof typeof SPELL_CATEGORY>;
}

class Cooldowns extends PureComponent<Props> {
  declare context: React.ContextType<typeof TimelineSettingsContext>;

  getSortIndex([spellId, events]: [number, AnyEvent[]]): number {
    const ability = this.props.abilities.getAbility(spellId);
    if (ability?.timelineSortIndex !== null && ability?.timelineSortIndex !== undefined) {
      return ability.timelineSortIndex;
    }

    if (this.props.fixedCooldownOrder) {
      return ability?.cooldown ?? 0;
    }

    return 1000 - events.length;
  }

  private filterEntriesBySpellCategory(entries: [number, AnyEvent[]][]): [number, AnyEvent[]][] {
    if (!this.props.visibleSpellCategories) {
      return entries;
    }

    return entries.filter(([spellId]) => {
      const ability = this.props.abilities.getAbility(spellId);
      if (!ability) {
        return false;
      }
      //@ts-expect-error This is a type error, but we know that ability.category is a key of SPELL_CATEGORY
      return this.props.visibleSpellCategories?.has(ability.category);
    });
  }

  private sortEntries(entries: [number, AnyEvent[]][], growUp: boolean) {
    const filteredEntries = this.filterEntriesBySpellCategory(entries);
    filteredEntries.sort(
      (a, b) => this.getSortIndex(growUp ? b : a) - this.getSortIndex(growUp ? a : b),
    );
    return filteredEntries;
  }

  renderLanes(eventsBySpellId: Map<number, AnyEvent[]>, growUp: boolean) {
    const entries: [number, AnyEvent[]][] =
      this.props.exactlySpells?.map((spell) => [spell.id, eventsBySpellId.get(spell.id) ?? []]) ??
      Array.from(eventsBySpellId);
    const sortedEntries = this.sortEntries(entries, growUp);
    return sortedEntries.map((item) => this.renderLane(item));
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
  renderLegend(eventsBySpellId: Map<number, AnyEvent[]>, growUp: boolean) {
    const entries: [number, AnyEvent[]][] =
      this.props.exactlySpells?.map((spell) => [spell.id, eventsBySpellId.get(spell.id) ?? []]) ??
      Array.from(eventsBySpellId);

    const sortedEntries = this.sortEntries(entries, growUp);

    return sortedEntries.map(([spellId, events]) => {
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
        {!this.props.disableLegend && (
          <div className={'legend-container'}>{this.renderLegend(eventsBySpellId, false)}</div>
        )}
        {this.renderLanes(eventsBySpellId, false)}
      </div>
    );
  }
}

Cooldowns.contextType = TimelineSettingsContext;

export default Cooldowns;
