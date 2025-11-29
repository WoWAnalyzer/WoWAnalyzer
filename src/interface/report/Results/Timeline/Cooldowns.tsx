import Spell from 'common/SPELLS/Spell';
import { AnyEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';

import './Cooldowns.scss';
import Lane from './Lane';

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

const Cooldowns = ({
  start,
  end,
  secondWidth,
  eventsBySpellId,
  abilities,
  exactlySpells,
}: Props) => {
  const getSortIndex = ([spellId, events]: [number, AnyEvent[]]) => {
    const ability = abilities.getAbility(spellId);

    if (!ability?.timelineSortIndex) {
      return 1000 - events.length;
    }
    return ability.timelineSortIndex;
  };

  const renderLanes = (eventsBySpellId: Map<number, AnyEvent[]>, growUp: boolean) => {
    const entries: [number, AnyEvent[]][] =
      exactlySpells?.map((spell) => [spell.id, eventsBySpellId.get(spell.id) ?? []]) ??
      Array.from(eventsBySpellId);
    return entries
      .sort((a, b) => getSortIndex(growUp ? b : a) - getSortIndex(growUp ? a : b))
      .map((item) => renderLane(item));
  };

  const renderLane = ([spellId, events]: [number, AnyEvent[]]) => {
    return (
      <Lane
        key={spellId}
        spell={exactlySpells?.find((spell) => spell.id === spellId)}
        fightStartTimestamp={start}
        fightEndTimestamp={end}
        secondWidth={secondWidth}
        castableBuff={abilities.getAbility(spellId)?.timelineCastableBuff}
      >
        {events}
      </Lane>
    );
  };

  return <div className="cooldowns">{renderLanes(eventsBySpellId, false)}</div>;
};

export default Cooldowns;
