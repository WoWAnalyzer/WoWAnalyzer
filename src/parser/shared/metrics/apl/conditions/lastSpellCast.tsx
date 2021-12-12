import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';

import { Condition } from '../index';

export function lastSpellCast(spell: Spell): Condition<boolean> {
  let sourceID: number;
  return {
    key: `lastSpellCast-${spell.id}`,
    init: (info) => {
      //Used to avoid random trinkets, pets etc to be counted as casts originating from the player.
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
        your last cast was <SpellLink id={spell.id} />
      </>
    ),
  };
}
