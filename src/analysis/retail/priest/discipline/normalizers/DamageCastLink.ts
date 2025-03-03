import SPELLS from 'common/SPELLS';
import {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { TALENTS_PRIEST } from 'common/TALENTS';

const BUFFER_MS = 3000;
const CAST = 'Cast';
const DAMAGE = 'Damage';

// Spells where the cast has a different ID to the damage event, where the key is the cast ID and the value is the damage ID
const SPELLS_WITH_DIFFERENT_CAST_AND_DAMAGE_IDS = {
  [SPELLS.PENANCE_CAST.id]: SPELLS.PENANCE.id,
  [TALENTS_PRIEST.HALO_SHARED_TALENT.id]: SPELLS.HALO_DAMAGE.id,
  [TALENTS_PRIEST.DIVINE_STAR_SHARED_TALENT.id]: SPELLS.DIVINE_STAR_DAMAGE.id,
  [TALENTS_PRIEST.HALO_SHADOW_TALENT.id]: SPELLS.SHADOW_HALO_DAMAGE.id,
  [TALENTS_PRIEST.DIVINE_STAR_SHADOW_TALENT.id]: SPELLS.SHADOW_DIVINE_STAR_DAMAGE.id,
  [SPELLS.DARK_REPRIMAND_CAST.id]: SPELLS.DARK_REPRIMAND_DAMAGE.id,
};

const EVENT_LINKS: EventLink[] = [
  {
    reverseLinkRelation: DAMAGE,
    linkRelation: CAST,
    referencedEventId: [
      SPELLS.VOID_BLAST_DAMAGE_DISC.id,
      SPELLS.PENANCE_CAST.id,
      SPELLS.DARK_REPRIMAND_CAST.id,
      SPELLS.SMITE.id,
      TALENTS_PRIEST.HALO_SHARED_TALENT.id,
      TALENTS_PRIEST.DIVINE_STAR_SHARED_TALENT.id,
      TALENTS_PRIEST.HALO_SHADOW_TALENT.id,
      TALENTS_PRIEST.DIVINE_STAR_SHADOW_TALENT.id,
      SPELLS.SHADOW_WORD_PAIN.id,
      TALENTS_PRIEST.SCHISM_TALENT.id,
      TALENTS_PRIEST.HOLY_NOVA_TALENT.id,
      SPELLS.MIND_BLAST.id,
      TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id,
    ],
    referencedEventType: EventType.Cast,
    linkingEventId: [
      SPELLS.VOID_BLAST_DAMAGE_DISC.id,
      SPELLS.SMITE.id,
      SPELLS.PENANCE.id,
      SPELLS.DARK_REPRIMAND_DAMAGE.id,
      SPELLS.HALO_DAMAGE.id,
      SPELLS.SHADOW_HALO_DAMAGE.id,
      SPELLS.DIVINE_STAR_DAMAGE.id,
      SPELLS.SHADOW_DIVINE_STAR_DAMAGE.id,
      SPELLS.SHADOW_WORD_PAIN.id,
      SPELLS.PURGE_THE_WICKED_BUFF.id,
      TALENTS_PRIEST.SCHISM_TALENT.id,
      TALENTS_PRIEST.HOLY_NOVA_TALENT.id,
      SPELLS.MIND_BLAST.id,
      TALENTS_PRIEST.SHADOW_WORD_DEATH_TALENT.id,
    ],
    linkingEventType: EventType.Damage,
    backwardBufferMs: BUFFER_MS,
    anyTarget: true,

    additionalCondition: (linkingEvent, referencedEvent) => {
      // If the cast and damage event have different IDs, check that the IDs match
      const damageEvent = linkingEvent as DamageEvent;
      const castEvent = referencedEvent as CastEvent;

      // If the cast and damage event have different IDs, check that the IDs match (Some spells have different IDs for the cast and damage events)
      if (SPELLS_WITH_DIFFERENT_CAST_AND_DAMAGE_IDS[castEvent.ability.guid]) {
        if (
          SPELLS_WITH_DIFFERENT_CAST_AND_DAMAGE_IDS[castEvent.ability.guid] !==
          damageEvent.ability.guid
        ) {
          return false;
        }
      } else if (castEvent.ability.guid !== damageEvent.ability.guid) {
        return false;
      }

      // a cast can only have one damage event, unless it's penance
      if (
        castEvent.ability.guid !== SPELLS.PENANCE_CAST.id &&
        castEvent.ability.guid !== SPELLS.DARK_REPRIMAND_CAST.id
      ) {
        if (GetRelatedEvents(castEvent, DAMAGE).length > 0) {
          return false;
        }
      }
      return true;
    },
  },
];

class DamageCastLink extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export function getCastAbility(event: DamageEvent) {
  return GetRelatedEvent<CastEvent>(event, CAST);
}

export default DamageCastLink;
