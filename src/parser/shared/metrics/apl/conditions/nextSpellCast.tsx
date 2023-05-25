import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';

import { Condition } from '../index';

export function nextSpellCast(spell: Spell): Condition<boolean> {
  let sourceID: number;
  return {
    key: `nextSpellCast-${spell.id}`,
    init: (info) => {
      sourceID = info.playerId;
      return false;
    },
    update: (_state, event) => {
      if (event.type !== EventType.Cast) {
        return _state;
      }
      if (event.sourceID !== sourceID) {
        return _state;
      }
      if (event.ability.guid === spell.id) {
        return true;
      } else {
        return false;
      }
    },
    validate: (state, _event) => state,
    describe: () => (
      <>
        your next cast was <SpellLink id={spell.id} />
      </>
    ),
  };
}
