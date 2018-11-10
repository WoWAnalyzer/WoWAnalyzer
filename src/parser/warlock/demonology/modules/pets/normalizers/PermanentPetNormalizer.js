import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';
import { PERMANENT_PET_DAMAGE_TO_SUMMON_MAP, PERMANENT_PET_SUMMON_ABILITY_IDS } from '../CONSTANTS';
import { isPermanentPet } from '../helpers';

class PermanentPetNormalizer extends EventsNormalizer {
  // Warlock Pets.js depends on `summon` events for their inner works
  // in vast majority of cases, players have their permanent pets ready on pull, which means they don't get summoned, instead they already start damaging
  // because of randomness of pet ids/guids, just from that I can't know, what kind of pet was summoned, and I push in front of the timeline an "unknown permanent pet"
  // this normalizer fixes this situation by detecting first permanent pet damage ability and fabricating a summon event that Pets.js can work with

  // tries to find first permanent pet damage event (if it finds its summon first, nothing needs to be normalized), fabricates a summon event for it
  normalize(events) {
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (event.type === 'summon' && event.ability && PERMANENT_PET_SUMMON_ABILITY_IDS.includes(event.ability.guid)) {
        // first event we encountered was summon of permanent pet - pet was summoned after pull, return
        break;
      }
      if (event.type === 'damage' && event.ability && PERMANENT_PET_DAMAGE_TO_SUMMON_MAP[event.ability.guid]) {
        const petId = event.sourceID;
        if (!this._verifyPermanentPet(petId)) {
          continue;
        }
        const petInstance = event.sourceInstance;
        const spell = SPELLS[PERMANENT_PET_DAMAGE_TO_SUMMON_MAP[event.ability.guid]];
        // first event we encountered is a permanent pet damage - fabricate a summon event for it
        const fabricatedEvent = {
          timestamp: this.owner.fight.start_time,
          type: 'summon',
          sourceID: this.owner.playerId,
          targetID: petId,
          targetInstance: petInstance,
          sourceIsFriendly: true,
          targetIsFriendly: true,
          ability: {
            guid: spell.id,
            name: spell.name,
            abilityIcon: spell.icon,
          },
          __fabricated: true,
        };
        events.unshift(fabricatedEvent);
        break;
      }
    }
    return events;
  }

  _verifyPermanentPet(id) {
    // Grimoire: Felguard seems to have the same ability IDs as regular Felguard
    const guid = this.owner.playerPets.find(pet => pet.id === id).guid;
    return isPermanentPet(guid);
  }
}

export default PermanentPetNormalizer;
