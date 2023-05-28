import Spell from 'common/SPELLS/Spell';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import Combatant from 'parser/core/Combatant';
import { AnyEvent, CastEvent, EventType } from 'parser/core/Events';
import { AbilityRange } from 'parser/core/modules/Abilities';
import Ability from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { Condition, PlayerInfo } from '../index';

export const dummyBuff: Spell = {
  id: 1,
  name: 'Buff',
  icon: 'buff',
};

export const dummyCast: Spell = {
  id: 2,
  name: 'Cast',
  icon: 'cast',
};

export const playerInfo: PlayerInfo = {
  playerId: 1,
  combatant: {} as unknown as Combatant,
  defaultRange: AbilityRange.Melee,
  abilities: [
    new Ability(undefined, {
      spell: dummyCast.id,
      category: SPELL_CATEGORY.ROTATIONAL,
    }),
  ],
};

export function runCondition<T>(cnd: Condition<T>, events: AnyEvent[], initialState?: T): T {
  let state = initialState ?? cnd.init(playerInfo);

  for (const event of events) {
    state = cnd.update(state, event);
  }

  return state;
}

export function cast(
  timestamp: number,
  spell: Spell,
  targetID: number = 1,
  targetInstance?: number,
): CastEvent {
  return {
    timestamp,
    type: EventType.Cast,
    ability: {
      guid: spell.id,
      name: spell.name,
      type: MAGIC_SCHOOLS.ids.PHYSICAL,
      abilityIcon: spell.icon,
    },
    sourceID: 1,
    sourceIsFriendly: true,
    targetIsFriendly: targetID === 1,
    targetID,
    targetInstance,
  };
}
