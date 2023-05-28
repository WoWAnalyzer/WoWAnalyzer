import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

import { Condition, tenseAlt } from '../index';

import { TargetOptions, getTargets } from './debuffMissing';

export function debuffPresent(spell: Spell, targetOptions?: TargetOptions): Condition<Set<string>> {
  return {
    key: `debuffPresent-${spell.id}`,
    init: () => new Set(),
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyDebuff:
        case EventType.ApplyDebuffStack:
          if (event.ability.guid === spell.id) {
            state.add(encodeTargetString(event.targetID, event.targetInstance));
            return state;
          }
          break;
        case EventType.RemoveDebuff:
          if (event.ability.guid === spell.id) {
            state.delete(encodeTargetString(event.targetID, event.targetInstance));
            return state;
          }
          break;
      }
      return state;
    },
    validate: (state, event) => {
      const targets = getTargets(event, targetOptions?.targetLinkRelation);
      return targets.some((target) => state.has(target));
    },
    describe: (tense) => (
      <>
        <SpellLink id={spell.id} /> {tenseAlt(tense, 'is', 'was')} present on target
      </>
    ),
  };
}
