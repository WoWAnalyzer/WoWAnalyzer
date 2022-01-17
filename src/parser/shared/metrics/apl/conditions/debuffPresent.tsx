import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

import { Condition, tenseAlt } from '../index';

export function debuffPresent(spell: Spell): Condition<number[]> {
  return {
    key: `debuffPresent-${spell.id}`,
    init: () => [],
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyDebuff:
        case EventType.ApplyDebuffStack:
          if (event.ability.guid === spell.id) {
            state.push(Number(encodeTargetString(event.targetID, event.targetInstance ?? 1)));
            return state;
          }
          break;
        case EventType.RemoveDebuff:
          if (event.ability.guid === spell.id) {
            const index = state.indexOf(
              Number(encodeTargetString(event.targetID, event.targetInstance ?? 1)),
            );
            state.splice(index, 1);
            return state;
          }
          break;
      }
      return state;
    },
    validate: (state, event) => {
      if (event.targetID) {
        return state.includes(
          Number(encodeTargetString(event.targetID, event.targetInstance ?? 1)),
        );
      } else {
        return false;
      }
    },
    describe: (tense) => (
      <>
        <SpellLink id={spell.id} /> {tenseAlt(tense, 'is', 'was')} present on target
      </>
    ),
  };
}
